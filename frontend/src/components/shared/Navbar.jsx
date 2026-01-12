import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { LogOut, User2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { AUTH_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import { disconnectSocket } from '@/utils/socket'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const indicatorRef = useRef(null);
    const linkRefs = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

    const navItems = useMemo(() => ([
        { label: "Home", to: "/" },
        { label: "Browse Gigs", to: "/browse" },
        ...(user ? [
            { label: "My Gigs", to: "/my-gigs" },
            { label: "My Bids", to: "/my-bids" }
        ] : []),
    ]), [user]);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${AUTH_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                disconnectSocket();
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Logout failed");
        }
    }
    
    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }

    useEffect(() => {
        // Find active item - exact match or starts with (but not for home which is '/')
        const activeItem = navItems.find(item => {
            if (item.to === '/') {
                return location.pathname === '/';
            }
            return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
        });
        
        if (activeItem) {
            const el = linkRefs.current[activeItem.to];
            const container = indicatorRef.current;
            if (el && container) {
                const { left: cLeft } = container.getBoundingClientRect();
                const { left, width } = el.getBoundingClientRect();
                setIndicatorStyle({ left: left - cLeft, width });
            }
        } else {
            // No active item found, hide indicator
            setIndicatorStyle({ width: 0, left: 0 });
        }
    }, [location.pathname, navItems]);

    return (
        <div className='bg-white border-b'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4'>
                <div>
                    <Link to="/">
                        <h1 className='text-2xl font-bold'>Gig<span className='text-[#6A38C2]'>Flow</span></h1>
                    </Link>
                </div>
                <div className='flex items-center gap-12'>
                    <div className='relative'>
                        <ul ref={indicatorRef} className='flex font-medium items-center gap-5 relative'>
                            {navItems.map(item => {
                                const isActive = item.to === '/' 
                                    ? location.pathname === '/' 
                                    : location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                                return (
                                    <li key={item.to} ref={el => { linkRefs.current[item.to] = el; }}>
                                        <Link
                                            to={item.to}
                                            className={`pb-2 transition-colors ${isActive ? 'text-[#6A38C2]' : ''}`}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                        <span
                            className='absolute bottom-0 h-0.5 bg-[#6A38C2] transition-all duration-300'
                            style={{ width: indicatorStyle.width, left: indicatorStyle.left }}
                        ></span>
                    </div>
                    {
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="outline">Login</Button></Link>
                                <Link to="/signup"><Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">Signup</Button></Link>
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="cursor-pointer">
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className=''>
                                        <div className='flex gap-2 space-y-2'>
                                            <Avatar className="cursor-pointer">
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className='font-medium'>{user.name}</h4>
                                                <p className='text-sm text-muted-foreground'>{user.email}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col my-2 text-gray-600'>
                                            <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                <User2 />
                                                <Button variant="link">Profile</Button>
                                            </div>
                                            <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                <LogOut />
                                                <Button onClick={logoutHandler} variant="link">Logout</Button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Navbar

