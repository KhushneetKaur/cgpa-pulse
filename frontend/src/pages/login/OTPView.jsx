import { useState } from "react";
import toast from "react-hot-toast";

export default function OTPView({
  dark, email, userId,
  verifyOTP, resendOTP,
  onVerified, onExpired, otpResent, setOtpResent,
}) {
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  async function handleVerify() {
    if (otp.length !== 6) { setErr("Enter the 6-digit OTP"); return; }
    setErr("");
    setLoading(true);
    try {
      await verifyOTP(userId, otp);
      toast.success("Email verified! You can now log in ✅");
      onVerified();
    } catch (e) {
      const msg = e.message || "Invalid OTP";
      const isExpired = msg.toLowerCase().includes("otp expired") ||
        msg.toLowerCase().includes("signup request expired");

      if (isExpired) {
        const expiredMsg = "Account not created. Enter details again to create an account.";
        setErr(expiredMsg);
        toast.error(expiredMsg, { duration: 5000 });
        onExpired?.();
        return;
      }

      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await resendOTP(userId);
      setOtpResent(true);
      toast.success("New OTP sent to your email");
      setTimeout(() => setOtpResent(false), 5000);
    } catch (e) {
      toast.error(e.message || "Failed to resend OTP");
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
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 36, margin: "0 0 10px" }}>📬</p>
        <h3 style={{
          margin: "0 0 6px", fontSize: 20, fontWeight: 800,
          color: dark ? "rgba(255,255,255,0.9)" : "#1e1b4b",
        }}>
          Verify your email
        </h3>
        <p style={{
          margin: 0, fontSize: 13, lineHeight: 1.6,
          color: dark ? "rgba(255,255,255,0.45)" : "#5b5687",
        }}>
          We sent a 6-digit code to{" "}
          <strong style={{ color: dark ? "#a78bfa" : "#7c3aed" }}>
            {email}
          </strong>
          <br />
          This code expires in 5 minutes.
        </p>
      </div>

      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={otp}
        onChange={e => {
          setErr("");
          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
        }}
        onKeyDown={e => e.key === "Enter" && handleVerify()}
        placeholder="000000"
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "16px", fontSize: 28, fontWeight: 800,
          textAlign: "center", letterSpacing: "0.4em",
          borderRadius: 14,
          border: `2px solid ${err ? "#dc2626" : dark ? "rgba(167,139,250,0.3)" : "rgba(124,58,237,0.2)"}`,
          background: dark ? "rgba(255,255,255,0.06)" : "#fff",
          color: dark ? "rgba(255,255,255,0.9)" : "#1e1b4b",
          outline: "none", marginBottom: 12, fontFamily: "inherit",
        }}
      />

      {err && (
        <p style={{
          margin: "0 0 12px", fontSize: 12, textAlign: "center",
          color: dark ? "#fc6b6b" : "#dc2626", fontWeight: 500,
        }}>
          ⚠ {err}
        </p>
      )}

      {otpResent && (
        <p style={{
          margin: "0 0 12px", fontSize: 12, textAlign: "center",
          color: dark ? "#34d399" : "#059669", fontWeight: 500,
        }}>
          ✅ New OTP sent!
        </p>
      )}

      <button
        onClick={handleVerify}
        disabled={loading || otp.length !== 6}
        style={{
          width: "100%", padding: "13px", fontSize: 14, fontWeight: 700,
          borderRadius: 14, border: "none", fontFamily: "inherit",
          cursor: loading || otp.length !== 6 ? "not-allowed" : "pointer",
          background: dark
            ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
            : "linear-gradient(135deg,#7c3aed,#10b981)",
          color: "#fff", opacity: loading || otp.length !== 6 ? 0.6 : 1,
          marginBottom: 14, transition: "all 0.18s",
        }}
      >
        {loading ? "Verifying..." : "Verify Email →"}
      </button>

      <p style={{
        textAlign: "center", fontSize: 12, margin: 0,
        color: dark ? "rgba(255,255,255,0.35)" : "#a09bbf",
      }}>
        Didn't receive it?{" "}
        <button
          onClick={handleResend}
          style={{
            background: "transparent", border: "none",
            color: dark ? "#a78bfa" : "#7c3aed",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            padding: 0, fontFamily: "inherit",
          }}
        >
          Resend OTP
        </button>
      </p>
    </div>
  );
}
