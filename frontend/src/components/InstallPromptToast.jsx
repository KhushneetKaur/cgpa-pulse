import { useState, useEffect } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { useAppData } from "../context/AppDataContext";

const STORAGE_KEY    = "cgpapulse_install_dismissed";
const LATER_DAYS     = 7;
const CLOSE_DAYS     = 3;
const SHOW_DELAY_MS  = 4000;

function shouldShow() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const { type, ts } = JSON.parse(raw);
    if (type === "installed") return false;
    const days = (Date.now() - ts) / 86400000;
    if (type === "later" && days >= LATER_DAYS) return true;
    if (type === "close" && days >= CLOSE_DAYS)  return true;
    return false;
  } catch { return true; }
}

function dismiss(type) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ type, ts: Date.now() }));
  } catch {}
}

export default function InstallPromptToast() {
  const { c, dark, screen } = useAppData();
  const { canInstall, isInstalled, isIOS, triggerInstall } = usePWAInstall();

  const [visible,     setVisible]     = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [animOut,     setAnimOut]     = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    if (!isMobile)        return;
    if (screen !== "app") return;
    if (isInstalled)      return;
    if (!canInstall)      return;
    if (!shouldShow())    return;

    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [isMobile, screen, isInstalled, canInstall]);

  function hide(type) {
    setAnimOut(true);
    dismiss(type);
    setTimeout(() => setVisible(false), 320);
  }

  async function handleInstall() {
    if (isIOS) {
      setShowIOSGuide(true);
      dismiss("installed");
      return;
    }
    const accepted = await triggerInstall();
    if (accepted) {
      dismiss("installed");
      hide("installed");
    }
  }

  if (!visible) return null;

  return (
    <>
      {/* ── Toast ─────────────────────────────────────────────── */}
      <div style={{
        position:   "fixed",
        bottom:     70,   // above bottom tab bar
        left:       "50%",
        transform:  "translateX(-50%)",
        zIndex:     500,
        width:      "calc(100% - 24px)",
        maxWidth:   420,
        animation:  animOut
          ? "slideDown 0.3s ease forwards"
          : "slideUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards",
      }}>
        <style>{`
          @keyframes slideDown {
            from { transform: translateX(-50%) translateY(0);      opacity: 1; }
            to   { transform: translateX(-50%) translateY(120px);  opacity: 0; }
          }
        `}</style>

        <div style={{
          background:           dark
            ? "rgba(15,20,36,0.97)"
            : "rgba(255,255,255,0.97)",
          backdropFilter:       "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius:         16,
          border:               `1px solid ${dark
            ? "rgba(124,131,245,0.25)"
            : "rgba(109,40,217,0.15)"}`,
          boxShadow:            dark
            ? "0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,131,245,0.08)"
            : "0 8px 40px rgba(109,40,217,0.18)",
          padding:              "14px 14px 14px 14px",
          display:              "flex",
          alignItems:           "center",
          gap:                  12,
        }}>

          {/* App icon */}
          <div style={{
            width:          46,
            height:         46,
            borderRadius:   12,
            background:     "linear-gradient(135deg,#4c1d95,#7c3aed,#06b6d4)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
            boxShadow:      "0 4px 12px rgba(124,58,237,0.4)",
          }}>
            <span style={{
              fontSize:      11,
              fontWeight:    900,
              color:         "#fff",
              letterSpacing: 0.3,
              lineHeight:    1,
              textAlign:     "center",
              fontStyle:     "italic",
            }}>
              CP
            </span>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin:     "0 0 1px",
              fontSize:   13,
              fontWeight: 700,
              color:      c.text,
              lineHeight: 1.3,
            }}>
              Open faster from your home screen
            </p>
            <p style={{
              margin:   0,
              fontSize: 11,
              color:    c.muted,
              lineHeight: 1.4,
            }}>
              Install CGPA Pulse — works offline too
            </p>
          </div>

          {/* Buttons */}
          <div style={{
            display:       "flex",
            flexDirection: "column",
            gap:           5,
            flexShrink:    0,
          }}>
            <button
              onClick={handleInstall}
              style={{
                padding:      "6px 14px",
                borderRadius: 8,
                border:       "none",
                background:   "linear-gradient(135deg,#7c3aed,#06b6d4)",
                color:        "#fff",
                fontSize:     12,
                fontWeight:   700,
                cursor:       "pointer",
                fontFamily:   "inherit",
                whiteSpace:   "nowrap",
                boxShadow:    "0 2px 8px rgba(124,58,237,0.35)",
              }}
            >
              Install
            </button>
            <button
              onClick={() => hide("later")}
              style={{
                padding:    "5px 14px",
                borderRadius: 8,
                border:     `1px solid ${c.border}`,
                background: "transparent",
                color:      c.muted,
                fontSize:   11,
                cursor:     "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Maybe later
            </button>
          </div>

          {/* Close */}
          <button
            onClick={() => hide("close")}
            style={{
              position:       "absolute",
              top:            8,
              right:          8,
              width:          20,
              height:         20,
              borderRadius:   "50%",
              border:         "none",
              background:     dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              color:          c.muted,
              fontSize:       11,
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              lineHeight:     1,
              fontFamily:     "inherit",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── iOS guide sheet ──────────────────────────────────── */}
      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          style={{
            position:             "fixed",
            inset:                0,
            zIndex:               600,
            background:           "rgba(0,0,0,0.6)",
            backdropFilter:       "blur(16px)",
            display:              "flex",
            alignItems:           "flex-end",
            justifyContent:       "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:   dark ? "#0f1424" : "#fff",
              borderRadius: "20px 20px 0 0",
              padding:      "20px 22px 40px",
              width:        "100%",
              maxWidth:     480,
              border:       `1px solid ${c.border}`,
              borderBottom: "none",
              animation:    "slideUp 0.3s ease both",
            }}
          >
            {/* Handle */}
            <div style={{
              width:        36, height: 4, borderRadius: 99,
              background:   dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
              margin:       "0 auto 18px",
            }} />

            <h3 style={{
              margin:     "0 0 4px",
              fontSize:   17,
              fontWeight: 800,
              color:      c.text,
              textAlign:  "center",
            }}>
              Add to Home Screen
            </h3>
            <p style={{
              margin:     "0 0 18px",
              fontSize:   12,
              color:      c.sub,
              textAlign:  "center",
            }}>
              3 quick taps — works like a native app
            </p>

            {[
              { n: "1", icon: "⬆️", text: "Tap the Share button at the bottom of Safari" },
              { n: "2", icon: "➕", text: 'Scroll and tap "Add to Home Screen"' },
              { n: "3", icon: "✅", text: 'Tap "Add" in the top right' },
            ].map(s => (
              <div key={s.n} style={{
                display:      "flex",
                alignItems:   "center",
                gap:          12,
                padding:      "11px 12px",
                borderRadius: 12,
                background:   dark ? "#080c18" : "#f4f3ff",
                marginBottom: 6,
              }}>
                <div style={{
                  width:          28, height: 28, borderRadius: "50%",
                  background:     "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  display:        "flex", alignItems: "center", justifyContent: "center",
                  fontSize:       12, fontWeight: 900, color: "#fff", flexShrink: 0,
                }}>
                  {s.n}
                </div>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <p style={{ margin: 0, fontSize: 13, color: c.text, lineHeight: 1.4 }}>
                  {s.text}
                </p>
              </div>
            ))}

            <button
              onClick={() => setShowIOSGuide(false)}
              style={{
                width:        "100%",
                padding:      "13px",
                marginTop:    14,
                borderRadius: 12,
                border:       "none",
                background:   "linear-gradient(135deg,#7c3aed,#06b6d4)",
                color:        "#fff",
                fontSize:     14,
                fontWeight:   700,
                cursor:       "pointer",
                fontFamily:   "inherit",
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}