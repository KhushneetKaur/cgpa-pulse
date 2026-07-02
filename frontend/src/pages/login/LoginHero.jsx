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

// This completely bypasses webkit-background-clip and its theme-switch bug.
function PulseCanvas({ dark, fontSize }) {
  const canvasRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Measure dims from font metrics without a hidden DOM element
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d");
    ctx.font     = `900 italic ${fontSize}px Inter, -apple-system, sans-serif`;
    const metrics = ctx.measureText("PULSE");
    // actualBoundingBox gives exact pixel bounds including italic overhang
    const w = Math.ceil(metrics.width) + 32;   // 32px extra for italic E overhang
    const h = Math.ceil(
      (metrics.actualBoundingBoxAscent  || fontSize) +
      (metrics.actualBoundingBoxDescent || fontSize * 0.2)
    ) + 16;
    setDims({ w, h });
  }, [fontSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;

    const dpr    = window.devicePixelRatio || 1;
    canvas.width  = dims.w * dpr;
    canvas.height = dims.h * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, dims.w, dims.h);

    const grad = ctx.createLinearGradient(0, 0, dims.w, dims.h);
    if (dark) {
      grad.addColorStop(0,    "#c084fc");
      grad.addColorStop(0.48, "#67e8f9");
      grad.addColorStop(1,    "#a78bfa");
    } else {
      grad.addColorStop(0,    "#7c3aed");
      grad.addColorStop(0.48, "#10b981");
      grad.addColorStop(1,    "#8b5cf6");
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
    }}>
      PULSE
    </span>
  );

  return (
    <canvas
      ref={canvasRef}
      style={{
        display:       "inline-block",
        verticalAlign: "baseline",
        // Canvas sits on baseline, sized to contain full italic glyph
        width:         dims.w,
        height:        dims.h,
        // Pull it up so baseline aligns with CGPA
        marginBottom:  -(dims.h - fontSize * 0.15),
        marginLeft:    "0.08em",
        // No overflow clipping
        overflow:      "visible",
      }}
    />
  );
}

function DisclaimerPill({ dark, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            6,
        padding:        "7px 14px",
        borderRadius:   8,
        cursor:         "pointer",
        border:         `1px solid ${dark
          ? "rgba(251,146,60,0.25)"
          : "rgba(217,119,6,0.2)"}`,
        background:     dark
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.5)",
        fontFamily:     "monospace",
        backdropFilter: "blur(10px)",
        transition:     "all 0.18s",
        flexShrink:     0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = dark
          ? "rgba(251,146,60,0.5)"
          : "rgba(217,119,6,0.4)";
        e.currentTarget.style.background = dark
          ? "rgba(251,146,60,0.08)"
          : "rgba(217,119,6,0.05)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = dark
          ? "rgba(251,146,60,0.25)"
          : "rgba(217,119,6,0.2)";
        e.currentTarget.style.background = dark
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.5)";
      }}
    >
      <span style={{
        width:        6,
        height:       6,
        borderRadius: "50%",
        background:   "#fb923c",
        flexShrink:   0,
        boxShadow:    "0 0 6px #fb923caa",
      }} />
      <span style={{
        fontSize:      11,
        fontWeight:    600,
        color:         dark ? "rgba(251,146,60,0.9)" : "#b45309",
        letterSpacing: 0.3,
      }}>
        [ Read Disclaimer ]
      </span>
    </button>
  );
}

