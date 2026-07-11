import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  apiSignup,
  apiLogin,
  apiLogout,
  apiGetMe,
  apiGoogleSignIn,
} from "../services/auth.api.js";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authErr,     setAuthErr]     = useState("");
  const [isSignup,    setIsSignup]    = useState(false);
  const [uname,       setUname]       = useState("");
  const [pwd,         setPwd]         = useState("");

  // ── Wake Render + restore session ──────────────────────────
  useEffect(() => {
    const backendUrl = (import.meta.env.VITE_API_URL || "").replace("/api", "");
    if (backendUrl && backendUrl.includes("onrender")) {
      fetch(`${backendUrl}/health`).catch(() => {});
    }

    async function restoreSession() {
      try {
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), 5000);
        const user       = await apiGetMe(controller.signal);
        clearTimeout(timeout);
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    restoreSession();
  }, []);

  // ── Listen for 401 from API interceptor ─────────────────────
  useEffect(() => {
    function handleUnauthorized() {
      setUser(prev => {
        if (prev !== null) {
          setAuthErr("Session expired — please log in again");
        }
        return null;
      });
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // ── Google login ─────────────────────────────────────────────
  const googleLogin = useCallback(async (credential) => {
    setAuthErr("");
    try {
      const user = await apiGoogleSignIn(credential);
      setUser(user);
    } catch (err) {
      setAuthErr(err.message || "Google sign-in failed");
      throw err;
    }
  }, []);

  // ── Signup ───────────────────────────────────────────────────
  const signup = useCallback(async (email) => {
    setAuthErr("");
    try {
      const user = await apiSignup({
        username: uname.trim(),
        email:    email.trim(),
        password: pwd,
      });
      return user;
    } catch (err) {
      setAuthErr(err.message || "Signup failed");
      throw err;
    }
  }, [uname, pwd]);

  // ── Login ────────────────────────────────────────────────────
  const login = useCallback(async () => {
    setAuthErr("");
    try {
      const user = await apiLogin({
        identifier: uname.trim(),
        password:   pwd,
      });
      setUser(user);
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

  const value = {
    user,
    authErr,
    setAuthErr,
    authLoading,
    isSignup,
    setIsSignup,
    uname,
    setUname,
    pwd,
    setPwd,
    login,
    signup,
    logout,
    clearForm,
    googleLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}