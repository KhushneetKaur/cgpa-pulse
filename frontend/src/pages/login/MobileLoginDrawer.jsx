import { useState, useEffect } from "react";
import AboutModal from "./AboutModal";

// ── Grade color ───────────────────────────────────────────────────────────────
function gradeClr(gp) {
  if (gp >= 10) return "#2dd4aa";
  if (gp >= 9)  return "#7c83f5";
  if (gp >= 8)  return "#a78bfa";
  return "#94a3b8";
}

// ── Floating grade cards ──────────────────────────────────────────────────────
const CARDS = [
  { grade: "A+", gp: 10, total: 94, sub: "Data Structures",   x: 5,  delay: "0s",   dur: "9s"  },
  { grade: "A",  gp: 9,  total: 87, sub: "Operating Systems",  x: 62, delay: "2.5s", dur: "11s" },
  { grade: "A+", gp: 10, total: 96, sub: "DBMS",               x: 33, delay: "1s",   dur: "8s"  },
  { grade: "A+", gp: 10, total: 58, sub: "DS Lab",             x: 80, delay: "3.5s", dur: "7s"  },
  { grade: "B+", gp: 8,  total: 78, sub: "Computer Networks",  x: 18, delay: "4.5s", dur: "12s" },
  { grade: "A",  gp: 9,  total: 89, sub: "Computer Org",       x: 50, delay: "1.5s", dur: "9s"  },
  { grade: "A+", gp: 10, total: 99, sub: "Python Lab",         x: 75, delay: "5.5s", dur: "10s" },
  { grade: "A",  gp: 9,  total: 85, sub: "Maths III",          x: 42, delay: "3s",   dur: "8s"  },
];

function FloatingCards({ dark }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "hidden", pointerEvents: "none",
    }}>
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
              margin: "0 0 3px", fontSize: 8,
              color: dark ? "#4a5070" : "#a09bbf",
              whiteSpace: "nowrap", overflow: "hidden",
              textOverflow: "ellipsis", maxWidth: 90,
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

// ── Typing text ───────────────────────────────────────────────────────────────
const TYPING_TEXTS = [
  "track your SGPA live",
  "predict your grades",
  "crush every semester",
  "manage your backlogs",
  "hit your target CGPA",
];

