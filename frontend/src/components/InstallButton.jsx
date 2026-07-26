import { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { useAppData } from "../context/AppDataContext";

export default function InstallButton({ compact = false }) {
  const { c, dark } = useAppData();
  const { canInstall, isInstalled, isIOS, triggerInstall } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div style={{
        display:    "flex",
        alignItems: "center",
        gap:        6,
        fontSize:   12,
        color:      c.ok,
        fontWeight: 600,
      }}>
        ✓ App installed
      </div>
    );
  }

  if (!canInstall) return null;

  return (
    <>
      <button
      type = "button"
        onClick={isIOS ? () => setShowIOSGuide(true) : triggerInstall}
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            8,
          padding:        compact ? "6px 12px" : "10px 16px",
          borderRadius:   10,
          border:         `1.5px solid ${c.accent}`,
          background:     `${c.accent}12`,
          color:          c.accent,
          fontSize:       compact ? 12 : 13,
          fontWeight:     700,
          cursor:         "pointer",
          fontFamily:     "inherit",
          transition:     "all 0.18s",
          whiteSpace:     "nowrap",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = `${c.accent}22`;
          e.currentTarget.style.transform  = "translateY(-1px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = `${c.accent}12`;
          e.currentTarget.style.transform  = "translateY(0)";
        }}
      >
        <span style={{ fontSize: compact ? 14 : 16 }}>📲</span>
        {compact ? "Install App" : "Install as App"}
      </button>

      {/* iOS install guide modal */}
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
            padding:              "0",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:   dark ? "#0f1424" : "#fff",
              borderRadius: "20px 20px 0 0",
              padding:      "24px 24px 40px",
              width:        "100%",
              maxWidth:     480,
              border:       `1px solid ${c.border}`,
              borderBottom: "none",
              animation:    "slideUp 0.3s ease both",
            }}
          >
            {/* Handle */}
            <div style={{
              width:        40, height: 4, borderRadius: 99,
              background:   dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
              margin:       "0 auto 20px",
            }} />

            <h3 style={{
              margin:     "0 0 6px",
              fontSize:   18,
              fontWeight: 800,
              color:      c.text,
              textAlign:  "center",
            }}>
              Add to Home Screen
            </h3>
            <p style={{
              margin:     "0 0 20px",
              fontSize:   13,
              color:      c.sub,
              textAlign:  "center",
            }}>
              Install CGPA Pulse like a native app — 3 taps!
            </p>

            {[
              { step: "1", icon: "⬆️", text: "Tap the Share button at the bottom of Safari" },
              { step: "2", icon: "➕", text: 'Scroll down and tap "Add to Home Screen"' },
              { step: "3", icon: "✅", text: 'Tap "Add" in the top right corner' },
            ].map(s => (
              <div key={s.step} style={{
                display:      "flex",
                alignItems:   "center",
                gap:          14,
                padding:      "12px 14px",
                borderRadius: 12,
                background:   dark ? "#080c18" : "#f4f3ff",
                marginBottom: 8,
              }}>
                <div style={{
                  width:          32,
                  height:         32,
                  borderRadius:   "50%",
                  background:     c.accent,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       13,
                  fontWeight:     900,
                  color:          "#fff",
                  flexShrink:     0,
                }}>
                  {s.step}
                </div>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <p style={{ margin: 0, fontSize: 13, color: c.text, lineHeight: 1.4 }}>
                  {s.text}
                </p>
              </div>
            ))}

            <button
            type = "button"
              onClick={() => setShowIOSGuide(false)}
              style={{
                width:          "100%",
                padding:        "13px",
                marginTop:      16,
                borderRadius:   12,
                border:         "none",
                background:     c.accent,
                color:          "#fff",
                fontSize:       14,
                fontWeight:     700,
                cursor:         "pointer",
                fontFamily:     "inherit",
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