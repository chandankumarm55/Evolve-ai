import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        clearUser: () => initialState
    }
});

export const { updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;