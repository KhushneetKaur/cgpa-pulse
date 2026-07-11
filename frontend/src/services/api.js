import axios from "axios";

// ── Base Axios instance ───────────────────────────────────────────────────────
// All API calls go through this — base URL, credentials, timeout set once here

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,   // send httpOnly cookie on every request
  timeout:         30000,  // Render cold starts can take longer than 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfToken = null;
const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;

  try {
    const res = await api.get("/auth/csrf", {
      skipCsrf: true,
    });
    csrfToken = res.data.csrfToken;
    return csrfToken;
  } catch (err) {
    console.error("Failed to fetch CSRF token:", err);
    throw err;
  }
}

// ── Request interceptor ───────────────────────────────────────────────────────

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();
  if (["POST","PUT","PATCH","DELETE"].includes(method)) {
    const url = config.url || "";
    const isExempt = [
  "/auth/login", "/auth/signup", "/auth/logout",
  "/auth/refresh", "/auth/google",
].some(u => url.includes(u));

    if (!isExempt) {
      try {
        const token = await ensureCsrfToken();
        config.headers = config.headers || {};
        config.headers["x-csrf-token"] = token;
      } catch {
        // CSRF fetch failed — proceed without token
        // backend will reject if required
      }
    }
  }
  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
// Runs after every response
// — unwraps the data so callers get { user } not { success, data: { user } }
// — handles 401 globally by clearing local state

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status  = error.response?.status;
    const rawMessage = error.response?.data?.message || error.message || "Something went wrong";
    const isTimeout = error.code === "ECONNABORTED" || rawMessage.toLowerCase().includes("timeout");
    const message = isTimeout
      ? "Server is waking up. Please try again in a few seconds."
      : rawMessage;
    const url     = error.config?.url || "";

    // ── Token refresh on 401 ─────────────────────────────────────────────────
    // Only for protected routes — not for auth endpoints
    const isAuthRoute = [
      "/auth/login", "/auth/signup", "/auth/logout",
      "/auth/me", "/auth/refresh",
    ].some(u => url.includes(u));

    if (status === 401 && !isAuthRoute && !error.config?._retry) {
      error.config._retry = true;
      try {
        await api.post("/auth/refresh");
        // Retry original request
        return api.request(error.config);
      } catch {
        // Refresh failed — session truly expired
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    // For auth routes that fail with 401 — don't dispatch unauthorized
    // (wrong credentials is expected, not a session expiry)
    if (status === 401 && !isAuthRoute) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    // CSRF retry — reset token and try again with fresh one
    if (
      status === 403 &&
      message === "Invalid CSRF token" &&
      !error.config?._csrfRetry
    ) {
      csrfToken = null; // Reset cached token
      error.config._csrfRetry = true;
      try {
        const token = await ensureCsrfToken();
        error.config.headers = error.config.headers || {};
        error.config.headers["x-csrf-token"] = token;
        return api.request(error.config);
      } catch (err) {
        console.error("CSRF retry failed:", err);
        return Promise.reject({ status, message, errors: error.response?.data?.errors || [] });
      }
    }

    // If CSRF failure after retry, clear token
    if (status === 403 && message === "Invalid CSRF token") {
      csrfToken = null;
    }

    return Promise.reject({ status, message, errors: error.response?.data?.errors || [] });
  }
);

export default api;
