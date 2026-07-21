import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  apiSignup,
  apiLogin,
  apiLogout,
  apiGetMe,
  apiGoogleSignIn,
} from "../services/auth.api.js";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const hasGoogleRedirect = window.location.hash.includes("access_token");
  const [authLoading, setAuthLoading] = useState(true);
  const [googleProcessing, setGoogleProcessing] = useState(hasGoogleRedirect);
  const [authErr, setAuthErr] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [uname, setUname] = useState("");
  const [pwd, setPwd] = useState("");

  // ── Wake Render + restore session ──────────────────────────
  useEffect(() => {
    const backendUrl = (import.meta.env.VITE_API_URL || "").replace("/api", "");
    if (backendUrl && backendUrl.includes("onrender")) {
      fetch(`${backendUrl}/health`).catch(() => {});
    }

    async function restoreSession() {
      let timeout = null;
      try {
        // ── Check for Google OAuth redirect in URL hash ──
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const googleToken = hash.get("access_token");

        if (googleToken) {
          window.history.replaceState({}, "", window.location.pathname);
          try {
            const isNew = await googleLogin(googleToken);
            toast.success(
              isNew
                ? "Account created! Welcome to CGPA Pulse 🎉"
                : "Welcome back! 🎉"
            );
          } catch {
            toast.error("Google sign-in failed");
          } finally {
            setGoogleProcessing(false);
            setAuthLoading(false);
          }
          return;
        }

        // ── Normal session restore ──
        const controller = new AbortController();
        timeout = setTimeout(() => controller.abort(), 8000);
        const userData = await apiGetMe(controller.signal);
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        if (timeout) clearTimeout(timeout);
        setAuthLoading(false);
      }
    }

    restoreSession();
  }, []);

  // ── Listen for 401 from API interceptor ─────────────────────
  useEffect(() => {
    function handleUnauthorized() {
      setUser((prev) => {
        if (prev !== null) {
          setAuthErr("Session expired — please log in again");
        }
        return null;
      });
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // ── Google login ─────────────────────────────────────────────
  const googleLogin = useCallback(async (credential) => {
    setAuthErr("");
    try {
      const data = await apiGoogleSignIn(credential);
      setUser(data.user);
      return data.isNewUser;
    } catch (err) {
      setAuthErr(err.message || "Google sign-in failed");
      throw err;
    }
  }, []);

  // ── Signup ───────────────────────────────────────────────────
  const signup = useCallback(
    async (email) => {
      setAuthErr("");
      try {
        const userData = await apiSignup({
          username: uname.trim(),
          email: email.trim(),
          password: pwd,
        });
        return userData;
      } catch (err) {
        setAuthErr(err.message || "Signup failed");
        throw err;
      }
    },
    [uname, pwd]
  );

  // ── Login ────────────────────────────────────────────────────
  const login = useCallback(async () => {
    setAuthErr("");
    try {
      const userData = await apiLogin({
        identifier: uname.trim(),
        password: pwd,
      });
      setUser(userData);
      return true;
    } catch (err) {
      setAuthErr(err.message || "Login failed");
      throw err;
    }
  }, [uname, pwd]);

  // ── Logout ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Clear local state regardless
    } finally {
      setUser(null);
      setUname("");
      setPwd("");
      setAuthErr("");
    }
  }, []);

  // ── Clear form ───────────────────────────────────────────────
  const clearForm = useCallback(() => {
    setUname("");
    setPwd("");
    setAuthErr("");
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      authErr,
      setAuthErr,
      authLoading,
      logout,
      clearForm,
      googleLogin,
    }),
    [user, authErr, authLoading, logout, clearForm, googleLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}