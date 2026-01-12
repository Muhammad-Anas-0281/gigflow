import { Bid } from "../models/bid.model.js";
import { Gig } from "../models/gig.model.js";
import mongoose from "mongoose";

export const submitBid = async (req, res) => {
    try {
        const { message, price } = req.body;
        const { gigId } = req.params;
        const freelancerId = req.id;

        if (!message || !price) {
            return res.status(400).json({
                message: "Message and price are required",
                success: false
            })
        }

        // Check if gig exists and is open
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({
                message: "Gig not found",
                success: false
            })
        }

        if (gig.status !== 'open') {
            return res.status(400).json({
                message: "This gig is no longer accepting bids",
                success: false
            })
        }

        // Check if user is the owner
        if (gig.ownerId.toString() === freelancerId) {
            return res.status(400).json({
                message: "You cannot bid on your own gig",
                success: false
            })
        }

        // Check if user has already bid on this gig
        const existingBid = await Bid.findOne({ gigId, freelancerId });
        if (existingBid) {
            return res.status(400).json({
                message: "You have already submitted a bid for this gig",
                success: false
            });
        }

        const bid = await Bid.create({
            gigId,
            freelancerId,
            message,
            price: Number(price)
        });

        return res.status(201).json({
            message: "Bid submitted successfully.",
            bid,
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

export const getBidsByGigId = async (req, res) => {
    try {
        const { gigId } = req.params;
        const userId = req.id;

        // Check if gig exists and user is the owner
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({
                message: "Gig not found",
                success: false
            })
        }

        if (gig.ownerId.toString() !== userId) {
            return res.status(403).json({
                message: "You are not authorized to view bids for this gig",
                success: false
            })
        }

        const bids = await Bid.find({ gigId })
            .populate('freelancerId', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            bids,
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

export const getMyBids = async (req, res) => {
    try {
        const userId = req.id;
        const bids = await Bid.find({ freelancerId: userId })
            .populate('gigId')
            .populate('freelancerId', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            bids,
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

export const hireBid = async (req, res) => {
    try {
        const { bidId } = req.params;
        const userId = req.id;

        // Start a MongoDB session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find the bid and populate gig
            const bid = await Bid.findById(bidId).populate('gigId').session(session);
            if (!bid) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    message: "Bid not found",
                    success: false
                })
            }

            const gig = bid.gigId;

            // Verify user is the gig owner
            if (gig.ownerId.toString() !== userId) {
                await session.abortTransaction();
                session.endSession();
                return res.status(403).json({
                    message: "You are not authorized to hire for this gig",
                    success: false
                })
            }

            // Check if gig is still open (critical for race condition prevention)
            if (gig.status !== 'open') {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    message: "This gig has already been assigned",
                    success: false
                })
            }

            // Perform all updates in transaction
            // 1. Mark gig as assigned
            await Gig.findByIdAndUpdate(
                gig._id,
                { status: 'assigned' },
                { session }
            );

            // 2. Mark selected bid as hired
            await Bid.findByIdAndUpdate(
                bidId,
                { status: 'hired' },
                { session }
            );

            // 3. Mark all other bids for this gig as rejected
            await Bid.updateMany(
                {
                    gigId: gig._id,
                    _id: { $ne: bidId }
                },
                { status: 'rejected' },
                { session }
            );

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            // Emit socket event to notify the hired freelancer
            // We'll get the io instance from req.app.get('io')
            const io = req.app.get('io');
            if (io) {
                io.to(bid.freelancerId.toString()).emit('hired', {
                    message: `You have been hired for ${gig.title}!`,
                    gig: {
                        _id: gig._id,
                        title: gig.title,
                        description: gig.description
                    },
                    bidId: bid._id
                });
            }

            return res.status(200).json({
                message: "Freelancer hired successfully",
                success: true
            })
        } catch (error) {
            // Abort transaction on error
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

