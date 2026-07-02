import axios from "axios";

// ── Base Axios instance ───────────────────────────────────────────────────────
// All API calls go through this — base URL, credentials, timeout set once here

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,   // send httpOnly cookie on every request
  timeout:         10000,  // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfToken = null;
const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;

  const res = await api.get("/auth/csrf", {
    skipCsrf: true,
  });

  csrfToken = res.data.csrfToken;
 
  return csrfToken;
}

// ── Request interceptor ───────────────────────────────────────────────────────
// Runs before every request — good place to attach tokens if needed

const CSRF_SKIP_URLS = [
  "/auth/login",
  "/auth/signup",
  "/auth/logout",
  "/auth/csrf",
];

api.interceptors.request.use(
  async (config) => {
    const method = config.method?.toLowerCase();
    const url    = config.url || "";

    const skipCsrf =
      config.skipCsrf ||
      !MUTATING_METHODS.has(method) ||
      CSRF_SKIP_URLS.some(u => url.includes(u));

    if (!skipCsrf) {
      config.headers = config.headers || {};
      config.headers["x-csrf-token"] = await ensureCsrfToken();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
// Runs after every response
// — unwraps the data so callers get { user } not { success, data: { user } }
// — handles 401 globally by clearing local state

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || "Something went wrong";
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

    // CSRF retry
    if (
      status === 403 &&
      message === "Invalid CSRF token" &&
      !error.config?._csrfRetry
    ) {
      csrfToken = null;
      const retryConfig = { ...error.config, _csrfRetry: true };
      return ensureCsrfToken().then(token => {
        retryConfig.headers = retryConfig.headers || {};
        retryConfig.headers["x-csrf-token"] = token;
        return api.request(retryConfig);
      });
    }

    if (status === 403 && message === "Invalid CSRF token") {
      csrfToken = null;
    }

    return Promise.reject({ status, message, errors: error.response?.data?.errors || [] });
  }
);

export default api;
