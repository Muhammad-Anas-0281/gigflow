import { createSlice } from "@reduxjs/toolkit";

const bidSlice = createSlice({
    name: "bid",
    initialState: {
        gigBids: [],
        myBids: [],
    },
    reducers: {
        setGigBids: (state, action) => {
            state.gigBids = action.payload;
        },
        setMyBids: (state, action) => {
            state.myBids = action.payload;
        }
    }
});

export const {
    setGigBids,
    setMyBids
} = bidSlice.actions;
export default bidSlice.reducer;

