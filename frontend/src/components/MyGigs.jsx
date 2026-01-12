import React, { useEffect, useMemo, useState } from 'react'
import Navbar from './shared/Navbar'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import useGetMyGigs from '@/hooks/useGetMyGigs'
import { motion } from 'framer-motion'
import { Bell, Clock3, Plus, Trash2 } from 'lucide-react'
import axios from 'axios'
import { BID_API_END_POINT, GIG_API_END_POINT } from '@/utils/constant'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { setMyGigs } from '@/redux/gigSlice'
import { useDispatch } from 'react-redux'

const MyGigs = () => {
    const { myGigs } = useSelector(store => store.gig);
    const { user } = useSelector(store => store.auth);
    const [bidCounts, setBidCounts] = useState({});
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedGigId, setSelectedGigId] = useState(null);
    const dispatch = useDispatch();

    useGetMyGigs();

    const confirmDelete = async () => {
        try {
            const res = await axios.delete(`${GIG_API_END_POINT}/${selectedGigId}`, { withCredentials: true });
            if (res.data.success) {
                const updatedGigs = myGigs.filter(gig => gig._id !== selectedGigId);
                dispatch(setMyGigs(updatedGigs));
                toast.success(res.data.message);
                setDeleteDialogOpen(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to delete gig");
        }
    };

    useEffect(() => {
        const fetchBidCounts = async () => {
            if (!user || !myGigs.length) return;
            try {
                const results = await Promise.all(
                    myGigs.map(async (gig) => {
                        try {
                            const res = await axios.get(`${BID_API_END_POINT}/${gig._id}`, { withCredentials: true });
                            if (res.data.success) {
                                return { id: gig._id, count: res.data.bids.length };
                            }
                        } catch (err) {
                            return { id: gig._id, count: 0 };
                        }
                        return { id: gig._id, count: 0 };
                    })
                );
                const map = {};
                results.forEach(({ id, count }) => { map[id] = count; });
                setBidCounts(map);
            } catch (error) {
                console.log(error);
            }
        };
        fetchBidCounts();
    }, [myGigs, user]);

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    if (!user) {
        return (
            <div>
                <Navbar />
                <div className='max-w-7xl mx-auto px-4 py-20 text-center'>
                    <p className='text-lg'>Please login to view your gigs</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-3xl font-bold'>My Gigs</h1>
                    <Link to="/create-gig">
                        <Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Gig
                        </Button>
                    </Link>
                </div>

                {myGigs.length === 0 ? (
                    <div className='text-center py-20'>
                        <p className='text-gray-500 text-lg mb-4'>You haven't created any gigs yet.</p>
                        <Link to="/create-gig">
                            <Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">
                                Create Your First Gig
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {myGigs.map((gig) => (
                            <motion.div
                                key={gig._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className='relative border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow'
                            >
                                <div className='absolute top-3 right-3'>
                                    <div className='relative'>
                                        <Bell className='h-5 w-5 text-gray-500' />
                                        {bidCounts[gig._id] > 0 && (
                                            <span className='absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500'></span>
                                        )}
                                    </div>
                                </div>
                                <Link to={`/gig/${gig._id}`}>
                                    <h3 className='text-xl font-semibold mb-2'>{gig.title}</h3>
                                    <p className='text-gray-600 mb-3 line-clamp-2'>{gig.description}</p>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-lg font-bold text-[#6A38C2]'>${gig.budget}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wide ${gig.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {gig.status}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-2 mt-3 text-sm text-gray-500'>
                                        <Clock3 className='h-4 w-4' />
                                        <span>Posted at {formatTime(gig.createdAt)}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

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
            </div>
        </div>
    )
}

export default MyGigs
