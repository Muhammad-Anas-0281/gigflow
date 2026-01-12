import { setMyGigs } from '@/redux/gigSlice'
import { GIG_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

const useGetMyGigs = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        const fetchMyGigs = async () => {
            try {
                const res = await axios.get(`${GIG_API_END_POINT}/my-gigs`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setMyGigs(res.data.gigs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        // Fetch whenever the location changes (when navigating to /my-gigs)
        if (location.pathname === '/my-gigs') {
            fetchMyGigs();
        }
    }, [dispatch, location.pathname])
}

export default useGetMyGigs

