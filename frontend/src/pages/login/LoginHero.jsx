import { useState, useEffect, useRef } from "react";
import { useAppData } from "../../context/AppDataContext";
import MRSPTULogo from "../../components/MRSPTULogo";

const TYPING_TEXTS = [
  "track your SGPA live",
  "predict your grades",
  "crush every semester",
  "manage your backlogs",
  "hit your target CGPA",
];

const FEATURES = [
  { icon: "🧮", label: "Live SGPA" },
  { icon: "🎯", label: "Target CGPA" },
  { icon: "🔮", label: "Predictor" },
  { icon: "⚠",  label: "Backlogs" },
  { icon: "🏆", label: "Leaderboard" },
  { icon: "📊", label: "6 Branches" },
];

// Typing animation 
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
    <span style={{ color: dark ? "#a78bfa" : "#7c3aed", fontWeight: 800 }}>
      {displayed}
      <span style={{
        display: "inline-block", width: 2, height: "0.85em",
        background: dark ? "#a78bfa" : "#7c3aed",
        marginLeft: 3, verticalAlign: "middle",
        animation: "blink 0.75s step-end infinite",
      }} />
    </span>
  );
}

// Canvas-rendered PULSE 
function PulseCanvas({ dark, fontSize }) {
  const canvasRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d");
    ctx.font     = `900 italic ${fontSize}px Inter, -apple-system, sans-serif`;
    const metrics = ctx.measureText("PULSE");
    const w = Math.ceil(metrics.width) + 32;
    const h = Math.ceil(
      (metrics.actualBoundingBoxAscent  || fontSize) +
      (metrics.actualBoundingBoxDescent || fontSize * 0.2)
    ) + 16;
    setDims({ w, h });
  }, [fontSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;
    const dpr     = window.devicePixelRatio || 1;
    canvas.width  = dims.w * dpr;
    canvas.height = dims.h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dims.w, dims.h);
    const grad = ctx.createLinearGradient(0, 0, dims.w, dims.h);
    if (dark) {
      grad.addColorStop(0, "#c084fc");
      grad.addColorStop(0.48, "#67e8f9");
      grad.addColorStop(1, "#a78bfa");
    } else {
      grad.addColorStop(0, "#7c3aed");
      grad.addColorStop(0.48, "#10b981");
      grad.addColorStop(1, "#8b5cf6");
    }
    ctx.fillStyle    = grad;
    ctx.font         = `900 italic ${fontSize}px Inter, -apple-system, sans-serif`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText("PULSE", 4, dims.h);
  }, [dark, fontSize, dims]);

  if (dims.w === 0) return (
    <span style={{
      fontSize, fontWeight: 900, fontStyle: "italic",
      color: "transparent", display: "inline-block",
    }}>PULSE</span>
  );

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "inline-block", verticalAlign: "baseline",
        width: dims.w, height: dims.h,
        marginBottom: -(dims.h - fontSize * 0.15),
        marginLeft: "0.08em", overflow: "visible",
      }}
    />
  );
}

// Disclaimer pill 
function DisclaimerPill({ dark, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 8, cursor: "pointer",
        border: `1px solid ${dark ? "rgba(251,146,60,0.25)" : "rgba(217,119,6,0.2)"}`,
        background: dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
        fontFamily: "monospace", backdropFilter: "blur(10px)",
        transition: "all 0.18s", flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = dark ? "rgba(251,146,60,0.5)" : "rgba(217,119,6,0.4)";
        e.currentTarget.style.background  = dark ? "rgba(251,146,60,0.08)" : "rgba(217,119,6,0.05)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = dark ? "rgba(251,146,60,0.25)" : "rgba(217,119,6,0.2)";
        e.currentTarget.style.background  = dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)";
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: "#fb923c", flexShrink: 0, boxShadow: "0 0 6px #fb923caa",
      }} />
      <span style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
        color: dark ? "rgba(251,146,60,0.9)" : "#b45309",
      }}>
        [ Read Disclaimer ]
      </span>
    </button>
  );
}

