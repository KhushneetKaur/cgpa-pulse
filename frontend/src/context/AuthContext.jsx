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
  apiVerifyOTP,
  apiResendOTP,
  apiForgotPassword,
  apiResetPassword,
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
  const [authLoading, setAuthLoading] = useState(true); // true on mount
  const [isSignup,    setIsSignup]    = useState(false);
  const [uname,       setUname]       = useState("");
  const [pwd,         setPwd]         = useState("");

  // ── Restore session on app load ───────────────────────────────────────────
  // Hits /api/auth/me — if cookie is valid, returns user and we skip login
  useEffect(() => {
    async function restoreSession() {
      try {
        await fetch(
      `${import.meta.env.VITE_API_URL?.replace("/api", "")}/health`
      || "https://cgpa-pulse-backend.onrender.com/health"
    ).catch(() => {}); 
        const user = await apiGetMe();
        setUser(user);
      } catch {
        // No valid session — stay on login screen
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    restoreSession();
  }, []);

  // ── Listen for 401 from API interceptor ──────────────────────────────────
  // When token expires mid-session, force back to login
  useEffect(() => {
    function handleUnauthorized() {
      setUser(prev => {
        if (prev !== null) {
          // Was logged in — session expired mid-session
          setAuthErr("Session expired — please log in again");
        }
        return null;
      });
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
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
      return { userId: data.user.id, email: email.trim() };
    } catch (err) {
      setAuthErr(err.message || "Signup failed");
      throw err;
    }
  }, [uname, pwd]);

  // ── Login ───────────────────────────────────────────────────────────
  const login = useCallback(async () => {
    setAuthErr("");
    try {
      // identifier = username or email — we send uname field
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
      // Even if API call fails, clear local state
    } finally {
      setUser(null);
      setUname("");
      setPwd("");
      setAuthErr("");
    }
  }, []);

  const verifyOTP = useCallback(async (userId, otp) => {
    setAuthErr("");
    try {
      const user = await apiVerifyOTP(userId, otp);
      // After verification — don't auto-login, switch to login mode
      setIsSignup(false);
      return "verified";
    } catch (err) {
      setAuthErr(err.message || "OTP verification failed");
      throw err;
    }
  }, []);

  const resendOTP = useCallback(async (userId) => {
    setAuthErr("");
    try {
      await apiResendOTP(userId);
    } catch (err) {
      setAuthErr(err.message || "Failed to resend OTP");
      throw err;
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
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    clearForm,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
