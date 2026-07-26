import { useState, useEffect } from "react";
import { useAppData } from "../context/AppDataContext";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { dark } = useAppData();
  const [tokenValid, setTokenValid] = useState(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenValid(false);
        setLoading(false);
        return;
      }
      try {
        const { apiValidateResetToken } = await import("../services/auth.api.js");
        const res = await apiValidateResetToken(token);
        if (res.valid) {
          setTokenValid(true);
          setEmail(res.email);
        } else {
          setTokenValid(false);
        }
      } catch (err) {
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    }
    checkToken();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setResetting(true);
    try {
      const { apiResetPassword } = await import("../services/auth.api.js");
      await apiResetPassword(token, newPassword);
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "#080c18" : "#f4f3ff" }}>
        <p style={{ color: dark ? "#a78bfa" : "#7c3aed" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: dark ? "linear-gradient(160deg,#080c18 0%,#0f1133 55%,#080c18 100%)" : "linear-gradient(160deg,#f4f3ff 0%,#ede9fe 55%,#f4f3ff 100%)",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: dark ? "rgba(13,14,26,0.95)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(32px)",
        border: `1px solid ${dark ? "rgba(167,139,250,0.18)" : "rgba(124,58,237,0.12)"}`,
        borderRadius: 24,
        padding: "32px 24px",
        boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 20px 60px rgba(109,40,217,0.15)",
        textAlign: "center"
      }}>
        {!tokenValid ? (
          <>
            <h2 style={{ margin: "0 0 16px", color: dark ? "#fff" : "#1e1b4b" }}>Invalid Link</h2>
            <p style={{ color: dark ? "rgba(255,255,255,0.6)" : "#5b5687", marginBottom: 24 }}>This password reset link is invalid or has expired.</p>
            <button
              onClick={() => window.location.href = "/"}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Back to Login
            </button>
          </>
        ) : success ? (
          <>
            <h2 style={{ margin: "0 0 16px", color: dark ? "#fff" : "#1e1b4b" }}>Password Reset!</h2>
            <p style={{ color: dark ? "rgba(255,255,255,0.6)" : "#5b5687", marginBottom: 24 }}>Your password has been successfully changed.</p>
            <p style={{ color: dark ? "rgba(255,255,255,0.4)" : "#a09bbf", fontSize: 13 }}>Redirecting to login...</p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ margin: "0 0 8px", color: dark ? "#fff" : "#1e1b4b" }}>Set New Password</h2>
            {email && <p style={{ color: dark ? "rgba(255,255,255,0.5)" : "#5b5687", fontSize: 13, marginBottom: 24 }}>for {email}</p>}
            
            <input
              type="password"
              placeholder="New password (min 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                borderRadius: 12,
                border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
                background: dark ? "rgba(255,255,255,0.05)" : "#fff",
                color: dark ? "#fff" : "#1e1b4b",
                marginBottom: 24,
                outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={resetting}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                cursor: resetting ? "not-allowed" : "pointer",
                opacity: resetting ? 0.7 : 1
              }}
            >
              {resetting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