export default function LoginHero({ onAuth, onAbout, onDisclaimer, mounted }) {
  const { dark } = useAppData();
  const [fontSize, setFontSize] = useState(72);
  const heroRef = useRef(null);

  useEffect(() => {
    function measure() {
      const vw = window.innerWidth;
      // Cap the font size to keep it clean and tight like mobile view even on desktop monitors
      setFontSize(Math.round(Math.min(80, Math.max(52, vw * 0.06))));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      ref={heroRef}
      style={{
        width:         "100%",
        position:      "relative",
        zIndex:        1,
        overflowX:     "hidden",
        opacity:       mounted ? 1 : 0,
        transform:     mounted ? "translateY(0)" : "translateY(20px)",
        transition:    "opacity 0.65s ease, transform 0.65s ease",
      }}
    >
      <div style={{
        minHeight:      "100vh",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "space-between",
        paddingBottom:  32,
        boxSizing:      "border-box",
      }}>

        {/* Global Unified Center Header */}
        <div style={{
          width:        "100%",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          padding:      "20px 16px",
          gap:          10,
          boxSizing:    "border-box",
        }}>
          <MRSPTULogo size={32} />
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 14, fontWeight: 700,
              whiteSpace: "nowrap",
              color: dark ? "rgba(255,255,255,0.85)" : "#1e1b4b",
            }}>
              MRSPTU, Bathinda
            </p>
          </div>
        </div>

        {/* Center UI Layout for both Phone and Desktop Viewports */}
        <div style={{
          flex:           1,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "0 24px",
          textAlign:      "center",
          width:          "100%",
          maxWidth:       600,
          boxSizing:      "border-box",
        }}>

          {/* Heading Glow Wrap */}
          <div style={{
            marginBottom: 16,
            position:     "relative",
            display:      "inline-block",
            padding:      "0 12px 10px 6px",
          }}>
            <div style={{
              position:      "absolute",
              inset:         "-20px -40px",
              background:    dark
                ? "radial-gradient(ellipse,rgba(124,63,245,0.22) 0%,transparent 70%)"
                : "radial-gradient(ellipse,rgba(124,58,237,0.14) 0%,transparent 70%)",
              borderRadius:  "50%",
              zIndex:        0,
              pointerEvents: "none",
            }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <h1 style={{
                margin:        0,
                lineHeight:    1.05,
                fontSize:      fontSize,
                fontWeight:    900,
                letterSpacing: "-2px",
                userSelect:    "none",
                color:         dark ? "rgba(255,255,255,0.93)" : "#1e1b4b",
              }}>
                CGPA
              </h1>
              <PulseCanvas dark={dark} fontSize={fontSize} />
            </div>
            <div style={{
              height:         2,
              width:          "55%",
              margin:         "6px auto 0",
              borderRadius:   99,
              background:     dark
                ? "linear-gradient(90deg,transparent,#c084fc,#67e8f9,transparent)"
                : "linear-gradient(90deg,transparent,#7c3aed,#10b981,transparent)",
              backgroundSize: "200% auto",
              animation:      "shimmer 3s linear infinite",
            }} />
          </div>

          {/* Typing Text Subheading */}
          <p style={{
            margin:     "0 0 28px",
            fontSize:   "clamp(15px, 2vw, 18px)",
            color:      dark ? "rgba(255,255,255,0.5)" : "#5b5687",
            lineHeight: 1.5,
            fontWeight: 400,
          }}>
            The smarter way to <TypingText dark={dark} />
          </p>

          {/* Centered Horizontal / Wrap feature row */}
          <div style={{
            display:        "flex",
            flexWrap:       "wrap",
            gap:            8,
            justifyContent: "center",
            maxWidth:       440,
            marginBottom:   32,
          }}>
            {FEATURES.map((f) => (
              <div key={f.label} style={{
                display:        "flex",
                alignItems:     "center",
                gap:            6,
                padding:        "6px 14px",
                borderRadius:   99,
                fontSize:       13,
                fontWeight:     500,
                background:     dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)",
                border:         `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.12)"}`,
                backdropFilter: "blur(12px)",
                color:          dark ? "rgba(255,255,255,0.7)" : "#5b5687",
              }}>
                <span>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* Interactive Stack Buttons */}
          <div style={{
            display:       "flex",
            flexDirection: "column",
            gap:           12,
            width:         "100%",
            maxWidth:      320,
            marginBottom:  28,
          }}>
            <button
              onClick={() => onAuth("login")}
              style={{
                width:         "100%",
                padding:       "14px",
                fontSize:      15,
                fontWeight:    700,
                borderRadius:  99,
                border:        "none",
                cursor:        "pointer",
                fontFamily:    "inherit",
                letterSpacing: 0.3,
                background:    dark
                  ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
                  : "linear-gradient(135deg,#7c3aed,#10b981)",
                color:         "#fff",
                boxShadow:     dark
                  ? "0 6px 28px rgba(124,63,245,0.55)"
                  : "0 6px 28px rgba(124,58,237,0.35)",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Login →
            </button>
            <button
              onClick={() => onAuth("signup")}
              style={{
                width:          "100%",
                padding:        "14px",
                fontSize:       15,
                fontWeight:     700,
                borderRadius:   99,
                cursor:         "pointer",
                fontFamily:     "inherit",
                letterSpacing:  0.3,
                background:     "transparent",
                border:         `2px solid ${dark ? "rgba(167,139,250,0.5)" : "rgba(124,58,237,0.35)"}`,
                color:          dark ? "#c4b5fd" : "#7c3aed",
                backdropFilter: "blur(10px)",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(167,139,250,0.1)" : "rgba(124,58,237,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              Sign Up
            </button>
          </div>

          {/* Unified Utilities Control Base Block */}
          <div style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:            12,
            marginTop:      12,
          }}>
            <button
              onClick={onAbout}
              style={{
                display:        "flex",
                alignItems:     "center",
                gap:            8,
                padding:        "9px 16px",
                borderRadius:   10,
                cursor:         "pointer",
                border:         `1px solid ${dark ? "rgba(167,139,250,0.25)" : "rgba(109,40,217,0.18)"}`,
                background:     dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)",
                fontFamily:     "monospace",
                backdropFilter: "blur(10px)",
                transition:     "all 0.18s",
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#10b981", flexShrink: 0,
                boxShadow: "0 0 6px #10b981aa",
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: dark ? "rgba(167,139,250,0.9)" : "#6d28d9" }}>
                [ About the Developer ]
              </span>
            </button>

            <DisclaimerPill dark={dark} onClick={onDisclaimer} />
          </div>

        </div>
      </div>
    </div>
  );
}