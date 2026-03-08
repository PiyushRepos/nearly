import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  withCredentials: true, // required for Better Auth session cookies
  headers: { "Content-Type": "application/json" },
});

// ─── Response interceptor ─────────────────────────────────────────────────────
// Redirect to login on 401; surface error message from backend on all others.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loops on the auth pages themselves
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);
