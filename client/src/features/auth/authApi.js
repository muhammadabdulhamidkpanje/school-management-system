import api from "../../lib/api";

// Matches auth.route.ts / auth.controller.ts on the backend.
// Every response is wrapped as { success, message, data } (see utils/response.ts),
// so callers unwrap `.data.data`.

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  // data.data => { accessToken, user }
  return data.data;
}

export async function logout() {
  const { data } = await api.post("/auth/logout");
  return data;
}

export async function logoutAll() {
  const { data } = await api.post("/auth/logout-all");
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data.data;
}

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data.data;
}