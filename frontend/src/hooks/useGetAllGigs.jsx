import { setAllGigs } from '@/redux/gigSlice'
import { GIG_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllGigs = () => {
    const dispatch = useDispatch();
    const { searchQuery } = useSelector(store => store.gig);
    
    useEffect(() => {
        const fetchAllGigs = async () => {
            try {
                const res = await axios.get(`${GIG_API_END_POINT}?keyword=${searchQuery}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllGigs(res.data.gigs));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllGigs();
    }, [searchQuery, dispatch])
}

export default useGetAllGigs

