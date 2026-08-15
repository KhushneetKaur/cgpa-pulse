import api from "./api.js";

// Simplified unwrap helper: handles payload envelope safely
function unwrap(res) {
  return res?.data ?? res;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function apiGoogleSignIn(credential) {
  try {
    const res = await api.post("/auth/google", { credential });
    return unwrap(res); 
  } catch (error) {
    console.error("apiGoogleSignIn error:", error);
    throw error;
  }
}

export async function apiGetMe() {
  const res = await api.get("/auth/me");
  const unwrapped = unwrap(res);
  return unwrapped?.user ?? unwrapped;
}

export async function apiRefresh() {
  const res = await api.post("/auth/refresh");
  return unwrap(res);
}

export async function apiLogout() {
  await api.post("/auth/logout");
}