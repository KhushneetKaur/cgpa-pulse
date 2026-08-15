import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  apiLogout,
  apiGetMe,
  apiGoogleSignIn,
  apiRefresh,
} from "../services/auth.api.js";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

const WAS_LOGGED_IN_KEY = "cgpapulse_was_logged_in";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authErr, setAuthErr] = useState(null);
  const pingDone = useRef(false);

  // ── Wake Render — non-blocking background trigger ───────────────────
  const pingBackend = useCallback(() => {
    if (pingDone.current) return;
    pingDone.current = true;
    
    // Normalize URL to hit /api/health reliably
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";
    const healthUrl = baseUrl.endsWith("/api") ? `${baseUrl}/health` : `${baseUrl}/api/health`;

    fetch(healthUrl, {
      signal: AbortSignal.timeout(12000),
    }).catch(() => {
      // Non-blocking ping catch
    });
  }, []);

  // ── Helper to safely extract token from Hash OR Query Params ──────
  const extractAccessToken = () => {
    const hash = window.location.hash;
    const search = window.location.search;

    let token = new URLSearchParams(hash.replace("#", "?")).get("access_token");

    if (!token) {
      token =
        new URLSearchParams(search).get("access_token") ||
        new URLSearchParams(search).get("token");
    }

    return token;
  };

  // ── Session restore on mount ───────────────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = extractAccessToken();

        // 1. Check for Google OAuth redirect in URL
        if (token) {
          localStorage.setItem(WAS_LOGGED_IN_KEY, "1");
          pingBackend(); // Non-blocking!

          // Authenticate FIRST before wiping URL parameters
          const res = await apiGoogleSignIn(token);
          const u = res?.user ?? res;

          // Clean URL parameters only after successful auth
          window.history.replaceState(null, "", window.location.pathname);
          setUser(u);
          return;
        }

        // 2. No redirect — skip restore for first-time visitors
        const wasLoggedIn = localStorage.getItem(WAS_LOGGED_IN_KEY) === "1";
        if (!wasLoggedIn) {
          return;
        }

        // 3. Returning user — wake backend in parallel
        pingBackend();

        // Fast path: access token still valid
        try {
          const u = await apiGetMe();
          setUser(u);
          return;
        } catch {
          // Access token expired or cookie dropped — try refresh
        }

        // Slow path: use refresh token
        try {
          const res = await apiRefresh();
          const u = res?.user ?? res;
          setUser(u);
        } catch {
          localStorage.removeItem(WAS_LOGGED_IN_KEY);
          setUser(null);
        }
      } catch (e) {
        setAuthErr(e.message || "Something went wrong — please try again.");
        localStorage.removeItem(WAS_LOGGED_IN_KEY);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    restoreSession();
  }, [pingBackend]);

  // ── Listen for 401 from axios interceptor ─────────────────────────
  useEffect(() => {
    function handleUnauthorized() {
      setUser((prev) => {
        if (prev !== null) setAuthErr("Session expired — please log in again");
        return null;
      });
      localStorage.removeItem(WAS_LOGGED_IN_KEY);
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // ── Google login (called manually from button click) ────────────────
  const googleLogin = useCallback(async (accessToken) => {
    try {
      const res = await apiGoogleSignIn(accessToken);
      const u = res?.user ?? res;
      setUser(u);
      localStorage.setItem(WAS_LOGGED_IN_KEY, "1");
      return { user: u, isNewUser: res?.isNewUser };
    } catch (e) {
      setAuthErr(e.message || "Login failed");
      throw e;
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {}
    setUser(null);
    localStorage.removeItem(WAS_LOGGED_IN_KEY);
  }, []);

  // ── Clear transient auth error ────────────────────────────────────
  const clearForm = useCallback(() => setAuthErr(null), []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      authLoading,
      authErr,
      setAuthErr,
      googleLogin,
      logout,
      clearForm,
    }),
    [user, authLoading, authErr, googleLogin, logout, clearForm]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}