import { useState, useEffect } from "react";
import { useAppData } from "../../context/AppDataContext";
import MobileLoginDrawer from "./MobileLoginDrawer";
import AboutModal from "./AboutModal";
import DisclaimerModal from "../../components/DisclaimerModal";

export default function LoginPage() {
  const { dark, toggleDark, clearForm } = useAppData();
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    clearForm();
  }, [clearForm]);

  function handleGoogleLogin() {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: window.location.origin,
      response_type: "token",
      scope: "openid email profile",
      prompt: "select_account",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Dark toggle — floats top right on all screens */}
      <button
        onClick={toggleDark}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 400,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)",
          border: `1px solid ${dark ? "rgba(255,255,255,0.2)" : "rgba(124,58,237,0.2)"}`,
          backdropFilter: "blur(12px)",
          color: dark ? "rgba(255,255,255,0.8)" : "#7c3aed",
          fontSize: 15,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
          transition: "all 0.2s",
        }}
      >
        {dark ? "☀" : "☾"}
      </button>

      <MobileLoginDrawer
        handleGoogleLogin={handleGoogleLogin}
        dark={dark}
        onOpenAbout={() => setShowAbout(true)}
      />

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} dark={dark} />
      )}

      <DisclaimerModal />
    </div>
  );
}

export function FormModal({ signupSuccess, onClose, handleGoogleLogin }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "min(440px, 96vw)",
          position: "relative",
          margin: "auto",
        }}
      >
        <LoginForm
          mounted={true}
          signupSuccess={signupSuccess}
          handleGoogleLogin={handleGoogleLogin}
        />
      </div>
    </div>
  );
}