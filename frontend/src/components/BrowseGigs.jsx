import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useSelector, useDispatch } from 'react-redux'
import { setSearchQuery } from '@/redux/gigSlice'
import useGetAllGigs from '@/hooks/useGetAllGigs'
import useGetCurrentUser from '@/hooks/useGetCurrentUser'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock3, Search } from 'lucide-react'

const GigCard = ({ gig, user }) => {
    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow'
        >
            <Link to={`/gig/${gig._id}`}>
                <h3 className='text-xl font-semibold mb-2'>{gig.title}</h3>
                <p className='text-gray-600 mb-3 line-clamp-2'>{gig.description}</p>
                <div className='flex items-center justify-between'>
                    <span className='text-lg font-bold text-[#6A38C2]'>${gig.budget}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wide ${gig.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {gig.status}
                    </span>
                </div>
                <p className='text-sm text-gray-500 mt-2'>Posted by: {gig.ownerId?.name || 'Unknown'} {gig.ownerId?._id === user?._id && <em>(You)</em>}</p>
                <div className='flex items-center gap-2 text-sm text-gray-500 mt-1'>
                    <Clock3 className='h-4 w-4' />
                    <span>Posted at {formatTime(gig.createdAt)}</span>
                </div>
            </Link>
        </motion.div>
    )
}

const BrowseGigs = () => {
    const { allGigs, searchQuery } = useSelector(store => store.gig);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [localSearch, setLocalSearch] = useState(searchQuery);

    useGetAllGigs();
    useGetCurrentUser();

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
                            <GigCard key={gig._id} gig={gig} user={user} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BrowseGigs
