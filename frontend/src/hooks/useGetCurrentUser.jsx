import { setUser } from '@/redux/authSlice'
import { AUTH_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetCurrentUser = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await axios.get(`${AUTH_API_END_POINT}/me`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setUser(res.data.user));
                }
            } catch (error) {
                console.log(error);
                dispatch(setUser(null));
            }
        }
        if (!user) {
            fetchCurrentUser();
        }
    }, [dispatch, user])
}

export default useGetCurrentUser

