import axios from "axios";

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,  // sends httpOnly cookies on every request — critical for iOS
  timeout:         30000,
  headers:         { "Content-Type": "application/json" },
});

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  // Unwrap backend envelope: axios response → response.data (the backend JSON)
  // Callers get: { success, statusCode, message, data: { ... } }
  (response) => response.data,

  async (error) => {
    const status    = error.response?.status;
    const isTimeout = error.code === "ECONNABORTED";
    const message   = isTimeout
      ? "Server is waking up — please try again in a few seconds."
      : error.response?.data?.message || error.message || "Something went wrong";

    const url         = error.config?.url || "";
    const isAuthRoute = ["/auth/google", "/auth/me", "/auth/refresh", "/auth/logout"]
      .some(u => url.includes(u));

    // 401 on a data route — try silent refresh once, then retry original request
    if (status === 401 && !isAuthRoute && !error.config?._retry) {
      error.config._retry = true;
      try {
        await api.post("/auth/refresh"); // rotates cookies silently via interceptor
        return api.request(error.config); // retry with fresh cookie
      } catch {
        localStorage.removeItem("cgpapulse_was_logged_in");
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        return Promise.reject({ status: 401, message: "Session expired — please log in again" });
      }
    }

    // 401 on auth routes — clear flag and signal app (no retry)
    if (status === 401 && isAuthRoute && !error.config?._retry) {
      localStorage.removeItem("cgpapulse_was_logged_in");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject({
      status,
      message,
      errors: error.response?.data?.errors || [],
    });
  }
);

export default api;