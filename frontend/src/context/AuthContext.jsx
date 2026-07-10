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
  apiForgotPassword,
  apiResetPassword,
  apiGoogleSignIn, // Merged import cleanly
} from "../services/auth.api.js";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [authErr,     setAuthErr]     = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [isSignup,    setIsSignup]    = useState(false);
  const [uname,       setUname]       = useState("");
  const [pwd,         setPwd]         = useState("");

  // ── Restore session on app load ───────────────────────────────────────────
  useEffect(() => {
    const backendUrl = (import.meta.env.VITE_API_URL || "").replace("/api", "");
    if (backendUrl && backendUrl.includes("onrender")) {
      fetch(`${backendUrl}/health`).catch(() => {});
    }

    async function restoreSession() {
      try {
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), 5000);

        const user = await apiGetMe(controller.signal);
        clearTimeout(timeout);
        setUser(user);
      } catch (err) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    restoreSession();
  }, []);

  // ── Listen for 401 from API interceptor ──────────────────────────────────
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

  // ── Google OAuth Login (MOVED SAFELY INSIDE THE PROVIDER COMPONENT) ───────
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

  // ── Signup ───────────────────────────────────────────────────────────
  const signup = useCallback(async (email) => {
    setAuthErr("");
    try {
      const data = await apiSignup({
        username: uname.trim(),
        email:    email.trim(),
        password: pwd,
      });
      const pendingSignup = data.pendingSignup;
      if (!pendingSignup?.id) {
        throw new Error("Signup started but OTP verification data was missing");
      }
      return {
        userId: pendingSignup.id,
        email: pendingSignup.email || email.trim(),
        expiresAt: pendingSignup.expiresAt,
      };
    } catch (err) {
      setAuthErr(err.message || "Signup failed");
      throw err;
    }
  }, [uname, pwd]);

  // ── Login ───────────────────────────────────────────────────────────
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

  // ── Logout ──────────────────────────────────────────────────────────
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

  const forgotPassword = useCallback(async (email) => {
    setAuthErr("");
    try {
      await apiForgotPassword(email);
      return "sent";
    } catch (err) {
      setAuthErr(err.message || "Failed to send reset email");
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    setAuthErr("");
    try {
      await apiResetPassword(token, password);
      setIsSignup(false);
      return "reset";
    } catch (err) {
      setAuthErr(err.message || "Password reset failed");
      throw err;
    }
  }, []);

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
    forgotPassword,
    resetPassword,
    clearForm,
    googleLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}