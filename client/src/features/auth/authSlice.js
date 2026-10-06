import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authLogin(state, action) {
      // payload: { user, accessToken } — shape returned by authApi.login()
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    setAccessToken(state, action) {
      // Called by the api.js interceptor after a silent /auth/refresh.
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
    authLogout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      // No localStorage.removeItem("token") needed — the access token only
      // lives in redux (persisted by redux-persist), and the refreshToken
      // cookie is httpOnly, so it's cleared server-side by /auth/logout.
      window.location.href = "/auth/login";
    },
  },
});

export const { authLogin, setAccessToken, authLogout } = AuthSlice.actions;
export default AuthSlice.reducer;