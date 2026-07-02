import { useState } from "react";

export default function ForgotView({
  dark, forgotEmail, setForgotEmail,
  forgotPassword, onSent, onBack,
}) {
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  async function handleSubmit() {
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setErr("Enter a valid email address"); return;
    }
    setErr(""); setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      onSent();
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const glassCard = {
    background:     dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.78)",
    backdropFilter: "blur(24px)",
    border:         `1.5px solid ${dark ? "rgba(167,139,250,0.18)" : "rgba(124,58,237,0.12)"}`,
    borderRadius:   24, padding: "32px 28px",
    boxShadow:      dark ? "0 12px 60px rgba(0,0,0,0.55)" : "0 12px 60px rgba(124,58,237,0.1)",
  };

  return (
    <div style={{ ...glassCard, animation: "scaleIn 0.25s ease both" }}>
      <button
        onClick={onBack}
        style={{
          background: "transparent", border: "none",
          color: dark ? "rgba(255,255,255,0.45)" : "#a09bbf",
          fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          padding: "0 0 16px", display: "flex", alignItems: "center", gap: 6,
        }}
      >
        ← Back
      </button>

      <h3 style={{
        margin: "0 0 6px", fontSize: 20, fontWeight: 800,
        color: dark ? "rgba(255,255,255,0.9)" : "#1e1b4b",
      }}>
        Forgot password?
      </h3>
      <p style={{
        margin: "0 0 22px", fontSize: 13, lineHeight: 1.6,
        color: dark ? "rgba(255,255,255,0.45)" : "#5b5687",
      }}>
        Enter your registered email — we'll send you a reset link.
      </p>

      <input
        type="email"
        value={forgotEmail}
        onChange={e => { setForgotEmail(e.target.value); setErr(""); }}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        placeholder="you@example.com"
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "12px 14px", fontSize: 14, fontFamily: "inherit",
          borderRadius: 12, outline: "none", marginBottom: 12,
          background: dark ? "rgba(255,255,255,0.07)" : "#fff",
          border: `1.5px solid ${err ? "#dc2626" : dark ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.18)"}`,
          color: dark ? "rgba(255,255,255,0.88)" : "#1e1b4b",
        }}
      />

      {err && (
        <p style={{
          margin: "0 0 12px", fontSize: 12, fontWeight: 500,
          color: dark ? "#fc6b6b" : "#dc2626",
        }}>
          ⚠ {err}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%", padding: "13px", fontSize: 14, fontWeight: 700,
          borderRadius: 14, border: "none", fontFamily: "inherit",
          cursor: loading ? "not-allowed" : "pointer",
          background: dark
            ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
            : "linear-gradient(135deg,#7c3aed,#10b981)",
          color: "#fff", opacity: loading ? 0.7 : 1, transition: "all 0.18s",
        }}
      >
        {loading ? "Sending..." : "Send Reset Link →"}
      </button>
    </div>
  );
}