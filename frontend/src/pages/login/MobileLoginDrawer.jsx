import { useState, useEffect } from "react";
import AboutModal from "./AboutModal";

// ── Terminal lines ────────────────────────────────────────────────────────────
const LINES = [
  { text: "> CGPA Pulse v1.0.0  —  MRSPTU Bathinda", delay: 0,    color: "#eceef8" },
  { text: "> Initializing grade engine...        [OK]", delay: 450,  color: "#2dd4aa" },
  { text: "> Loading 7 engineering branches...   [OK]", delay: 900,  color: "#2dd4aa" },
  { text: "> Syncing semester data structure...  [OK]", delay: 1350, color: "#2dd4aa" },
  { text: "  ─────────────────────────────────────────", delay: 1750, color: "rgba(236,238,248,0.2)" },
  { text: "> System Architect: Khushneet Kaur",         delay: 2150, color: "#a78bfa" },
  { text: "> B.Tech CSE · GZSCCET · MRSPTU Bathinda",  delay: 2550, color: "#a78bfa" },
  { text: "  ─────────────────────────────────────────", delay: 2950, color: "rgba(236,238,248,0.2)" },
  { text: "CONSOLE_BTN", delay: 3350, color: "console" },
  { text: "  ─────────────────────────────────────────", delay: 3750, color: "rgba(236,238,248,0.2)" },
  { text: "> Tap anywhere to enter your dashboard →",   delay: 4100, color: "rgba(236,238,248,0.4)" },
];

// ── Floating grade cards ──────────────────────────────────────────────────────
const CARDS = [
  { grade: "A+", gp: 10, total: 94, sub: "Data Structures",  x: 6,  delay: "0s",   dur: "9s"  },
  { grade: "A",  gp: 9,  total: 87, sub: "Operating Systems", x: 66, delay: "2.5s", dur: "11s" },
  { grade: "A+", gp: 10, total: 96, sub: "DBMS",              x: 36, delay: "1s",   dur: "8s"  },
  { grade: "A+", gp: 10, total: 58, sub: "DS Lab",            x: 80, delay: "3.5s", dur: "7s"  },
  { grade: "B+", gp: 8,  total: 78, sub: "Comp Networks",     x: 20, delay: "4.5s", dur: "12s" },
  { grade: "A",  gp: 9,  total: 89, sub: "Computer Org",      x: 52, delay: "1.5s", dur: "9s"  },
  { grade: "A+", gp: 10, total: 99, sub: "Python Lab",        x: 74, delay: "5.5s", dur: "10s" },
];

function gradeClr(gp) {
  if (gp >= 10) return "#2dd4aa";
  if (gp >= 9)  return "#7c83f5";
  if (gp >= 8)  return "#a78bfa";
  return "#94a3b8";
}

function FloatingCards({ dark }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {CARDS.map((card, i) => (
        <div key={i} style={{
          position:  "absolute",
          left:      `${card.x}%`,
          bottom:    "-130px",
          animation: `floatCard ${card.dur} ${card.delay} ease-in-out infinite`,
          opacity:   0,
        }}>
          <div style={{
            padding:      "8px 11px",
            borderRadius: 10,
            background:   dark
              ? "rgba(15,20,36,0.88)"
              : "rgba(255,255,255,0.88)",
            backdropFilter: "blur(10px)",
            border:       `1px solid ${gradeClr(card.gp)}44`,
            minWidth:     82,
            boxShadow:    `0 4px 16px ${gradeClr(card.gp)}22`,
          }}>
            <p style={{
              margin:       "0 0 3px",
              fontSize:     8,
              color:        dark ? "#4a5070" : "#a09bbf",
              whiteSpace:   "nowrap",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              maxWidth:     88,
            }}>
              {card.sub}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: gradeClr(card.gp) }}>
                {card.total}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: gradeClr(card.gp) }}>
                {card.grade}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Terminal sequence ─────────────────────────────────────────────────────────
