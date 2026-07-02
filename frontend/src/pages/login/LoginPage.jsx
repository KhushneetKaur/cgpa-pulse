import { useState, useEffect } from "react";
import { useAppData }    from "../../context/AppDataContext";
import LoginBackground   from "./LoginBackground";
import LoginHero         from "./LoginHero";
import LoginForm         from "./LoginForm";
import AboutModal        from "./AboutModal";
import OTPView           from "./OTPView";
import ForgotView        from "./ForgotView";
import DisclaimerModal from "../../components/DisclaimerModal";
import toast from "react-hot-toast"

export default function LoginPage() {
  const { dark, toggleDark , setUname, setPwd, setAuthErr, clearForm, setShowDisclaimer } = useAppData();

  const [showAbout,     setShowAbout]     = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [formMode,      setFormMode]      = useState("login");
  const [mounted,       setMounted]       = useState(false);
  // ── Lifted OTP/view state — survives LoginForm re-renders ──
  const [modalView,     setModalView]     = useState("auth");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [pendingEmail,  setPendingEmail]  = useState("");
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [otpResent,     setOtpResent]     = useState(false);

useEffect(() => {
  // Clear any stale form values from previous session
  clearForm();
  const t = setTimeout(() => setMounted(true), 80);
  return () => clearTimeout(t);
}, []);

  function handleAuth(mode) {
  clearForm();
  setFormMode(mode);
  setModalView("auth");
  setShowForm(true);
}

  function handleSignupSuccess(userId, email) {
    setPendingUserId(userId);
    setPendingEmail(email);
    setModalView("otp");
  }

  function handleOTPVerified() {
    setModalView("auth");
    setSignupSuccess(true);
  }

  function handleClose() {
  if (modalView === "otp") {
    toast("Account not verified — sign in to resend your OTP", { 
      icon: "⚠️",
      duration: 5000,
    });
  }
  setShowForm(false);
  setModalView("auth");
}

  return (
    <div style={{
      minHeight:     "100vh",
      display:       "flex",
      flexDirection: "column",
      alignItems:    "center",
      position:      "relative",
      overflowX:     "hidden",
    }}>
      <LoginBackground dark={dark} />

      <button
        onClick={toggleDark}
        style={{
          position:       "fixed",
          top:            "clamp(14px,2.5vw,20px)",
          right:          "clamp(14px,3vw,22px)",
          zIndex:         50,
          width:          38, height: 38,
          borderRadius:   "50%",
          background:     dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
          border:         `1.5px solid ${dark ? "rgba(255,255,255,0.14)" : "rgba(124,58,237,0.16)"}`,
          backdropFilter: "blur(14px)",
          color:          dark ? "rgba(255,255,255,0.7)" : "#7c3aed",
          fontSize:       16, cursor: "pointer",
          display:        "flex", alignItems: "center", justifyContent: "center",
          fontFamily:     "inherit", transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {dark ? "☀" : "☾"}
      </button>

      <LoginHero
        onAuth={handleAuth}
        onAbout={() => setShowAbout(true)}
        onDisclaimer={() => setShowDisclaimer(true)}
        mounted={mounted}
      />

      {showForm && (
        <FormModal
          dark={dark}
          formMode={formMode}
          modalView={modalView}
          setModalView={setModalView}
          pendingUserId={pendingUserId}
          pendingEmail={pendingEmail}
          forgotEmail={forgotEmail}
          setForgotEmail={setForgotEmail}
          signupSuccess={signupSuccess}
          otpResent={otpResent}
          setOtpResent={setOtpResent}
          onSignupSuccess={handleSignupSuccess}
          onOTPVerified={handleOTPVerified}
          onClose={handleClose}
        />
      )}

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} dark={dark} />
      )}

      <DisclaimerModal />
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function FormModal({
  dark, formMode, modalView, setModalView,
  pendingUserId, pendingEmail,
  forgotEmail, setForgotEmail,
  signupSuccess, otpResent, setOtpResent,
  onSignupSuccess, onOTPVerified, onClose,
}) {
  const { setIsSignup, verifyOTP, resendOTP, forgotPassword, authErr, setAuthErr } = useAppData();

  useEffect(() => {
    setIsSignup(formMode === "signup");
  }, [formMode, setIsSignup]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
  <div
    onClick={onClose}
    style={{
      position:             "fixed",
      inset:                0,
      zIndex:               200,
      background:           "rgba(0,0,0,0.55)",
      backdropFilter:       "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      display:              "flex",
      alignItems:           "center",
      justifyContent:       "center",
      padding:              "1rem",
      overflowY:            "auto",
      animation:            "fadeUp 0.22s ease both",
    }}
  >
    <div
  onClick={e => e.stopPropagation()}
  style={{
    width:     "100%",
    maxWidth:  "min(440px, 96vw)",
    position:  "relative",
    margin:    "auto",
    animation: "scaleIn 0.25s ease both",
  }}
>

      {/* OTP view */}
      {modalView === "otp" && (
        <OTPView
          dark={dark}
          email={pendingEmail}
          userId={pendingUserId}
          verifyOTP={verifyOTP}
          resendOTP={resendOTP}
          onVerified={onOTPVerified}
          otpResent={otpResent}
          setOtpResent={setOtpResent}
        />
      )}

      {/* Forgot password view */}
      {modalView === "forgot" && (
        <ForgotView
          dark={dark}
          forgotEmail={forgotEmail}
          setForgotEmail={setForgotEmail}
          forgotPassword={forgotPassword}
          onSent={() => setModalView("forgotSent")}
          onBack={() => { setModalView("auth"); setAuthErr(""); }}
        />
      )}

      {/* Forgot sent view */}
      {modalView === "forgotSent" && (
        <ForgotSentView
          dark={dark}
          forgotEmail={forgotEmail}
          onBack={() => { setModalView("auth"); setAuthErr(""); }}
        />
      )}

      {/* Main auth form */}
      {modalView === "auth" && (
        <LoginForm
          mounted={true}
          signupSuccess={signupSuccess}
          onSignupSuccess={onSignupSuccess}
          onForgot={() => { setModalView("forgot"); setAuthErr(""); }}
          onClose={onClose}
        />
      )}
    </div>
  </div>
);
}

function ForgotSentView({ dark, forgotEmail, onBack }) {
  const glassCard = {
    background:     dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.78)",
    backdropFilter: "blur(24px)",
    border:         `1.5px solid ${dark ? "rgba(167,139,250,0.18)" : "rgba(124,58,237,0.12)"}`,
    borderRadius:   24, padding: "32px 28px",
    boxShadow:      dark ? "0 12px 60px rgba(0,0,0,0.55)" : "0 12px 60px rgba(124,58,237,0.1)",
  };

  return (
    <div style={{ ...glassCard, animation: "scaleIn 0.25s ease both" }}>
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <p style={{ fontSize: 40, margin: "0 0 12px" }}>📧</p>
        <h3 style={{
          margin: "0 0 8px", fontSize: 18, fontWeight: 800,
          color: dark ? "rgba(255,255,255,0.9)" : "#1e1b4b",
        }}>
          Check your inbox
        </h3>
        <p style={{
          margin: "0 0 20px", fontSize: 13, lineHeight: 1.6,
          color: dark ? "rgba(255,255,255,0.5)" : "#5b5687",
        }}>
          We sent a reset link to <strong>{forgotEmail}</strong>.
          Check your spam folder if you don't see it.
        </p>
        <button
          onClick={onBack}
          style={{
            background: "transparent", border: "none",
            color: dark ? "#a78bfa" : "#7c3aed",
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
}