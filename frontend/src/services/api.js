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
  withCredentials: true, 
  timeout: 30000,        
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


// Fast synchronous/asynchronous CSRF fetch
async function ensureCsrfToken(forceFresh = false) {
  if (forceFresh) {
    csrfToken = null;
    csrfTokenPromise = null;
  }

  // Read directly from browser cookie first
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

// ── Request Interceptor (NON-BLOCKING) ───────────────────────────────────────
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  // 1. Attach Bearer Token from localStorage for mobile Safari & Android WebViews
  const localToken = localStorage.getItem("accessToken");
  if (localToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${localToken}`;
  }

  // 2. Synchronous CSRF Token Injection (NO await = ZERO lag)
  const method = config.method?.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const activeCsrf = csrfToken || getCookie("csrfToken");
    if (activeCsrf) {
      config.headers["x-csrf-token"] = activeCsrf;
    }
  }

  return config;
});

// ── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    const payload = response.data;

    // AUTOMATIC TOKEN CAPTURE: Store returned access tokens
    const newAccessToken =
      payload?.data?.accessToken ||
      payload?.accessToken ||
      payload?.data?.token ||
      payload?.token;

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
      "/health",
    ].some((u) => url.includes(u));

    // ── Token Refresh on 401 ─────────────────────────────────────────────────
    if (status === 401 && !isAuthRoute && !error.config?._retry) {
      error.config._retry = true;
      try {
        const refreshRes = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const refreshedToken =
          refreshRes?.data?.data?.accessToken ||
          refreshRes?.data?.accessToken;

        if (refreshedToken) {
          localStorage.setItem("accessToken", refreshedToken);
          error.config.headers = error.config.headers || {};
          error.config.headers.Authorization = `Bearer ${refreshedToken}`;
          return api.request(error.config);
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("cgpapulse_was_logged_in");
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        return Promise.reject({ status, message: "Session expired" });
      }
    }

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("cgpapulse_was_logged_in");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    // ── Robust CSRF Error Detection & On-Demand Fallback Retry ──────────────
    const isCsrfError =
      (status === 403 || status === 400) &&
      rawMessage.toLowerCase().includes("csrf");

    if (isCsrfError && !error.config?._csrfRetry) {
      error.config._csrfRetry = true;

      try {
        const newToken = await ensureCsrfToken(true);
        error.config.headers = error.config.headers || {};
        error.config.headers["x-csrf-token"] = newToken;

        return api(error.config);
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