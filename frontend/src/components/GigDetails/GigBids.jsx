import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import axios from 'axios';
import { BID_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const GigBids = ({ bids, isOwner, gigStatus, onHireSuccess }) => {
    const [hireConfirmDialogOpen, setHireConfirmDialogOpen] = useState(false);
    const [selectedBidId, setSelectedBidId] = useState(null);
    const [hiringBidId, setHiringBidId] = useState(null);

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
                if (onHireSuccess) onHireSuccess();
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to hire freelancer");
        } finally {
            setHiringBidId(null);
            setSelectedBidId(null);
        }
    }

    if (!isOwner) return null;

    // Sort bids: hired first, then others
    const sortedBids = [...bids].sort((a, b) => {
        if (a.status === 'hired') return -1;
        if (b.status === 'hired') return 1;
        return 0;
    });

    return (
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
                                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${bid.status === 'hired' ? 'bg-green-100 text-green-800' :
                                        bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {bid.status}
                                    </span>
                                </div>
                                {bid.status === 'pending' && gigStatus === 'open' && (
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
    );
};

export default GigBids;
