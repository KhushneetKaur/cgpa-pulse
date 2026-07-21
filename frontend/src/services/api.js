import axios from "axios";

// ── Base Axios Instance ──────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Sends httpOnly cookies on cross-origin requests
  timeout: 30000,        // Accommodates backend cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfToken = null;
let csrfTokenPromise = null;

/**
 * Call this function immediately after login/OAuth redirect
 * so stale CSRF tokens are cleared from memory!
 */
export function resetCsrfToken() {
  csrfToken = null;
  csrfTokenPromise = null;
}

/**
 * Thread-safe CSRF fetch that prevents duplicate concurrent token requests.
 */
async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;

  if (!csrfTokenPromise) {
    csrfTokenPromise = axios
      .get(`${api.defaults.baseURL}/auth/csrf`, {
        withCredentials: true,
      })
      .then((res) => {
        // Unwraps response correctly regardless of data structure
        csrfToken =
          res.data?.data?.csrfToken ||
          res.data?.csrfToken ||
          res.data?.data?.token;
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
        // Proceed without header — backend will capture if required
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
        return api.request(error.config);
      } catch {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    if (status === 401 && !isAuthRoute) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    // 🟢 FIX: Case-insensitive check for CSRF errors
    const isCsrfError =
      status === 403 && rawMessage.toLowerCase().includes("csrf");

    // ── Invalid CSRF Token Retry Routine ────────────────────────────────────
    if (isCsrfError && !error.config?._csrfRetry) {
      csrfToken = null; // Clear stale token from memory
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

    if (isCsrfError) {
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