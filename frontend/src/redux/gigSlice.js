import { createSlice } from "@reduxjs/toolkit";

const gigSlice = createSlice({
    name: "gig",
    initialState: {
        allGigs: [],
        myGigs: [],
        singleGig: null,
        searchQuery: "",
    },
    reducers: {
        setAllGigs: (state, action) => {
            state.allGigs = action.payload;
        },
        setMyGigs: (state, action) => {
            state.myGigs = action.payload;
        },
        setSingleGig: (state, action) => {
            state.singleGig = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        }
    }
});

export const {
    setAllGigs,
    setMyGigs,
    setSingleGig,
    setSearchQuery
} = gigSlice.actions;
export default gigSlice.reducer;

