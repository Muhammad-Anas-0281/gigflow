import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { GIG_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@/redux/authSlice'
import { setMyGigs } from '@/redux/gigSlice'
import { Loader2, ArrowLeft } from 'lucide-react'

const CreateGig = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        budget: "",
    });
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to create a gig");
            navigate("/login");
            return;
        }
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${GIG_API_END_POINT}`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                toast.success(res.data.message);

                // Clear form
                setInput({
                    title: "",
                    description: "",
                    budget: "",
                });
                navigate("/my-gigs");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to create gig");
        } finally {
            dispatch(setLoading(false));
        }
    }

    if (!user) {
        return (
            <div>
                <Navbar />
                <div className='max-w-7xl mx-auto px-4 py-20 text-center'>
                    <p className='text-lg'>Please login to create a gig</p>
                    <Button onClick={() => navigate("/login")} className="mt-4">Login</Button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <div className='w-1/2'>
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <form onSubmit={submitHandler} className='border border-gray-200 rounded-md p-4 my-10'>
                        <h1 className='font-bold text-xl mb-5'>Create a New Gig</h1>
                        <div className='my-2'>
                            <Label>Title</Label>
                            <Input
                                type="text"
                                value={input.title}
                                name="title"
                                onChange={changeEventHandler}
                                placeholder="e.g., Website Development"
                                required
                            />
                        </div>
                        <div className='my-2'>
                            <Label>Description</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={input.description}
                                name="description"
                                onChange={changeEventHandler}
                                placeholder="Describe your project requirements..."
                                required
                            />
                        </div>
                        <div className='my-2'>
                            <Label>Budget ($)</Label>
                            <Input
                                type="number"
                                value={input.budget}
                                name="budget"
                                onChange={changeEventHandler}
                                placeholder="1000"
                                min="1"
                                required
                            />
                        </div>
                        {
                            loading ? <Button className="w-full my-4" disabled> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">Create Gig</Button>
                        }
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateGig

