import { Gig } from "../models/gig.model.js";
import { Bid } from "../models/bid.model.js";

export const createGig = async (req, res) => {
    try {
        const { title, description, budget } = req.body;
        const userId = req.id;

        if (!title || !description || !budget) {
            return res.status(400).json({
                message: "Title, description, and budget are required",
                success: false
            })
        }

        const gig = await Gig.create({
            title,
            description,
            budget: Number(budget),
            ownerId: userId
        });

        return res.status(201).json({
            message: "Gig created successfully.",
            gig,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const getAllGigs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            status: 'open',
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };

        const gigs = await Gig.find(query)
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            gigs,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const getGigById = async (req, res) => {
    try {
        const gigId = req.params.id;
        const gig = await Gig.findById(gigId).populate('ownerId', 'name email');
        if (!gig) {
            return res.status(404).json({
                message: "Gig not found.",
                success: false
            })
        }
        return res.status(200).json({ gig, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const getMyGigs = async (req, res) => {
    try {
        const userId = req.id;
        const gigs = await Gig.find({ ownerId: userId })
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            gigs,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}


export const deleteGig = async (req, res) => {
    try {
        const gigId = req.params.id;
        const userId = req.id;

        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({
                message: "Gig not found",
                success: false
            })
        }

        if (gig.ownerId.toString() !== userId) {
            return res.status(403).json({
                message: "You can only delete your own gigs",
                success: false
            })
        }

        // Delete all bids associated with this gig
        await Bid.deleteMany({ gigId });

        // Delete the gig
        await Gig.findByIdAndDelete(gigId);

        return res.status(200).json({
            message: "Gig deleted successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}
