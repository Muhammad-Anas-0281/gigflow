import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from 'axios';
import { GIG_API_END_POINT } from '@/utils/constant';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const GigHeader = ({ gig, isOwner }) => {
    const navigate = useNavigate();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const confirmDelete = async () => {
        try {
            const res = await axios.delete(`${GIG_API_END_POINT}/${gig._id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/my-gigs");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to delete gig");
        }
    };

    if (!gig) return null;

    return (
        <>
            <div className='border border-gray-200 rounded-lg p-6 mb-6'>
                <div className='flex items-start justify-between mb-4'>
                    <div className="w-full">
                        <div className="flex justify-between items-start w-full">
                            <h1 className='text-3xl font-bold mb-2'>{gig.title}</h1>
                            {isOwner && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
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

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your gig
                            and remove all associated applications/bids.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default GigHeader;
