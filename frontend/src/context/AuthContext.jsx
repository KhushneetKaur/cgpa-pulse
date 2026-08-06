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
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authErr,     setAuthErr]     = useState(null);
  const pingDone = useRef(false);

  // ── Wake Render — best effort, runs once ───────────────────────────
  const pingBackend = useCallback(async () => {
    if (pingDone.current) return;
    pingDone.current = true;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/health`, {
        signal: AbortSignal.timeout(12000),
      });
    } catch {
      // ignore — cold-start ping, non-blocking
    }
  }, []);

  // ── Session restore on mount ───────────────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      // 1. Check for Google OAuth redirect in URL hash
      const hash  = window.location.hash;
      const token = new URLSearchParams(hash.replace("#", "?")).get("access_token");

      if (token) {
        window.history.replaceState(null, "", window.location.pathname);
        try {
          await pingBackend();
          const { user: u } = await apiGoogleSignIn(token);
          setUser(u);
          localStorage.setItem(WAS_LOGGED_IN_KEY, "1");
        } catch (e) {
          setAuthErr(e.message || "Google login failed");
        } finally {
          setAuthLoading(false);
        }
        return;
      }

      // 2. No redirect — skip restore for first-time visitors
      const wasLoggedIn = localStorage.getItem(WAS_LOGGED_IN_KEY) === "1";
      if (!wasLoggedIn) {
        setAuthLoading(false);
        return;
      }

      // 3. Returning user — wake backend and restore
      try {
        await pingBackend();

        // Fast path: access token still valid
        try {
          const u = await apiGetMe();
          setUser(u);
          return;
        } catch {
          // Access token expired — fall through to refresh
        }

        // Slow path: use refresh token (rotates on every call)
        const { user: u } = await apiRefresh();
        setUser(u);
      } catch {
        // Both failed — session truly expired after 30 days
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
      setUser(prev => {
        if (prev !== null) setAuthErr("Session expired — please log in again");
        return null;
      });
      localStorage.removeItem(WAS_LOGGED_IN_KEY);
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // ── Google login (called from AuthContext.useEffect above too) ────
  const googleLogin = useCallback(async (accessToken) => {
    const { user: u, isNewUser } = await apiGoogleSignIn(accessToken);
    setUser(u);
    localStorage.setItem(WAS_LOGGED_IN_KEY, "1");
    return { user: u, isNewUser };
  }, []);

  // ── Logout ────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await apiLogout(); } catch {}
    setUser(null);
    localStorage.removeItem(WAS_LOGGED_IN_KEY);
  }, []);

  // ── Clear transient auth error ────────────────────────────────────
  const clearForm = useCallback(() => setAuthErr(null), []);

  const value = useMemo(() => ({
    user, setUser,
    authLoading,
    authErr, setAuthErr,
    googleLogin,
    logout,
    clearForm,
  }), [user, authLoading, authErr, googleLogin, logout, clearForm]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}