import { setMyBids } from '@/redux/bidSlice'
import { BID_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetMyBids = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchMyBids = async () => {
            try {
                const res = await axios.get(`${BID_API_END_POINT}/my-bids`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setMyBids(res.data.bids));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchMyBids();
    }, [dispatch])
}

export default useGetMyBids

