import { useState, useEffect } from "react";
import { useAppData }    from "../../context/AppDataContext";
import LoginBackground   from "./LoginBackground";
import LoginHero         from "./LoginHero";
import LoginForm         from "./LoginForm";
import AboutModal        from "./AboutModal";
import DisclaimerModal   from "../../components/DisclaimerModal";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { dark, toggleDark, clearForm, setShowDisclaimer, googleLogin} = useAppData();

function handleGoogleLogin() {
  const params = new URLSearchParams({
    client_id:     import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri:  window.location.origin,
    response_type: "token",
    scope:         "openid email profile",
    prompt:        "select_account",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

  const [showAbout,     setShowAbout]     = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [formMode,      setFormMode]      = useState("login");
  const [mounted,       setMounted]       = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    clearForm();
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  function handleAuth(mode) {
    clearForm();
    setFormMode(mode);
    setShowForm(true);
  }

  function handleAboutClick() {
    setShowAbout(true);
  }

  function handleDisclaimerClick() {
    setShowDisclaimer(true);
  }

  function handleClose() {
    setShowForm(false);
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
          signupSuccess={signupSuccess}
          onClose={handleClose}
          handleGoogleLogin={handleGoogleLogin}
        />
      )}

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} dark={dark} />
      )}

      <DisclaimerModal />
    </div>
  );
}

// ── Standard Core Form Modal ──
function FormModal({
  dark, formMode, modalView, signupSuccess, onClose, handleGoogleLogin
}) {
  const { setIsSignup } = useAppData();

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
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:     "100%",
          maxWidth:  "min(440px, 96vw)",
          position:  "relative",
          margin:    "auto",
        }}
      >
            <LoginForm
              mounted={true}
              signupSuccess={signupSuccess}
              onClose={onClose}
              handleGoogleLogin={handleGoogleLogin} 
            />
      </div>
    </div>
  );
}