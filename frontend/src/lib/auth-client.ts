import { createAuthClient } from "better-auth/react";

const _apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
// Strip the "/api" suffix to get the auth base URL.
// When VITE_API_URL is a relative path like "/api" (Vercel proxy setup),
// this becomes "" which makes Better Auth use same-origin relative requests.
const _authBase = _apiUrl.replace(/\/api$/, "");

export const authClient = createAuthClient({
  baseURL: _authBase || window.location.origin,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
