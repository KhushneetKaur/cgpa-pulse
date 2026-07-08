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

  // Track if we are on a phone screen size
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 480);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    clearForm();
    const t = setTimeout(() => setMounted(true), 80);
    
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener("resize", handleResize);
    
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function handleAuth(mode) {
    clearForm();
    setFormMode(mode);
    setModalView("auth");
    setIsFlipped(false);
    setShowForm(true);
  }

  // Handle "About" click based on device viewport
  function handleAboutClick() {
    if (isMobile) {
      handleAuth(formMode);
      setIsFlipped(true); // Flip card on phone
    } else {
      setShowAbout(true); // Open classic modal popup on laptop
    }
  }

  // Handle "Disclaimer" click based on device viewport
  function handleDisclaimerClick() {
    if (isMobile) {
      handleAuth(formMode);
      setIsFlipped(true); // Flip card on phone
    } else {
      setShowDisclaimer(true); // Open classic modal popup on laptop
    }
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
    setIsFlipped(false);
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
        onAbout={handleAboutClick}
        onDisclaimer={handleDisclaimerClick}
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
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          isMobile={isMobile}
        />
      )}

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} dark={dark} />
      )}

      <DisclaimerModal />
    </div>
  );
}

// ── Form Modal with Isolated Conditional 3D Engine ─────────────────────────────
function FormModal({
  dark, formMode, modalView, setModalView,
  pendingUserId, pendingEmail,
  forgotEmail, setForgotEmail,
  signupSuccess, otpResent, setOtpResent,
  onSignupSuccess, onOTPVerified, onClose,
  isFlipped, setIsFlipped, isMobile
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
        background:           "rgba(0,0,0,0.45)",
        backdropFilter:       "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display:              "flex",
        alignItems:           "center",
        justifyContent:       "center",
        padding:              "1rem",
        overflowY:            "auto",
        perspective:          isMobile ? 1000 : "none", // Only inject 3D perspective context context on mobile viewports
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:           "100%",
          maxWidth:        "min(440px, 96vw)",
          position:        "relative",
          margin:          "auto",
          // Apply 3D properties only when mobile view is active
          transformStyle:  isMobile ? "preserve-3d" : "flat",
          transition:      isMobile ? "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          transform:       isMobile && isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        
        {/* ── FRONT FACE ── */}
        <div style={{
          backfaceVisibility: isMobile ? "hidden" : "visible",
          WebkitBackfaceVisibility: isMobile ? "hidden" : "visible",
          width: "100%",
        }}>
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

          {modalView === "forgotSent" && (
            <ForgotSentView
              dark={dark}
              forgotEmail={forgotEmail}
              onBack={() => { setModalView("auth"); setAuthErr(""); }}
            />
          )}

          {modalView === "auth" && (
            <div style={{ position: "relative" }}>
              <LoginForm
                mounted={true}
                signupSuccess={signupSuccess}
                onSignupSuccess={onSignupSuccess}
                onForgot={() => { setModalView("forgot"); setAuthErr(""); }}
                onClose={onClose}
              />
              {/* Only render this quick flip info switch button on phones */}
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  style={{
                    position: "absolute",
                    bottom: 14,
                    right: 24,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    color: dark ? "rgba(255,255,255,0.3)" : "#7c3aed",
                    opacity: 0.8,
                    fontFamily: "inherit",
                  }}
                >
                  About Dev ⓘ
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── BACK FACE (Only displays on phone flips) ── */}
        {isMobile && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}>
            <div style={{
              background:     dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.82)",
              backdropFilter: "blur(24px)",
              border:         `1.5px solid ${dark ? "rgba(167,139,250,0.18)" : "rgba(124,58,237,0.12)"}`,
              borderRadius:   24,
              padding:        "24px 20px",
              boxShadow:      dark ? "0 12px 60px rgba(0,0,0,0.55)" : "0 12px 60px rgba(124,58,237,0.1)",
              color:          dark ? "rgba(255,255,255,0.85)" : "#1e1b4b",
              display:        "flex",
              flexDirection:  "column",
              height:         "100%",
              boxSizing:      "border-box"
            }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800 }}>
                About the Project
              </h3>
              
              <div style={{ 
                flex: 1, 
                fontSize: 13, 
                lineHeight: 1.6, 
                color: dark ? "rgba(255,255,255,0.65)" : "#4b5563",
                overflowY: "auto",
                marginBottom: 20
              }}>
                <p style={{ marginTop: 0 }}>
                  Hey there! This authentication application represents a secure client-side portal engineered using React and architecture hooks context containers.
                </p>
                <p>
                  <strong>Key Details:</strong> State boundaries validation metrics checking sequences, asynchronous request verification configurations, and automated layout transitions.
                </p>
                
                <hr style={{ border: "none", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, margin: "16px 0" }} />
                
                <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: dark ? "#c4b5fd" : "#7c3aed" }}>
                  Disclaimer
                </h4>
                <p style={{ fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                  This is a secure application prototype interface loop. Content configurations, testing data records, and account structures conform directly to secure hashing token protocols. Unauthorized trace mapping logs are discarded.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                style={{
                  width:         "100%",
                  padding:       "12px",
                  fontSize:      13,
                  fontWeight:    700,
                  borderRadius:  12,
                  border:        "none",
                  cursor:        "pointer",
                  fontFamily:    "inherit",
                  background:    dark ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.08)",
                  color:         dark ? "#c4b5fd" : "#7c3aed",
                  transition:    "all 0.2s",
                }}
              >
                ← Back to Verification Form
              </button>
            </div>
          </div>
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