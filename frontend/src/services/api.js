import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // sends httpOnly cookies on every request
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,

  async (error) => {
    const status = error.response?.status;
    const isTimeout = error.code === "ECONNABORTED" || !error.response;
    
    const message = isTimeout
      ? "Server is waking up — please try again in a few seconds."
      : error.response?.data?.message || error.message || "Something went wrong";

    const url = error.config?.url || "";
    
    // Explicit list of core auth endpoints
    const isAuthRoute = [
      "/auth/google",
      "/auth/me",
      "/auth/refresh",
      "/auth/logout",
      "/auth/username", // Added username route protection
    ].some((u) => url.includes(u));

    // ONLY trigger auth:unauthorized on explicit 401 responses, NEVER on network/timeout errors!
    if (status === 401) {
      // 401 on standard data route — attempt silent refresh once
      if (!isAuthRoute && !error.config?._retry) {
        error.config._retry = true;
        try {
          await api.post("/auth/refresh");
          return api.request(error.config);
        } catch {
          localStorage.removeItem("cgpapulse_was_logged_in");
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
          return Promise.reject({ status: 401, message: "Session expired — please log in again" });
        }
      }

      // 401 directly on core auth routes (token completely invalid)
      if (isAuthRoute) {
        localStorage.removeItem("cgpapulse_was_logged_in");
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    return Promise.reject({
      status: status || 500,
      message,
      errors: error.response?.data?.errors || [],
    });
  }
);

export default api;