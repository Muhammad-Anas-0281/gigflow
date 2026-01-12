import React from 'react'
import Navbar from './shared/Navbar'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

const Home = () => {
    const { user } = useSelector(store => store.auth);

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 py-20'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='text-center'
                >
                    <h1 className='text-5xl font-bold mb-4'>
                        Welcome to <span className='text-[#6A38C2]'>GigFlow</span>
                    </h1>
                    <p className='text-xl text-gray-600 mb-8'>
                        Your freelance marketplace. Post gigs or bid on projects.
                    </p>
                    <div className='flex gap-4 justify-center'>
                        {user ? (
                            <>
                                <Link to="/browse">
                                    <Button size="lg" className="bg-[#6A38C2] hover:bg-[#5b30a6]">
                                        Browse Gigs
                                    </Button>
                                </Link>
                                <Link to="/create-gig">
                                    <Button size="lg" variant="outline">
                                        Post a Gig
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/signup">
                                    <Button size="lg" className="bg-[#6A38C2] hover:bg-[#5b30a6]">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link to="/browse">
                                    <Button size="lg" variant="outline">
                                        Browse Gigs
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Home