export default function LoginHero({ onAuth, onAbout, onDisclaimer, mounted }) {
  const { dark } = useAppData();
  const [fontSize, setFontSize] = useState(96);
  const heroRef = useRef(null);

  // Track viewport width to recompute canvas font size
  useEffect(() => {
    function measure() {
      const vw = window.innerWidth;
      // Match the clamp: clamp(52px, 10.5vw, 116px)
      const computed = Math.min(116, Math.max(52, vw * 0.105));
      setFontSize(Math.round(computed));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      ref={heroRef}
      style={{
        width: "100%", minHeight: "100vh", boxSizing: "border-box",
        display: "flex", flexDirection: "column",
        position: "relative", zIndex: 1,
        opacity:   mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.65s ease, transform 0.65s ease",
      }}
    >

      {/* ── Header row ─────────────────────────────────────────── */}
      <div style={{
        width:          "100%",
        display:        "flex",
        alignItems:     "center",
        // Space for the fixed dark-mode toggle on the right
        padding:        "clamp(14px,2.5vw,22px) clamp(16px,4vw,36px)",
        // Push right content away from the fixed toggle
        paddingRight:   "clamp(60px,8vw,80px)",
        animation:      "fadeDown 0.5s ease both",
        gap:            12,
      }}>

        {/* Logo + uni name — left */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <MRSPTULogo size={36} />
          <div>
            <p style={{
              margin: 0, fontSize: "clamp(11px,1.4vw,13px)", fontWeight: 700,
              lineHeight: 1.25,
              color: dark ? "rgba(255,255,255,0.85)" : "#1e1b4b",
            }}>
              MRSPTU, Bathinda
            </p>
            <p style={{
  margin: 0, fontSize: "clamp(9px,1.1vw,11px)", lineHeight: 1.25,
  color: dark ? "rgba(255, 255, 255, 0.55)" : "#4a4570",
}}>
  Maharaja Ranjit Singh Punjab Technical University
</p>
          </div>
        </div>

       {/* Spacer */}
<div style={{ flex: 1 }} />

{/* Developer console trigger */}
<button
  onClick={onAbout}
  style={{
    display:        "flex",
    alignItems:     "center",
    gap:            6,
    padding:        "7px 14px",
    borderRadius:   8,
    cursor:         "pointer",
    border:         `1px solid ${dark
      ? "rgba(167,139,250,0.25)"
      : "rgba(109,40,217,0.18)"}`,
    background:     dark
      ? "rgba(255,255,255,0.03)"
      : "rgba(255,255,255,0.5)",
    fontFamily:     "monospace",
    backdropFilter: "blur(10px)",
    transition:     "all 0.18s",
    flexShrink:     0,
  }}
  onMouseEnter={e => {
    e.currentTarget.style.borderColor = dark
      ? "rgba(167,139,250,0.5)"
      : "rgba(109,40,217,0.35)";
    e.currentTarget.style.background = dark
      ? "rgba(167,139,250,0.08)"
      : "rgba(109,40,217,0.05)";
  }}
  onMouseLeave={e => {
    e.currentTarget.style.borderColor = dark
      ? "rgba(167,139,250,0.25)"
      : "rgba(109,40,217,0.18)";
    e.currentTarget.style.background = dark
      ? "rgba(255,255,255,0.03)"
      : "rgba(255,255,255,0.5)";
  }}
>
  <span style={{
    width:        6,
    height:       6,
    borderRadius: "50%",
    background:   "#10b981",
    flexShrink:   0,
    boxShadow:    "0 0 6px #10b981aa",
  }} />
  <span style={{
    fontSize:      11,
    fontWeight:    600,
    color:         dark ? "rgba(167,139,250,0.9)" : "#6d28d9",
    letterSpacing: 0.3,
  }}>
    [ About the Developer ]
  </span>
</button>

{/* Disclaimer pill */}
<DisclaimerPill dark={dark} onClick={onDisclaimer} />
          
        </div>
      

      {/* ── Hero centre ────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "clamp(10px,3vw,30px) clamp(16px,5vw,2rem) clamp(24px,4vw,48px)",
        textAlign: "center",
      }}>

        {/* CGPA PULSE */}
        <div style={{
          marginBottom: "clamp(14px,2.8vw,26px)",
          animation:    "fadeUp 0.65s ease 0.1s both",
          position:     "relative",
          display:      "inline-block",
          // Enough padding so canvas-drawn E is fully visible
          padding:      "0 16px 12px 8px",
        }}>
          {/* Glow */}
          <div style={{
            position: "absolute", inset: "-20px -40px",
            background: dark
              ? "radial-gradient(ellipse,rgba(124,63,245,0.2) 0%,transparent 70%)"
              : "radial-gradient(ellipse,rgba(124,58,237,0.12) 0%,transparent 70%)",
            borderRadius: "50%", zIndex: 0, pointerEvents: "none",
          }} />

          <h1 style={{
            margin:        0,
            lineHeight:    1.05,
            fontSize:      "clamp(52px,10.5vw,116px)",
            fontWeight:    900,
            letterSpacing: "clamp(-2px,-0.4vw,-4px)",
            whiteSpace:    "nowrap",
            position:      "relative", zIndex: 1,
            userSelect:    "none",
            display:       "flex",
            alignItems:    "baseline",
            gap:           "0.12em",
          }}>
            {/* CGPA — plain solid text, never has clip issues */}
            <span style={{
              color: dark ? "rgba(255,255,255,0.93)" : "#1e1b4b",
            }}>
              CGPA
            </span>

            {/* PULSE — canvas rendered, immune to theme switch */}
            <PulseCanvas dark={dark} fontSize={fontSize} />
          </h1>

          {/* Underline */}
          <div style={{
            height:         "clamp(2px,0.3vw,3px)",
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

        {/* Tagline */}
        <p style={{
          margin:     "0 0 clamp(18px,3vw,28px)",
          maxWidth:   "min(480px,90vw)",
          fontSize:   "clamp(14px,1.8vw,19px)",
          color:      dark ? "rgba(255,255,255,0.46)" : "#5b5687",
          lineHeight: 1.55,
          fontWeight: 400,
          animation:  "fadeUp 0.6s ease 0.2s both",
        }}>
          The smarter way to <TypingText dark={dark} />
        </p>

        {/* Feature pills */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "clamp(6px,1vw,10px)",
          justifyContent: "center", maxWidth: "min(560px,92vw)",
          animation: "fadeUp 0.6s ease 0.28s both",
          marginBottom: "clamp(20px,3.5vw,32px)",
        }}>
          {FEATURES.map((f, i) => (
            <div key={f.label} style={{
              display: "flex", 
              alignItems: "center",
              gap: 6, 
              padding: "clamp(6px,0.8vw,9px) clamp(10px,1.4vw,16px)",
              borderRadius: 99, 
              fontSize: "clamp(11px,1.2vw,13px)",
              fontWeight: 500, cursor: "default",
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)",
              border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.12)"}`,
              backdropFilter: "blur(12px)",
              color: dark ? "rgba(255,255,255,0.7)" : "#5b5687",
              animation: `fadeUp 0.5s ease ${0.32 + i * 0.05}s both`,
            }}>
              <span style={{ fontSize: "clamp(12px,1.3vw,14px)" }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{
          display: "flex", 
          gap: "clamp(8px,1.5vw,14px)",
          flexWrap: "wrap", 
          justifyContent: "center",
          animation: "fadeUp 0.6s ease 0.4s both",
          marginBottom: "clamp(20px,3.5vw,36px)",
        }}>
          <button
            onClick={() => onAuth("login")}
            style={{
              padding:       "clamp(11px,1.4vw,14px) clamp(24px,3.5vw,36px)",
              fontSize:      "clamp(13px,1.4vw,15px)",
              fontWeight:    700, 
              borderRadius: 99,
              border:        "none", 
              cursor: "pointer",
              fontFamily:    "inherit", 
              letterSpacing: 0.3,
              background:    dark
                ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
                : "linear-gradient(135deg,#7c3aed,#10b981)",
              color:         "#fff",
              boxShadow:     dark
                ? "0 6px 28px rgba(124,63,245,0.55)"
                : "0 6px 28px rgba(124,58,237,0.35)",
              transition:    "all 0.18s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
            }}
          >
            Login →
          </button>

          <button
            onClick={() => onAuth("signup")}
            style={{
              padding:       "clamp(11px,1.4vw,14px) clamp(24px,3.5vw,36px)",
              fontSize:      "clamp(13px,1.4vw,15px)",
              fontWeight:    700, 
              borderRadius: 99,
              cursor:        "pointer", 
              fontFamily: "inherit",
              letterSpacing: 0.3, 
              background: "transparent",
              border:        `2px solid ${dark ? "rgba(167,139,250,0.5)" : "rgba(124,58,237,0.35)"}`,
              color:         dark ? "#c4b5fd" : "#7c3aed",
              backdropFilter: "blur(10px)", 
              transition: "all 0.18s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = dark
                ? "rgba(167,139,250,0.12)" : "rgba(124,58,237,0.07)";
              e.currentTarget.style.transform  = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform  = "translateY(0)";
            }}
          >
            Sign Up
          </button>
        </div>

      </div>
    </div>
  );
}