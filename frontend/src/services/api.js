import axios from "axios";

// ── Helper to read cookies ───────────────────────────────────────────────────
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// ── Base Axios Instance ──────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Sends httpOnly cookies when browser allows
  timeout: 30000,        // Accommodates backend cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfToken = null;
let csrfTokenPromise = null;

export function resetCsrfToken() {
  csrfToken = null;
  csrfTokenPromise = null;
}

/**
 * Thread-safe CSRF fetch that reads from cookie first, then falls back to /auth/csrf
 */
async function ensureCsrfToken(forceFresh = false) {
  if (forceFresh) {
    csrfToken = null;
    csrfTokenPromise = null;
  }

  // Try reading directly from browser cookie first
  const cookieVal = getCookie("csrfToken");
  if (cookieVal && !forceFresh) {
    csrfToken = cookieVal;
    return csrfToken;
  }

  if (csrfToken && !forceFresh) return csrfToken;

  if (!csrfTokenPromise) {
    csrfTokenPromise = axios
      .get(`${api.defaults.baseURL}/auth/csrf`, { withCredentials: true })
      .then((res) => {
        const payload = res.data;
        csrfToken =
          payload?.data?.csrfToken ||
          payload?.csrfToken ||
          payload?.data?.token ||
          payload?.token ||
          getCookie("csrfToken");

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
  config.headers = config.headers || {};

  // 1. 👈 CRITICAL FOR IPHONE/iOS: Attach Bearer Token from localStorage
  const localToken = localStorage.getItem("accessToken");
  if (localToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${localToken}`;
  }

  // 2. CSRF Token Injection
  const method = config.method?.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const url = config.url || "";
    const isExempt = ["/auth/logout", "/auth/refresh", "/auth/google"].some((u) =>
      url.includes(u)
    );

    if (!isExempt) {
      try {
        const token = await ensureCsrfToken();
        if (token) {
          config.headers["x-csrf-token"] = token;
        }
      } catch {
        // Proceed without header — backend will validate if required
      }
    }
  }

  return config;
});

// ── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    const payload = response.data;

    // 👈 AUTOMATIC TOKEN CAPTURE: Store returned access tokens automatically for iOS users
    const newAccessToken =
      payload?.data?.accessToken ||
      payload?.accessToken;

    if (newAccessToken) {
      localStorage.setItem("accessToken", newAccessToken);
    }

    return payload;
  },
  async (error) => {
    const status = error.response?.status;
    const rawMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

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
        const refreshRes = await api.post("/auth/refresh");
        const refreshedToken = refreshRes?.data?.accessToken || refreshRes?.accessToken;

        if (refreshedToken) {
          localStorage.setItem("accessToken", refreshedToken);
          error.config.headers = error.config.headers || {};
          error.config.headers.Authorization = `Bearer ${refreshedToken}`;
        }

        return api.request(error.config);
      } catch {
        localStorage.removeItem("accessToken");
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem("accessToken");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    // ── Robust CSRF Error Detection ──────────────────────────────────────────
    const isCsrfError =
      (status === 403 || status === 400) &&
      rawMessage.toLowerCase().includes("csrf");

    // ── Invalid CSRF Token Retry Routine ────────────────────────────────────
    if (isCsrfError && !error.config?._csrfRetry) {
      error.config._csrfRetry = true;

      try {
        const newToken = await ensureCsrfToken(true);
        error.config.headers = error.config.headers || {};
        error.config.headers["x-csrf-token"] = newToken;

        // Re-issue request with updated instance
        return axios(error.config);
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
      resetCsrfToken();
    }

    return Promise.reject({
      status,
      message,
      errors: error.response?.data?.errors || [],
    });
  }
);

export default api;