function TypingText({ dark }) {
  const [displayed, setDisplayed] = useState("");
  const [textIdx,   setTextIdx]   = useState(0);
  const [charIdx,   setCharIdx]   = useState(0);
  const [deleting,  setDeleting]  = useState(false);
  const [paused,    setPaused]    = useState(false);

  useEffect(() => {
    if (paused) {
      const t = setTimeout(() => { setPaused(false); setDeleting(true); }, 2200);
      return () => clearTimeout(t);
    }
    const speed = deleting ? 30 : 55;
    const t = setTimeout(() => {
      const cur = TYPING_TEXTS[textIdx];
      if (!deleting) {
        setDisplayed(cur.slice(0, charIdx + 1));
        if (charIdx + 1 === cur.length) setPaused(true);
        else setCharIdx(n => n + 1);
      } else {
        setDisplayed(cur.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setDeleting(false);
          setTextIdx(i => (i + 1) % TYPING_TEXTS.length);
          setCharIdx(0);
        } else { setCharIdx(n => n - 1); }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [charIdx, deleting, paused, textIdx]);

  return (
    <span style={{
      color:      dark ? "#a78bfa" : "#7c3aed",
      fontWeight: 700,
    }}>
      {displayed}
      <span style={{
        display:       "inline-block",
        width:         2,
        height:        "0.85em",
        background:    dark ? "#a78bfa" : "#7c3aed",
        marginLeft:    2,
        verticalAlign: "middle",
        animation:     "blink 0.75s step-end infinite",
      }} />
    </span>
  );
}

// ── Terminal lines ────────────────────────────────────────────────────────────
const LINES = [
  { text: "> CGPA Pulse v1.0.0  —  MRSPTU Bathinda", delay: 0,    color: "#eceef8" },
  { text: "> Initializing grade engine...        [OK]", delay: 500,  color: "#2dd4aa" },
  { text: "> Loading 6 engineering branches...   [OK]", delay: 1000, color: "#2dd4aa" },
  { text: "> Syncing semester data structure...  [OK]", delay: 1500, color: "#2dd4aa" },
  { text: "> Calculating CGPA algorithms...      [OK]", delay: 2000, color: "#2dd4aa" },
  { text: "  ─────────────────────────────────────────", delay: 2400, color: "rgba(236,238,248,0.2)" },
  { text: "> System Architect: Khushneet Kaur",         delay: 2800, color: "#a78bfa" },
  { text: "> B.Tech CSE · GZSCCET · MRSPTU Bathinda",  delay: 3200, color: "#a78bfa" },
  { text: "> GitHub / LinkedIn → tap console below",   delay: 3600, color: "#a78bfa" },
  { text: "  ─────────────────────────────────────────", delay: 4000, color: "rgba(236,238,248,0.2)" },
  { text: "CONSOLE_BTN",                                delay: 4400, color: "console" },
  { text: "  ─────────────────────────────────────────", delay: 4800, color: "rgba(236,238,248,0.2)" },
  { text: "> Tap anywhere to continue →",               delay: 5100, color: "rgba(236,238,248,0.38)" },
];

function Terminal({ onDone, onOpenAbout }) {
  const [visible, setVisible] = useState([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const timers = LINES.map((line, i) =>
      setTimeout(() => {
        setVisible(prev => [...prev, line]);
        if (i === LINES.length - 1) setAllDone(true);
      }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      onClick={allDone ? onDone : undefined}
      style={{
        position:       "fixed",
        inset:          0,
        zIndex:         300,
        background:     "#080c18",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        cursor:         allDone ? "pointer" : "default",
        overflowY:      "auto",
      }}
    >
      {/* Scanlines */}
      <div style={{
        position:        "absolute",
        inset:           0,
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.05) 2px,rgba(0,0,0,0.05) 4px)",
        pointerEvents:   "none",
        zIndex:          1,
      }} />

      {/* Terminal content — centered, max-width on desktop */}
      <div style={{
        position:  "relative",
        zIndex:    2,
        width:     "100%",
        maxWidth:  560,
        padding:   "clamp(24px,5vw,48px) clamp(20px,5vw,40px)",
        fontFamily: "monospace",
        boxSizing: "border-box",
      }}>
        {/* Terminal window chrome */}
        <div style={{
          background:   "rgba(255,255,255,0.03)",
          border:       "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          overflow:     "hidden",
        }}>
          {/* Title bar */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          6,
            padding:      "10px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background:   "rgba(255,255,255,0.02)",
          }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
            <span style={{
              fontSize: 11, color: "rgba(255,255,255,0.3)",
              marginLeft: 8, fontFamily: "monospace",
            }}>
              cgpa_pulse.sh
            </span>
          </div>

          {/* Lines */}
          <div style={{ padding: "16px 18px", minHeight: 200 }}>
            {visible.map((line, i) => {
              if (line.color === "console") {
                return (
                  <div key={i} style={{ margin: "12px 0" }}>
                    <button
                      onClick={e => { e.stopPropagation(); onOpenAbout(); }}
                      style={{
                        background:   "transparent",
                        border:       "1px solid #10b981",
                        borderRadius: 8,
                        padding:      "10px 16px",
                        color:        "#10b981",
                        fontSize:     "clamp(11px,2vw,14px)",
                        fontFamily:   "monospace",
                        cursor:       "pointer",
                        display:      "flex",
                        alignItems:   "center",
                        gap:          10,
                        animation:    "termGlow 2.5s ease-in-out infinite",
                        width:        "100%",
                        textAlign:    "left",
                        transition:   "all 0.2s",
                      }}
                      onMouseEnter={e =>
                        e.currentTarget.style.background = "rgba(16,185,129,0.08)"
                      }
                      onMouseLeave={e =>
                        e.currentTarget.style.background = "transparent"
                      }
                    >
                      <span style={{
                        width:        7, height: 7, borderRadius: "50%",
                        background:   "#10b981", flexShrink: 0,
                        animation:    "consolePulse 1s step-end infinite",
                        boxShadow:    "0 0 6px #10b981",
                      }} />
                      <span>
                        [ Developer Console ]
                        <span style={{
                          color: "rgba(16,185,129,0.55)",
                          marginLeft: 8, fontSize: "clamp(9px,1.5vw,11px)",
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
                  margin:     "2px 0",
                  fontSize:   "clamp(11px,1.8vw,13px)",
                  color:      line.color,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  wordBreak:  "break-word",
                }}>
                  {line.text}
                  {i === visible.length - 1 && !allDone && (
                    <span style={{
                      display:       "inline-block",
                      width:         8, height: 14,
                      background:    "#7c83f5",
                      marginLeft:    2,
                      verticalAlign: "middle",
                      animation:     "blink 0.7s step-end infinite",
                    }} />
                  )}
                </p>
              );
            })}
          </div>
        </div>

        {allDone && (
          <p style={{
            textAlign:  "center",
            marginTop:  16,
            fontSize:   11,
            color:      "rgba(255,255,255,0.25)",
            animation:  "blink 1.5s ease-in-out infinite",
          }}>
            tap anywhere to continue
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MobileLoginDrawer({ handleGoogleLogin, dark, onOpenAbout }) {
  const [phase,         setPhase]         = useState("terminal");
  const [termFading,    setTermFading]     = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showAbout,     setShowAbout]     = useState(false);

  function handleTermDone() {
    setTermFading(true);
    setTimeout(() => {
      setPhase("main");
      setTimeout(() => setDrawerVisible(true), 80);
    }, 400);
  }

  function openAbout() {
    setShowAbout(true);
    if (onOpenAbout) onOpenAbout();
  }

  return (
    <>
      {/* ── Terminal phase ──────────────────────────────────── */}
      {phase === "terminal" && (
        <div style={{
          opacity:    termFading ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}>
          <Terminal onDone={handleTermDone} onOpenAbout={openAbout} />
        </div>
      )}

      {/* ── Main phase ──────────────────────────────────────── */}
      {phase === "main" && (
        <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>

          {/* ── Background ──────────────────────────────────── */}
          <div style={{
            position: "absolute", inset: 0,
            background: dark
              ? "linear-gradient(160deg,#080c18 0%,#0f1133 55%,#080c18 100%)"
              : "linear-gradient(160deg,#f4f3ff 0%,#ede9fe 55%,#f4f3ff 100%)",
          }}>
            <FloatingCards dark={dark} />

            {/* Top fade */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "55%",
              background: dark
                ? "linear-gradient(180deg,rgba(8,12,24,0.9) 0%,transparent 100%)"
                : "linear-gradient(180deg,rgba(244,243,255,0.9) 0%,transparent 100%)",
              pointerEvents: "none", zIndex: 1,
            }} />

            {/* Bottom fade */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "65%",
              background: dark
                ? "linear-gradient(0deg,rgba(8,12,24,0.97) 0%,transparent 100%)"
                : "linear-gradient(0deg,rgba(244,243,255,0.97) 0%,transparent 100%)",
              pointerEvents: "none", zIndex: 1,
            }} />
          </div>

          {/* ── Branding — centered, scales for all screens ─── */}
          <div style={{
            position:       "absolute",
            top:            0, left: 0, right: 0,
            height:         "54%",
            zIndex:         10,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            padding:        "0 clamp(20px,6vw,60px)",
            textAlign:      "center",
            pointerEvents:  "none",
          }}>
            {/* MRSPTU label */}
            <p style={{
              margin:        "0 0 10px",
              fontSize:      "clamp(10px,1.4vw,13px)",
              color:         dark ? "rgba(255,255,255,0.35)" : "rgba(30,27,75,0.4)",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontWeight:    600,
            }}>
              MRSPTU Bathinda
            </p>

            {/* CGPA */}
            <h1 style={{
              margin:        0,
              fontSize:      "clamp(52px,10vw,108px)",
              fontWeight:    900,
              letterSpacing: "clamp(-2px,-0.4vw,-5px)",
              lineHeight:    1,
              color:         dark ? "rgba(255,255,255,0.93)" : "#1e1b4b",
            }}>
              CGPA
            </h1>

            {/* PULSE — gradient */}
            <h1 style={{
              margin:               "0 0 clamp(14px,2.5vw,24px)",
              fontSize:             "clamp(52px,10vw,108px)",
              fontWeight:           900,
              fontStyle:            "italic",
              letterSpacing:        "clamp(-2px,-0.4vw,-5px)",
              lineHeight:           1.1,
              paddingBottom:        4,
              paddingRight:         15,
              background:           dark
                ? "linear-gradient(135deg,#c084fc 0%,#67e8f9 100%)"
                : "linear-gradient(135deg,#7c3aed 0%,#10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip:       "text",
              display:              "block",
              overflow:             "visible",
            }}>
              PULSE
            </h1>

            {/* Typing tagline */}
            <p style={{
              margin:     0,
              fontSize:   "clamp(13px,1.8vw,18px)",
              color:      dark ? "rgba(255,255,255,0.5)" : "#5b5687",
              lineHeight: 1.5,
              pointerEvents: "auto",
            }}>
              The smarter way to <TypingText dark={dark} />
            </p>
          </div>

          {/* ── Bottom drawer — max-width centered on desktop ── */}
          <div style={{
            position:             "absolute",
            bottom:               0,
            left:                 "50%",
            transform:            drawerVisible
              ? "translate(-50%, 0)"
              : "translate(-50%, 100%)",
            width:                "100%",
            maxWidth:             "min(100%, 560px)",   // ← centered card on desktop
            zIndex:               20,
            background:           dark
              ? "rgba(13,14,26,0.95)"
              : "rgba(255,255,255,0.95)",
            backdropFilter:       "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            borderRadius:         "clamp(16px,3vw,24px) clamp(16px,3vw,24px) 0 0",
            border:               `1px solid ${dark
              ? "rgba(167,139,250,0.18)"
              : "rgba(124,58,237,0.12)"}`,
            borderBottom:         "none",
            padding:              "10px clamp(20px,5vw,36px) clamp(28px,5vw,44px)",
            boxShadow:            dark
              ? "0 -20px 60px rgba(0,0,0,0.55)"
              : "0 -20px 60px rgba(109,40,217,0.12)",
            transition:           "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}>

            {/* Handle */}
            <div style={{
              width:        40, height: 4, borderRadius: 99,
              background:   dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
              margin:       "0 auto clamp(14px,2.5vw,22px)",
            }} />

            {/* Headline */}
            <p style={{
              margin:     "0 0 4px",
              fontSize:   "clamp(17px,2.5vw,22px)",
              fontWeight: 800,
              color:      dark ? "rgba(255,255,255,0.92)" : "#1e1b4b",
              textAlign:  "center",
            }}>
              Sign in to get started
            </p>
            <p style={{
              margin:     "0 0 clamp(14px,2vw,20px)",
              fontSize:   "clamp(11px,1.4vw,13px)",
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
                padding:        "clamp(12px,1.8vw,16px) 16px",
                borderRadius:   14,
                border:         `1.5px solid ${dark ? "rgba(255,255,255,0.14)" : "#dadce0"}`,
                background:     dark ? "rgba(255,255,255,0.08)" : "#fff",
                color:          dark ? "rgba(255,255,255,0.9)" : "#3c4043",
                fontSize:       "clamp(14px,1.6vw,16px)",
                fontWeight:     600,
                fontFamily:     "inherit",
                cursor:         "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            12,
                transition:     "all 0.2s",
                boxShadow:      dark ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
                marginBottom:   "clamp(10px,1.5vw,14px)",
              }}
              onMouseEnter={e =>
                e.currentTarget.style.background = dark
                  ? "rgba(255,255,255,0.13)" : "#f8f9fa"
              }
              onMouseLeave={e =>
                e.currentTarget.style.background = dark
                  ? "rgba(255,255,255,0.08)" : "#fff"
              }
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
              onClick={openAbout}
              style={{
                width:          "100%",
                padding:        "clamp(10px,1.5vw,13px) 14px",
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
                marginBottom:   "clamp(8px,1.2vw,12px)",
              }}
              onMouseEnter={e =>
                e.currentTarget.style.background = "rgba(16,185,129,0.1)"
              }
              onMouseLeave={e =>
                e.currentTarget.style.background = dark
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(16,185,129,0.04)"
              }
            >
              {/* KK avatar */}
              <div style={{
                width:          "clamp(34px,5vw,42px)",
                height:         "clamp(34px,5vw,42px)",
                borderRadius:   "50%",
                background:     "linear-gradient(135deg,#6d28d9,#a78bfa)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       "clamp(11px,1.6vw,14px)",
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
                  fontSize: "clamp(12px,1.5vw,14px)",
                  fontWeight: 700,
                  color:    dark ? "rgba(255,255,255,0.88)" : "#1e1b4b",
                }}>
                  Khushneet Kaur
                </p>
                <p style={{
                  margin:   0,
                  fontSize: "clamp(9px,1.2vw,11px)",
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
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#10b981",
                  animation: "consolePulse 1.2s step-end infinite",
                  boxShadow: "0 0 5px #10b981",
                }} />
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  color: "#10b981", fontFamily: "monospace",
                  letterSpacing: 0.4,
                }}>
                  CONSOLE
                </span>
              </div>
            </button>

            <p style={{
              textAlign:  "center",
              fontSize:   "clamp(8px,1.1vw,10px)",
              color:      dark ? "rgba(255,255,255,0.16)" : "#c4bfd8",
              lineHeight: 1.6,
              margin:     0,
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