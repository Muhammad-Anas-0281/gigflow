import React from 'react'
import Navbar from './shared/Navbar'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetMyBids from '@/hooks/useGetMyBids'
import { motion } from 'framer-motion'

const MyBids = () => {
    const { myBids } = useSelector(store => store.bid);
    const { user } = useSelector(store => store.auth);

    useGetMyBids();

    if (!user) {
        return (
            <div>
                <Navbar />
                <div className='max-w-7xl mx-auto px-4 py-20 text-center'>
                    <p className='text-lg'>Please login to view your bids</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <h1 className='text-3xl font-bold mb-6'>My Bids</h1>

                {myBids.length === 0 ? (
                    <div className='text-center py-20'>
                        <p className='text-gray-500 text-lg mb-4'>You haven't submitted any bids yet.</p>
                        <Link to="/browse">
                            <button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white px-4 py-2 rounded">
                                Browse Gigs
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {myBids.map((bid) => (
                            <motion.div
                                key={bid._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className='border border-gray-200 rounded-lg p-4'
                            >
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                        <Link to={`/gig/${bid.gigId?._id}`}>
                                            <h3 className='text-xl font-semibold mb-2 hover:text-[#6A38C2]'>
                                                {bid.gigId?.title || 'Gig not found'}
                                            </h3>
                                        </Link>
                                        <p className='text-gray-600 mb-2'>{bid.message}</p>
                                        <div className='flex items-center gap-4'>
                                            <span className='text-lg font-bold text-[#6A38C2]'>${bid.price}</span>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                bid.status === 'hired' ? 'bg-green-100 text-green-800' :
                                                bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {bid.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyBids

