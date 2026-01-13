import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../shared/Navbar'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { GIG_API_END_POINT, BID_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import { setMyBids } from '@/redux/bidSlice'
import useGetMyBids from '@/hooks/useGetMyBids'
import GigHeader from './GigHeader'
import GigBids from './GigBids'

const GigDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const { myBids } = useSelector(store => store.bid);
    const dispatch = useDispatch();

    const [gig, setGig] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bidDialogOpen, setBidDialogOpen] = useState(false);
    const [bidForm, setBidForm] = useState({ message: "", price: "" });
    const [submittingBid, setSubmittingBid] = useState(false);
    const [alreadyBid, setAlreadyBid] = useState(false);

    useGetMyBids();

    const fetchGigAndBids = useCallback(async () => {
        try {
            // Fetch Gig
            const gigRes = await axios.get(`${GIG_API_END_POINT}/${id}`, { withCredentials: true });
            if (gigRes.data.success) {
                setGig(gigRes.data.gig);
                // If owner, fetch bids
                if (user && gigRes.data.gig.ownerId._id === user._id) {
                    const bidsRes = await axios.get(`${BID_API_END_POINT}/${id}`, { withCredentials: true });
                    if (bidsRes.data.success) {
                        setBids(bidsRes.data.bids);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        fetchGigAndBids();
    }, [fetchGigAndBids]);

    useEffect(() => {
        if (user && myBids.length) {
            const hasBid = myBids.some((b) => b?.gigId?._id === id || b?.gigId === id);
            if (hasBid) setAlreadyBid(true);
        }
    }, [user, myBids, id]);

    const handleSubmitBid = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to submit a bid");
            navigate("/login");
            return;
        }
        if (alreadyBid) {
            toast.error("Already submitted a bid for this gig");
            return;
        }
        try {
            setSubmittingBid(true);
            const res = await axios.post(`${BID_API_END_POINT}/${id}`, bidForm, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success("Bid submitted successfully!");
                setBidDialogOpen(false);
                setBidForm({ message: "", price: "" });
                setAlreadyBid(true);

                // Refresh my bids store
                try {
                    const myBidsRes = await axios.get(`${BID_API_END_POINT}/my-bids`, { withCredentials: true });
                    if (myBidsRes.data.success) {
                        dispatch(setMyBids(myBidsRes.data.bids));
                    }
                } catch (err) {
                    console.log(err);
                }

                navigate("/my-bids");

                // Refresh data if owner (though owner can't bid usually, but good practice)
                fetchGigAndBids();
            }
        } catch (error) {
            console.log(error);
            if (error?.response?.data?.message?.toLowerCase().includes("already")) {
                setAlreadyBid(true);
            }
            toast.error(error.response?.data?.message || "Failed to submit bid");
        } finally {
            setSubmittingBid(false);
        }
    }

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className='max-w-7xl mx-auto px-4 py-20 text-center'>
                    <Loader2 className='h-8 w-8 animate-spin mx-auto' />
                </div>
            </div>
        )
    }

    if (!gig) {
        return (
            <div>
                <Navbar />
                <div className='max-w-7xl mx-auto px-4 py-20 text-center'>
                    <p className='text-lg'>Gig not found</p>
                </div>
            </div>
        )
    }

    const isOwner = user && gig.ownerId._id === user._id;
    const canBid = user && !isOwner && gig.status === 'open';

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <GigHeader gig={gig} isOwner={isOwner} />

                <GigBids
                    bids={bids}
                    isOwner={isOwner}
                    gigStatus={gig.status}
                    onHireSuccess={fetchGigAndBids}
                />

                {canBid && (
                    <div>
                        <Button
                            onClick={() => setBidDialogOpen(true)}
                            className="bg-[#6A38C2] hover:bg-[#5b30a6]"
                            disabled={alreadyBid}
                        >
                            {alreadyBid ? "Already submitted" : "Submit a Bid"}
                        </Button>
                    </div>
                )}

                <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit a Bid</DialogTitle>
                            <DialogDescription>
                                Enter your proposal and price for this gig
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitBid}>
                            <div className='space-y-4'>
                                <div>
                                    <Label>Message</Label>
                                    <textarea
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={bidForm.message}
                                        onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                                        placeholder="Describe your proposal..."
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Price ($)</Label>
                                    <Input
                                        type="number"
                                        value={bidForm.price}
                                        onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                                        placeholder="1000"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className='flex gap-2 justify-end'>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setBidDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submittingBid}
                                        className="bg-[#6A38C2] hover:bg-[#5b30a6]"
                                    >
                                        {submittingBid ? (
                                            <>
                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Bid'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default GigDetails
