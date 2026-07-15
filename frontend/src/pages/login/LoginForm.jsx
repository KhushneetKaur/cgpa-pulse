import toast from "react-hot-toast";
import { useAppData } from "../../context/AppDataContext";
export default function LoginForm({ mounted, signupSuccess, onClose, handleGoogleLogin }) {
  const { dark, c } = useAppData();

  // Import c from useAppData
  const { dark: isDark } = useAppData();

  return (
    <div style={{
      width:          "100%",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      padding:        "0",
      opacity:        mounted ? 1 : 0,
      transform:      mounted ? "translateY(0)" : "translateY(22px)",
      transition:     "opacity 0.65s ease 0.2s, transform 0.65s ease 0.2s",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Success banner */}
        {signupSuccess && (
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          10,
            padding:      "12px 14px",
            borderRadius: 12,
            marginBottom: 16,
            background:   isDark
              ? "rgba(52,211,153,0.12)"
              : "rgba(5,150,105,0.08)",
            border: `1px solid ${isDark
              ? "rgba(52,211,153,0.3)"
              : "rgba(5,150,105,0.2)"}`,
          }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 700,
              color: isDark ? "#34d399" : "#059669",
            }}>
              Account created! Continue with Google to sign in.
            </p>
          </div>
        )}

        {/* Glass card */}
        <div style={{
          background:           isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.78)",
          backdropFilter:       "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border:               `1.5px solid ${isDark
            ? "rgba(167,139,250,0.18)"
            : "rgba(124,58,237,0.12)"}`,
          borderRadius:         24,
          padding:              "36px 28px",
          boxShadow:            isDark
            ? "0 12px 60px rgba(0,0,0,0.55)"
            : "0 12px 60px rgba(124,58,237,0.1)",
        }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p style={{
              margin:   "0 0 8px",
              fontSize: 40,
              lineHeight: 1,
            }}>🎓</p>
            <h2 style={{
              margin:        "0 0 8px",
              fontSize:      22,
              fontWeight:    800,
              letterSpacing: -0.5,
              color:         isDark
                ? "rgba(255,255,255,0.92)"
                : "#1e1b4b",
            }}>
              CGPA Pulse
            </h2>
            <p style={{
              margin:   0,
              fontSize: 13,
              color:    isDark
                ? "rgba(255,255,255,0.45)"
                : "#5b5687",
            }}>
              Sign in to track your academic journey
            </p>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width:          "100%",
              padding:        "13px 16px",
              borderRadius:   14,
              border:         `1.5px solid ${isDark
                ? "rgba(255,255,255,0.15)"
                : "#dadce0"}`,
              background:     isDark
                ? "rgba(255,255,255,0.06)"
                : "#fff",
              color:          isDark
                ? "rgba(255,255,255,0.85)"
                : "#3c4043",
              fontSize:       14,
              fontWeight:     600,
              fontFamily:     "inherit",
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            12,
              transition:     "all 0.18s",
              boxShadow:      isDark
                ? "none"
                : "0 1px 3px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isDark
                ? "rgba(255,255,255,0.1)"
                : "#f8f9fa";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = isDark
                ? "rgba(255,255,255,0.06)"
                : "#fff";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Disclaimer */}
          <p style={{
            textAlign:  "center",
            fontSize:   10,
            color:      isDark
              ? "rgba(255,255,255,0.25)"
              : "#a09bbf",
            marginTop:  16,
            lineHeight: 1.6,
            margin:     "16px 0 0",
          }}>
            Unofficial · Not affiliated with MRSPTU · Free forever
          </p>
        </div>
      </div>
    </div>
  );
}