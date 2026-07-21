import axios from "axios";

// ── Base Axios Instance ──────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Sends httpOnly cookies on cross-origin requests
  timeout: 30000,        // Accommodates backend cold starts (e.g., Render/Sleeper)
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfToken = null;
let csrfTokenPromise = null;

/**
 * Thread-safe CSRF fetch that prevents duplicate concurrent token requests.
 */
async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;

  // Deduplicate inflight token requests
  if (!csrfTokenPromise) {
    csrfTokenPromise = axios
      .get(`${api.defaults.baseURL}/auth/csrf`, {
        withCredentials: true,
      })
      .then((res) => {
        csrfToken = res.data?.data?.csrfToken || res.data?.csrfToken;
        return csrfToken;
      })
      .catch((err) => {
        console.error("Failed to fetch CSRF token:", err);
        throw err;
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }

  return csrfTokenPromise;
}

// ── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const url = config.url || "";
    
    // Auth routes exempt from requiring explicit CSRF headers
    const isExempt = [
      "/auth/logout",
      "/auth/refresh",
      "/auth/google",
    ].some((u) => url.includes(u));

    if (!isExempt) {
      try {
        const token = await ensureCsrfToken();
        config.headers = config.headers || {};
        config.headers["x-csrf-token"] = token;
      } catch {
        // Proceed without header — backend error handling will capture if required
      }
    }
  }

  return config;
});

// ── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const rawMessage =
      error.response?.data?.message || error.message || "Something went wrong";
      
    const isTimeout =
      error.code === "ECONNABORTED" || rawMessage.toLowerCase().includes("timeout");
      
    const message = isTimeout
      ? "Server is waking up. Please try again in a few seconds."
      : rawMessage;

    const url = error.config?.url || "";

    // Exclude auth routes from automatic session-expiry redirects
    const isAuthRoute = [
      "/auth/google",
      "/auth/me",
      "/auth/refresh",
      "/auth/logout",
    ].some((u) => url.includes(u));

    // ── Token Refresh on 401 ─────────────────────────────────────────────────
    if (status === 401 && !isAuthRoute && !error.config?._retry) {
      error.config._retry = true;
      try {
        await api.post("/auth/refresh");
        // Retry original request with renewed session
        return api.request(error.config);
      } catch {
        // Refresh token expired or revoked — notify app to log out user
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    // Direct 401 on non-auth routes after retry
    if (status === 401 && !isAuthRoute) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    // ── Invalid CSRF Token Retry Routine ────────────────────────────────────
    if (
      status === 403 &&
      message === "Invalid CSRF token" &&
      !error.config?._csrfRetry
    ) {
      csrfToken = null; // Clear stale token
      error.config._csrfRetry = true;
      
      try {
        const token = await ensureCsrfToken();
        error.config.headers = error.config.headers || {};
        error.config.headers["x-csrf-token"] = token;
        return api.request(error.config);
      } catch (err) {
        console.error("CSRF retry failed:", err);
        return Promise.reject({
          status,
          message,
          errors: error.response?.data?.errors || [],
        });
      }
    }

    // Reset local token cache if CSRF invalidation persists
    if (status === 403 && message === "Invalid CSRF token") {
      csrfToken = null;
    }

    return Promise.reject({
      status,
      message,
      errors: error.response?.data?.errors || [],
    });
  }
);

export default api;