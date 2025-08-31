import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
}


const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        authLogin(state, action){
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        authLogout(state){
            state.user = null;
            state.isAuthenticated = false;
        }

    }
})


export const {authLogin, authLogout} = AuthSlice.actions;
export default AuthSlice.reducer;