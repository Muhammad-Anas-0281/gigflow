import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import BrowseGigs from './components/BrowseGigs'
import CreateGig from './components/CreateGig'
import GigDetails from './components/GigDetails'
import MyGigs from './components/MyGigs'
import MyBids from './components/MyBids'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { initializeSocket, getSocket } from './utils/socket'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { setMyBids } from './redux/bidSlice'

const App = () => {
  const { user } = useSelector(store => store.auth);
  const { myBids } = useSelector(store => store.bid);
  const dispatch = useDispatch();
  
  useGetCurrentUser();

  useEffect(() => {
    if (user) {
      initializeSocket();
      const socket = getSocket();
      
      if (socket) {
        socket.on("hired", (data) => {
          toast.success(data.message || `You have been hired for ${data.gig?.title}!`);
          if (data?.bidId) {
            const updated = myBids.map((b) => b._id === data.bidId ? { ...b, status: 'hired' } : b);
            dispatch(setMyBids(updated));
          }
        });

        return () => {
          socket.off("hired");
        };
      }
    }
  }, [user]);

  const appRouter = createBrowserRouter([
    {
      path: '/',
      element: <Home />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/signup',
      element: <Signup />
    },
    {
      path: '/browse',
      element: <BrowseGigs />
    },
    {
      path: '/create-gig',
      element: <CreateGig />
    },
    {
      path: '/gig/:id',
      element: <GigDetails />
    },
    {
      path: '/my-gigs',
      element: <MyGigs />
    },
    {
      path: '/my-bids',
      element: <MyBids />
    },
  ])

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App

