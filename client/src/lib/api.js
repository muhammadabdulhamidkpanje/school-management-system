import axios from "axios";
import store from "../store";
import { setAccessToken, authLogout } from "../features/auth/authSlice";

// Vite env convention — set VITE_API_URL in your .env (e.g. http://localhost:4000)
const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  // Required so the httpOnly refreshToken cookie set by the backend
  // (see auth.controller.ts -> res.cookie('refreshToken', ...)) is sent
  // on every request and can be updated by /auth/refresh.
  withCredentials: true,
});

// Attach the current access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- 401 handling with a single in-flight refresh -------------------------
// If several requests fail with 401 at once (e.g. a dashboard firing off
// multiple calls on mount), we don't want to hit /auth/refresh multiple
// times. We queue the failed requests and replay them once the refresh
// call resolves.
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Don't try to refresh when the failed call *was* the refresh call,
    // and don't retry a request more than once.
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
    if (status !== 401 || isRefreshCall || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // A refresh is already in flight — queue this request and replay
      // it once we have a new token.
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Backend reads the httpOnly refreshToken cookie itself — no body needed.
      // See auth.controller.ts -> refresh()
      const { data } = await api.post("/auth/refresh");
      const newAccessToken = data.data.accessToken;

      store.dispatch(setAccessToken(newAccessToken));
      resolveQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      store.dispatch(authLogout());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;