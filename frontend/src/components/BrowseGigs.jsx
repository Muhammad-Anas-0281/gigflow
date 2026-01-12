import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useSelector, useDispatch } from 'react-redux'
import { setSearchQuery } from '@/redux/gigSlice'
import useGetAllGigs from '@/hooks/useGetAllGigs'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock3, Search } from 'lucide-react'

const GigCard = ({ gig }) => {
    const { user } = useSelector(store => store.auth);
    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    const isOwner = user?._id === gig?.ownerId?._id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='border border-gray-200 rounded-lg p-5 hover:shadow-xl transition-all bg-white'
        >
            <Link to={`/gig/${gig._id}`}>
                <div className="flex justify-between items-start mb-2">
                    <h3 className='text-xl font-bold text-gray-900 line-clamp-1'>{gig.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wide ${gig.status === 'open'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {gig.status}
                    </span>
                </div>
                <p className='text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed'>{gig.description}</p>
                <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
                    <div className='flex flex-col'>
                        <span className='text-xs text-gray-500 uppercase font-semibold'>Budget</span>
                        <span className='text-lg font-bold text-[#6A38C2]'>${gig.budget}</span>
                    </div>
                    <div className='text-right'>
                        <p className='text-sm text-gray-700 font-medium'>
                            {gig.ownerId?.name || 'Unknown'}
                            {isOwner && <span className="text-gray-400 ml-1 italic">(you)</span>}
                        </p>
                        <div className='flex items-center gap-1 text-xs text-gray-400 mt-1'>
                            <Clock3 className='h-3 w-3' />
                            <span>{Math.floor((new Date() - new Date(gig.createdAt)) / (1000 * 60 * 60 * 24))}d ago</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

const BrowseGigs = () => {
    const { allGigs, searchQuery } = useSelector(store => store.gig);
    const dispatch = useDispatch();
    const [localSearch, setLocalSearch] = useState(searchQuery);

    useGetAllGigs();

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(setSearchQuery(localSearch));
    }

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <div className='mb-6'>
                    <form onSubmit={handleSearch} className='flex gap-2'>
                        <Input
                            type="text"
                            placeholder="Search gigs by title or description..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className='flex-1'
                        />
                        <Button type="submit" className="bg-[#6A38C2] hover:bg-[#5b30a6]">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </form>
                </div>

                {allGigs.length === 0 ? (
                    <div className='text-center py-20'>
                        <p className='text-gray-500 text-lg'>No gigs found. Try adjusting your search.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {allGigs.map((gig) => (
                            <GigCard key={gig._id} gig={gig} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BrowseGigs

