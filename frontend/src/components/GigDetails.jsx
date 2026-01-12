import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { GIG_API_END_POINT, BID_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import { setMyBids } from '@/redux/bidSlice'
import useGetMyBids from '@/hooks/useGetMyBids'

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
    const [hiringBidId, setHiringBidId] = useState(null);
    const [alreadyBid, setAlreadyBid] = useState(false);
    const [hireConfirmDialogOpen, setHireConfirmDialogOpen] = useState(false);
    const [selectedBidId, setSelectedBidId] = useState(null);

    useGetMyBids();

    useEffect(() => {
        const fetchGig = async () => {
            try {
                const res = await axios.get(`${GIG_API_END_POINT}/${id}`, { withCredentials: true });
                if (res.data.success) {
                    setGig(res.data.gig);
                }
            } catch (error) {
                console.log(error);
                toast.error("Failed to load gig");
            } finally {
                setLoading(false);
            }
        }
        fetchGig();
    }, [id])

    useEffect(() => {
        if (user && myBids.length) {
            const hasBid = myBids.some((b) => b?.gigId?._id === id || b?.gigId === id);
            if (hasBid) setAlreadyBid(true);
        }
    }, [user, myBids, id]);

    useEffect(() => {
        if (gig && user && gig.ownerId._id === user._id) {
            const fetchBids = async () => {
                try {
                    const res = await axios.get(`${BID_API_END_POINT}/${id}`, { withCredentials: true });
                    if (res.data.success) {
                        setBids(res.data.bids);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
            fetchBids();
        }
    }, [gig, user, id])

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
                // Refresh my bids store and redirect
                try {
                    const myBidsRes = await axios.get(`${BID_API_END_POINT}/my-bids`, { withCredentials: true });
                    if (myBidsRes.data.success) {
                        dispatch(setMyBids(myBidsRes.data.bids));
                    }
                } catch (err) {
                    console.log(err);
                }
                navigate("/my-bids");
                // Refresh bids if user is owner
                if (gig && user && gig.ownerId._id === user._id) {
                    const bidsRes = await axios.get(`${BID_API_END_POINT}/${id}`, { withCredentials: true });
                    if (bidsRes.data.success) {
                        setBids(bidsRes.data.bids);
                    }
                }
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

    const handleHireClick = (bidId) => {
        setSelectedBidId(bidId);
        setHireConfirmDialogOpen(true);
    }

    const handleHireConfirm = async () => {
        if (!selectedBidId) return;
        try {
            setHiringBidId(selectedBidId);
            setHireConfirmDialogOpen(false);
            const res = await axios.patch(`${BID_API_END_POINT}/${selectedBidId}/hire`, {}, {
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success("Freelancer hired successfully!");
                // Refresh gig and bids
                const gigRes = await axios.get(`${GIG_API_END_POINT}/${id}`, { withCredentials: true });
                if (gigRes.data.success) {
                    setGig(gigRes.data.gig);
                }
                const bidsRes = await axios.get(`${BID_API_END_POINT}/${id}`, { withCredentials: true });
                if (bidsRes.data.success) {
                    setBids(bidsRes.data.bids);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to hire freelancer");
        } finally {
            setHiringBidId(null);
            setSelectedBidId(null);
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

    // Sort bids: hired first, then others
    const sortedBids = [...bids].sort((a, b) => {
        if (a.status === 'hired') return -1;
        if (b.status === 'hired') return 1;
        return 0;
    });

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
                <div className='border border-gray-200 rounded-lg p-6 mb-6'>
                    <div className='flex items-start justify-between mb-4'>
                        <div>
                            <h1 className='text-3xl font-bold mb-2'>{gig.title}</h1>
                            <p className='text-gray-600 mb-4'>{gig.description}</p>
                            <div className='flex items-center gap-4'>
                                <span className='text-2xl font-bold text-[#6A38C2]'>${gig.budget}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wide ${gig.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {gig.status}
                                        </span>
                            </div>
                        </div>
                    </div>
                    <p className='text-sm text-gray-500'>Posted by: {gig.ownerId?.name || 'Unknown'}</p>
                </div>

                {isOwner && (
                    <div className='mb-6'>
                        <h2 className='text-2xl font-semibold mb-4'>Bids ({bids.length})</h2>
                        {bids.length === 0 ? (
                            <p className='text-gray-500'>No bids yet</p>
                        ) : (
                            <div className='space-y-4'>
                                {sortedBids.map((bid) => (
                                    <div key={bid._id} className={`border rounded-lg p-4 ${bid.status === 'hired' ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex-1'>
                                                <p className='font-semibold'>{bid.freelancerId?.name || 'Unknown'}</p>
                                                <p className='text-gray-600 mt-1'>{bid.message}</p>
                                                <p className='text-lg font-bold text-[#6A38C2] mt-2'>${bid.price}</p>
                                                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                                                    bid.status === 'hired' ? 'bg-green-100 text-green-800' :
                                                    bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {bid.status}
                                                </span>
                                            </div>
                                            {bid.status === 'pending' && gig.status === 'open' && (
                                                <Button
                                                    onClick={() => handleHireClick(bid._id)}
                                                    disabled={hiringBidId === bid._id}
                                                    className="bg-[#6A38C2] hover:bg-[#5b30a6]"
                                                >
                                                    {hiringBidId === bid._id ? (
                                                        <>
                                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                            Hiring...
                                                        </>
                                                    ) : (
                                                        'Hire'
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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

                <Dialog open={hireConfirmDialogOpen} onOpenChange={setHireConfirmDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Hiring</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to hire this freelancer? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className='flex gap-2 justify-end mt-4'>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setHireConfirmDialogOpen(false);
                                    setSelectedBidId(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleHireConfirm}
                                className="bg-[#6A38C2] hover:bg-[#5b30a6]"
                            >
                                Confirm Hire
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default GigDetails

