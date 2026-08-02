import { useState, useCallback, useEffect } from "react";
import { useAppData } from "../../context/AppDataContext";
import { useTheme } from "../../context/ThemeContext";
import MobileLoginDrawer from "./MobileLoginDrawer";
import AboutModal from "./AboutModal";
import DisclaimerModal from "../../components/DisclaimerModal";

// Stable outside component — params never change
function buildGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id:     import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri:  window.location.origin,
    response_type: "token",
    scope:         "openid email profile",
    prompt:        "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export default function LoginPage() {
  const { clearForm } = useAppData();

  // Theme comes from ThemeContext directly
  const { dark, toggleDark } = useTheme();

  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => { clearForm(); }, [clearForm]);

  const handleGoogleLogin = useCallback(() => {
    window.location.href = buildGoogleAuthUrl();
  }, []);

  const openAbout  = useCallback(() => setShowAbout(true),  []);
  const closeAbout = useCallback(() => setShowAbout(false), []);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* Dark toggle */}
      <button
        onClick={toggleDark}
        style={{
          position:       "fixed",
          top:            16,
          right:          16,
          zIndex:         400,
          width:          36,
          height:         36,
          borderRadius:   "50%",
          background:     dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)",
          border:         `1px solid ${dark ? "rgba(255,255,255,0.2)" : "rgba(124,58,237,0.2)"}`,
          backdropFilter: "blur(12px)",
          color:          dark ? "rgba(255,255,255,0.8)" : "#7c3aed",
          fontSize:       15,
          cursor:         "pointer",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontFamily:     "inherit",
          transition:     "all 0.2s",
        }}
      >
        {dark ? "☀" : "☾"}
      </button>

      <MobileLoginDrawer
        handleGoogleLogin={handleGoogleLogin}
        dark={dark}
        onOpenAbout={openAbout}
      />

      {showAbout && <AboutModal onClose={closeAbout} dark={dark} />}

      <DisclaimerModal />
    </div>
  );
}