function Terminal({ onDone, onOpenAbout }) {
  const [visible, setVisible] = useState([]);
  const [allDone, setAllDone] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // Tracks exactly who gets the cursor

  useEffect(() => {
    const timers = LINES.map((line, i) =>
      setTimeout(() => {
        setVisible(prev => [...prev, line]);
        setActiveIndex(i); // Explicitly state which line is processing
        if (i === LINES.length - 1) setAllDone(true);
      }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      onClick={allDone ? onDone : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "#080c18",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "32px 24px",
        fontFamily: "monospace",
        cursor: allDone ? "pointer" : "default",
        overflowY: "auto",
      }}
    >
      {/* Scanline */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)",
        pointerEvents: "none",
        zIndex: 1,
      }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {visible.map((line, i) => {
          if (line.color === "console") {
            return (
              <div key={i} style={{ margin: "14px 0" }}>
                <button
                  onClick={e => { e.stopPropagation(); onOpenAbout(); }}
                  style={{
                    background: "transparent",
                    border: "1px solid #10b981",
                    borderRadius: 8,
                    padding: "10px 16px",
                    color: "#10b981",
                    fontSize: 13,
                    fontFamily: "monospace",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    animation: "termGlow 2.5s ease-in-out infinite",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <span style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#10b981",
                    flexShrink: 0,
                    animation: "consolePulse 1s step-end infinite",
                    boxShadow: "0 0 6px #10b981",
                  }} />
                  <span>
                    [ Developer Console ]
                    <span style={{
                      color: "rgba(16,185,129,0.6)",
                      marginLeft: 8,
                      fontSize: 11,
                    }}>
                      — tap to meet the architect
                    </span>
                  </span>
                </button>
              </div>
            );
          }

          return (
            <p key={i} style={{
              margin: "3px 0",
              fontSize: 12,
              color: line.color,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {line.text}
              {/* FIXED: Explicitly use activeIndex instead of mutating array lengths */}
              {i === activeIndex && !allDone && (
                <span style={{
                  display: "inline-block",
                  width: 8,
                  height: 13,
                  background: "#7c83f5",
                  marginLeft: 2,
                  verticalAlign: "middle",
                  animation: "blink 0.7s step-end infinite",
                }} />
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function MobileLoginDrawer({ handleGoogleLogin, dark }) {
  const [phase, setPhase] = useState("terminal");
  const [termFading,    setTermFading]     = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showAbout,     setShowAbout]     = useState(false);

  function handleTermDone() {
    setTermFading(true);
    localStorage.setItem("cgpapulse_visited", "1");
    setTimeout(() => {
      setPhase("main");
      setTimeout(() => setDrawerVisible(true), 50);
    }, 450);
  }

  return (
    <>
      {/* Terminal phase */}
      {phase === "terminal" && (
        <div style={{ opacity: termFading ? 0 : 1, transition: "opacity 0.45s ease" }}>
          <Terminal
            onDone={handleTermDone}
            onOpenAbout={() => setShowAbout(true)}
          />
        </div>
      )}

      {/* Main phase */}
      {phase === "main" && (
        <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>

          {/* ── Background ─────────────────────────────────────── */}
          <div style={{
            position:   "absolute",
            inset:      0,
            background: dark
              ? "linear-gradient(160deg,#080c18 0%,#0f1133 55%,#080c18 100%)"
              : "linear-gradient(160deg,#f4f3ff 0%,#ede9fe 55%,#f4f3ff 100%)",
          }}>
            <FloatingCards dark={dark} />

            {/* Top fade */}
            <div style={{
              position:   "absolute", top: 0, left: 0, right: 0, height: "55%",
              background: dark
                ? "linear-gradient(180deg,rgba(8,12,24,0.88) 0%,transparent 100%)"
                : "linear-gradient(180deg,rgba(244,243,255,0.88) 0%,transparent 100%)",
              pointerEvents: "none", zIndex: 1,
            }} />

            {/* Bottom fade */}
            <div style={{
              position:   "absolute", bottom: 0, left: 0, right: 0, height: "62%",
              background: dark
                ? "linear-gradient(0deg,rgba(8,12,24,0.95) 0%,transparent 100%)"
                : "linear-gradient(0deg,rgba(244,243,255,0.95) 0%,transparent 100%)",
              pointerEvents: "none", zIndex: 1,
            }} />
          </div>

          {/* ── Top branding ────────────────────────────────────── */}
          <div style={{
            position:       "absolute",
            top:            0, left: 0, right: 0,
            height:         "52%",
            zIndex:         10,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            padding:        "0 24px",
            textAlign:      "center",
          }}>
            <h1 style={{
              margin:        "0 0 2px",
              fontSize:      "clamp(44px,12vw,62px)",
              fontWeight:    900,
              letterSpacing: -2,
              lineHeight:    1,
              color:         dark ? "rgba(255,255,255,0.93)" : "#1e1b4b",
            }}>
              CGPA
            </h1>
            <h1 style={{
  margin:               "0 0 14px",
  fontSize:             "clamp(44px,12vw,62px)",
  fontWeight:           900,
  fontStyle:            "italic",
  letterSpacing:        -2,
  lineHeight:           1.1,         
  paddingBottom:        4,    
  paddingRight:         "0.22em",       
  background:           dark
    ? "linear-gradient(135deg,#c084fc,#67e8f9)"
    : "linear-gradient(135deg,#7c3aed,#10b981)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor:  "transparent",
  backgroundClip:       "text",
  overflow:             "visible",     
  display:              "block",       
}}>
  PULSE
</h1>

            <p style={{
              margin:     "0 0 14px",
              fontSize:   13,
              color:      dark ? "rgba(255,255,255,0.5)" : "#5b5687",
              lineHeight: 1.5,
              maxWidth:   260,
            }}>
              Track · Predict · Own your academic journey
            </p>

            {/* 2-col feature pills */}
            <div style={{
              display:             "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:                 6,
              maxWidth:            260,
            }}>
              {[
                "🧮 Live SGPA", "🎯 Target CGPA",
                "🔮 Predictor",  "🏆 Leaderboard",
                "⚠ Backlogs",   "📊 6 Branches",
              ].map(f => (
                <div key={f} style={{
                  padding:      "5px 10px",
                  borderRadius: 8,
                  fontSize:     11,
                  fontWeight:   500,
                  background:   dark
                    ? "rgba(124,131,245,0.08)"
                    : "rgba(109,40,217,0.05)",
                  border:       `1px solid ${dark
                    ? "rgba(124,131,245,0.14)"
                    : "rgba(109,40,217,0.1)"}`,
                  color:        dark ? "rgba(255,255,255,0.6)" : "#5b5687",
                  textAlign:    "center",
                }}>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom drawer ────────────────────────────────────── */}
          <div style={{
            position:             "absolute",
            bottom:               0, left: 0, right: 0,
            zIndex:               20,
            background:           dark
              ? "rgba(13,14,26,0.94)"
              : "rgba(255,255,255,0.94)",
            backdropFilter:       "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            borderRadius:         "24px 24px 0 0",
            border:               `1px solid ${dark
              ? "rgba(167,139,250,0.18)"
              : "rgba(124,58,237,0.12)"}`,
            borderBottom:         "none",
            padding:              "10px 22px 44px",
            boxShadow:            dark
              ? "0 -20px 60px rgba(0,0,0,0.55)"
              : "0 -20px 60px rgba(109,40,217,0.12)",
            transform:   drawerVisible ? "translateY(0)" : "translateY(100%)",
            transition:  "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}>

            {/* Handle */}
            <div style={{
              width:        40, height: 4, borderRadius: 99,
              background:   dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
              margin:       "0 auto 18px",
            }} />

            <p style={{
              margin:     "0 0 3px",
              fontSize:   19,
              fontWeight: 800,
              color:      dark ? "rgba(255,255,255,0.92)" : "#1e1b4b",
              textAlign:  "center",
            }}>
              Sign in to get started
            </p>
            <p style={{
              margin:     "0 0 18px",
              fontSize:   12,
              color:      dark ? "rgba(255,255,255,0.38)" : "#a09bbf",
              textAlign:  "center",
            }}>
              Your grades, saved securely to your Google account
            </p>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                width:          "100%",
                padding:        "14px 16px",
                borderRadius:   14,
                border:         `1.5px solid ${dark
                  ? "rgba(255,255,255,0.14)"
                  : "#dadce0"}`,
                background:     dark ? "rgba(255,255,255,0.08)" : "#fff",
                color:          dark ? "rgba(255,255,255,0.9)" : "#3c4043",
                fontSize:       15,
                fontWeight:     600,
                fontFamily:     "inherit",
                cursor:         "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            12,
                transition:     "all 0.2s",
                boxShadow:      dark ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
                marginBottom:   14,
              }}
              onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.13)" : "#f8f9fa"}
              onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "#fff"}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            {/* Developer Console card */}
            <button
              onClick={() => setShowAbout(true)}
              style={{
                width:          "100%",
                padding:        "11px 14px",
                borderRadius:   12,
                background:     dark
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(16,185,129,0.04)",
                border:         "1px solid rgba(16,185,129,0.25)",
                cursor:         "pointer",
                fontFamily:     "inherit",
                display:        "flex",
                alignItems:     "center",
                gap:            12,
                textAlign:      "left",
                transition:     "all 0.2s",
                animation:      "termGlow 3s ease-in-out infinite",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(16,185,129,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = dark
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(16,185,129,0.04)";
              }}
            >
              {/* KK avatar */}
              <div style={{
                width:          38,
                height:         38,
                borderRadius:   "50%",
                background:     "linear-gradient(135deg,#6d28d9,#a78bfa)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       13,
                fontWeight:     900,
                color:          "#fff",
                flexShrink:     0,
                boxShadow:      "0 0 12px rgba(109,40,217,0.4)",
              }}>
                KK
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin:   "0 0 1px",
                  fontSize: 13,
                  fontWeight: 700,
                  color:    dark ? "rgba(255,255,255,0.88)" : "#1e1b4b",
                }}>
                  Khushneet Kaur
                </p>
                <p style={{
                  margin:   0,
                  fontSize: 10,
                  color:    dark ? "rgba(255,255,255,0.38)" : "#a09bbf",
                }}>
                  CSE · GZSCCET · MRSPTU Bathinda
                </p>
              </div>

              {/* Console badge */}
              <div style={{
                display:      "flex",
                alignItems:   "center",
                gap:          4,
                background:   "rgba(16,185,129,0.12)",
                border:       "1px solid rgba(16,185,129,0.35)",
                borderRadius: 6,
                padding:      "4px 8px",
                flexShrink:   0,
              }}>
                <span style={{
                  width:        5, height: 5,
                  borderRadius: "50%",
                  background:   "#10b981",
                  animation:    "consolePulse 1.2s step-end infinite",
                  boxShadow:    "0 0 5px #10b981",
                }} />
                <span style={{
                  fontSize:      9,
                  fontWeight:    700,
                  color:         "#10b981",
                  fontFamily:    "monospace",
                  letterSpacing: 0.4,
                }}>
                  CONSOLE
                </span>
              </div>
            </button>

            <p style={{
              textAlign:  "center",
              fontSize:   9,
              color:      dark ? "rgba(255,255,255,0.16)" : "#c4bfd8",
              marginTop:  12,
              lineHeight: 1.6,
            }}>
              Unofficial · Not affiliated with MRSPTU · Free forever
            </p>
          </div>
        </div>
      )}

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} dark={dark} />
      )}
    </>
  );
}