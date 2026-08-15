import api from "./api.js";

// Unwraps the backend's { success, statusCode, message, data: {...} } envelope
function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function apiGoogleSignIn(credential) {
  const res = await api.post("/auth/google", { credential });
  return unwrap(res); // { user, isNewUser }
}

export async function apiGetMe() {
  const res = await api.get("/auth/me");
  const unwrapped = unwrap(res);
  // Safely fallback to unwrapped object if user property isn't nested
  return unwrapped?.user ?? unwrapped;
}

export async function apiRefresh() {
  const res = await api.post("/auth/refresh");
  return unwrap(res); // { user }
}

export async function apiLogout() {
  await api.post("/auth/logout");
}