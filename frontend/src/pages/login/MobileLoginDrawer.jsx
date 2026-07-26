import { useState, useEffect, useRef } from "react";
import AboutModal from "./AboutModal";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { apiCheckEmail, apiSendOTP, apiForgotPassword, apiLogin } from "../../services/auth.api";

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
  { text: "> Loading 7 engineering branches...   [OK]", delay: 1000, color: "#2dd4aa" },
  { text: "> Syncing semester data structure...  [OK]", delay: 1500, color: "#2dd4aa" },
  { text: "> Calculating CGPA algorithms...      [OK]", delay: 2000, color: "#2dd4aa" },
  { text: "  ─────────────────────────────────────────", delay: 2400, color: "rgba(236,238,248,0.2)" },
  { text: "> System Architect: Khushneet Kaur",         delay: 2800, color: "#a78bfa" },
  { text: "> B.Tech CSE · GZSCCET · MRSPTU Bathinda",  delay: 3200, color: "#a78bfa" },
  { text: "> GitHub / LinkedIn → tap console below",   delay: 3600, color: "#a78bfa" },
  { text: "  ─────────────────────────────────────────", delay: 4000, color: "rgba(236,238,248,0.2)" },
  { text: "CONSOLE_BTN",                               delay: 4400, color: "console" },
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

      <div style={{
        position:   "relative",
        zIndex:     2,
        width:      "100%",
        maxWidth:   560,
        padding:    "clamp(24px,5vw,48px) clamp(20px,5vw,40px)",
        fontFamily: "monospace",
        boxSizing:  "border-box",
      }}>
        <div style={{
          background:   "rgba(255,255,255,0.03)",
          border:       "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          overflow:     "hidden",
        }}>
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
  const { verifyOtpAndLogin, setUser } = useAuth();
  
  const [phase,         setPhase]         = useState("terminal");
  const [termFading,    setTermFading]    = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showAbout,     setShowAbout]     = useState(false);
  const [isDesktop,     setIsDesktop]     = useState(window.innerWidth > 768);

  // Auth Steps: "entry" | "signup" | "login" | "otp"
  const [step, setStep] = useState("entry");
  
  // Auth Form State
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otpId, setOtpId] = useState("");
  const [otpArr, setOtpArr] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  
  const otpRefs = useRef([]);

  useEffect(() => {
    function onResize() { setIsDesktop(window.innerWidth > 768); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  async function handleEntrySubmit(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await apiCheckEmail(email);
      if (!res.exists) {
        setStep("signup");
      } else if (res.isGoogleOnly) {
        toast.error("This email uses Google Sign-In. Please use the Google button.");
      } else if (res.hasSetPassword) {
        setStep("login");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to check email");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupOrLoginSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      if (step === "login") {
        const user = await apiLogin({ identifier: email, password });
        toast.success("Welcome back!");
        setUser(user);
      } else {
        const payload = { email, intent: "signup", password, username };
        const res = await apiSendOTP(payload);
        setOtpId(res.otpId);
        setStep("otp");
        toast.success("OTP sent to your email!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${step}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault(); // Prevent any form submission just in case
    console.log("Forgot password clicked for email:", email);
    if (!email) {
      toast.error("No email found. Please go back and enter your email.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Sending reset link...");
    try {
      await apiForgotPassword(email);
      toast.success("If the account exists, a reset link was sent.", { id: toastId });
      setStep("forgot-success");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error(err.response?.data?.error || "Failed to send reset link", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpChange(index, val) {
    if (val.length > 1) val = val.slice(-1);
    const newArr = [...otpArr];
    newArr[index] = val;
    setOtpArr(newArr);

    // Auto focus next
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto submit on last digit
    if (index === 5 && val && newArr.every(x => x)) {
      const fullOtp = newArr.join("");
      setLoading(true);
      try {
        await verifyOtpAndLogin(otpId, fullOtp);
        toast.success("Verified successfully!");
        // Navigation is handled by AuthContext setting user, App.jsx re-renders
      } catch (err) {
        setOtpArr(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otpArr[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newArr = [...otpArr];
    for (let i = 0; i < pasted.length; i++) {
      newArr[i] = pasted[i];
    }
    setOtpArr(newArr);
    if (pasted.length === 6) {
      otpRefs.current[5]?.focus();
      // Manually trigger submit logic since state update is async
      setTimeout(async () => {
        setLoading(true);
        try {
          await verifyOtpAndLogin(otpId, pasted);
          toast.success("Verified successfully!");
        } catch (err) {
          setOtpArr(["", "", "", "", "", ""]);
          otpRefs.current[0]?.focus();
        } finally {
          setLoading(false);
        }
      }, 0);
    } else {
      otpRefs.current[pasted.length]?.focus();
    }
  }

  // Common input styles
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 12,
    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
    background: dark ? "rgba(255,255,255,0.05)" : "#fff",
    color: dark ? "#fff" : "#1e1b4b",
    marginBottom: 12,
    outline: "none",
    fontSize: 15,
  };

  const btnStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
    color: "#fff",
    border: "none",
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    marginBottom: 16,
    fontSize: 15,
  };

  return (
    <>
      {phase === "terminal" && (
        <div style={{
          opacity:    termFading ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}>
          <Terminal onDone={handleTermDone} onOpenAbout={openAbout} />
        </div>
      )}

      {phase === "main" && (
        <div style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          display: isDesktop ? "flex" : "block",
          flexDirection: isDesktop ? "column" : undefined,
          alignItems: isDesktop ? "center" : undefined,
          justifyContent: isDesktop ? "center" : undefined,
        }}>

          {/* Background Elements */}
          <div style={{
            position: "absolute", inset: 0,
            background: dark
              ? "linear-gradient(160deg,#080c18 0%,#0f1133 55%,#080c18 100%)"
              : "linear-gradient(160deg,#f4f3ff 0%,#ede9fe 55%,#f4f3ff 100%)",
          }}>
            <FloatingCards dark={dark} />
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "55%",
              background: dark
                ? "linear-gradient(180deg,rgba(8,12,24,0.9) 0%,transparent 100%)"
                : "linear-gradient(180deg,rgba(244,243,255,0.9) 0%,transparent 100%)",
              pointerEvents: "none", zIndex: 1,
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "65%",
              background: dark
                ? "linear-gradient(0deg,rgba(8,12,24,0.97) 0%,transparent 100%)"
                : "linear-gradient(0deg,rgba(244,243,255,0.97) 0%,transparent 100%)",
              pointerEvents: "none", zIndex: 1,
            }} />
          </div>

          {/* ── Branding ── */}
          <div style={{
            position:       isDesktop ? "relative" : "absolute",
            top:            isDesktop ? "auto" : 0,
            left:           isDesktop ? "auto" : 0,
            right:          isDesktop ? "auto" : 0,
            height:         isDesktop ? "auto" : "54%",
            marginBottom:   isDesktop ? 28 : 0,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            padding:        "0 clamp(20px,6vw,60px)",
            textAlign:      "center",
            pointerEvents:  "none",
            zIndex:         2,
          }}>
            <p style={{
              margin:        "0 0 8px",
              fontSize:      "clamp(10px,1.4vw,13px)",
              color:         dark ? "rgba(255,255,255,0.35)" : "rgba(30,27,75,0.4)",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontWeight:    600,
            }}>
              MRSPTU Bathinda
            </p>
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
            <h1 style={{
              margin:               "0 0 clamp(10px,2vw,18px)",
              fontSize:             "clamp(52px,10vw,108px)",
              fontWeight:           900,
              fontStyle:            "italic",
              letterSpacing:        "clamp(-2px,-0.4vw,-5px)",
              lineHeight:           1.1,
              paddingBottom:        4,
              paddingRight:         18,
              backgroundImage:      dark
                ? "linear-gradient(135deg, #c084fc 0%, #67e8f9 100%)"
                : "linear-gradient(135deg, #7c3aed 0%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip:       "text",
              WebkitTextFillColor:  "transparent",
              color:                "transparent",
              display:              "inline-block",
              isolation:            "isolate",
            }}>
              PULSE
            </h1>
            <p style={{
              margin:        0,
              fontSize:      "clamp(13px,1.8vw,18px)",
              color:         dark ? "rgba(255,255,255,0.5)" : "#5b5687",
              lineHeight:    1.5,
              pointerEvents: "auto",
            }}>
              The smarter way to <TypingText dark={dark} />
            </p>
          </div>

          {/* ── Sign-in Drawer ── */}
          <div style={{
            position:     isDesktop ? "relative" : "absolute",
            bottom:       isDesktop ? "auto" : 0,
            left:         isDesktop ? "auto" : "50%",
            transform:    isDesktop
              ? drawerVisible ? "translateY(0)" : "translateY(20px)"
              : drawerVisible ? "translate(-50%, 0)" : "translate(-50%, 100%)",
            opacity:      drawerVisible ? 1 : 0,
            width:        "100%",
            maxWidth:     isDesktop ? 420 : "min(100%, 480px)",
            borderRadius: isDesktop ? 24 : "20px 20px 0 0",
            zIndex:       20,
            background:   dark ? "rgba(13,14,26,0.95)" : "rgba(255,255,255,0.95)",
            backdropFilter:       "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border:               `1px solid ${dark ? "rgba(167,139,250,0.18)" : "rgba(124,58,237,0.12)"}`,
            padding:      "20px clamp(20px,5vw,36px) clamp(24px,5vw,32px)",
            boxShadow:    dark
              ? isDesktop ? "0 20px 60px rgba(0,0,0,0.6)" : "0 -20px 60px rgba(0,0,0,0.55)"
              : isDesktop ? "0 20px 60px rgba(109,40,217,0.15)" : "0 -20px 60px rgba(109,40,217,0.12)",
            transition:   "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease",
          }}>

            {!isDesktop && (
              <div style={{
                width:        40, height: 4, borderRadius: 99,
                background:   dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
                margin:       "0 auto clamp(14px,2.5vw,22px)",
              }} />
            )}

            {/* ── STEP: ENTRY ── */}
            {step === "entry" && (
              <form onSubmit={handleEntrySubmit}>
                <p style={{
                  margin: "0 0 16px", fontSize: "clamp(17px,2.5vw,22px)", fontWeight: 800,
                  color: dark ? "rgba(255,255,255,0.92)" : "#1e1b4b", textAlign: "center"
                }}>
                  Sign in to get started
                </p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
                <button type="submit" style={btnStyle} disabled={loading}>
                  {loading ? "Checking..." : "Continue with Email"}
                </button>

                <div style={{ display: "flex", alignItems: "center", margin: "16px 0" }}>
                  <div style={{ flex: 1, height: 1, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
                  <span style={{ margin: "0 10px", fontSize: 12, color: dark ? "rgba(255,255,255,0.4)" : "#a09bbf" }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: 12,
                    border: `1.5px solid ${dark ? "rgba(255,255,255,0.14)" : "#dadce0"}`,
                    background: dark ? "rgba(255,255,255,0.08)" : "#fff",
                    color: dark ? "rgba(255,255,255,0.9)" : "#3c4043",
                    fontSize: 15, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                    marginBottom: 16
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>
            )}

            {/* ── STEP: SIGNUP ── */}
            {step === "signup" && (
              <form onSubmit={handleSignupOrLoginSubmit}>
                <button type="button" onClick={() => setStep("entry")} style={{ background: "none", border: "none", color: dark ? "#a78bfa" : "#7c3aed", cursor: "pointer", padding: 0, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>← Back</button>
                <p style={{ margin: "0 0 16px", fontSize: "clamp(17px,2.5vw,22px)", fontWeight: 800, color: dark ? "#fff" : "#1e1b4b" }}>
                  Create Account
                </p>
                <input type="text" placeholder="Username (e.g. alex_123)" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} required minLength={3} />
                <input type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required minLength={8} />
                <button type="submit" style={btnStyle} disabled={loading}>{loading ? "Sending OTP..." : "Create Account"}</button>
              </form>
            )}

            {/* ── STEP: LOGIN ── */}
            {step === "login" && (
              <form onSubmit={handleSignupOrLoginSubmit}>
                <button type="button" onClick={() => setStep("entry")} style={{ background: "none", border: "none", color: dark ? "#a78bfa" : "#7c3aed", cursor: "pointer", padding: 0, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>← Back</button>
                <p style={{ margin: "0 0 16px", fontSize: "clamp(17px,2.5vw,22px)", fontWeight: 800, color: dark ? "#fff" : "#1e1b4b" }}>
                  Welcome back
                </p>
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
                <div style={{ textAlign: "right", marginBottom: 16 }}>
                  <button type="button" onClick={handleForgotPassword} disabled={loading} style={{ background: "none", border: "none", color: dark ? "#a78bfa" : "#7c3aed", cursor: loading ? "not-allowed" : "pointer", fontSize: 12, padding: 0, opacity: loading ? 0.5 : 1 }}>{loading ? "Sending link..." : "Forgot Password?"}</button>
                </div>
                <button type="submit" style={btnStyle} disabled={loading}>{loading ? "Checking..." : "Sign In"}</button>
              </form>
            )}

            {/* ── STEP: FORGOT SUCCESS ── */}
            {step === "forgot-success" && (
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 16px", fontSize: "clamp(17px,2.5vw,22px)", fontWeight: 800, color: dark ? "#fff" : "#1e1b4b" }}>
                  Check your email
                </p>
                <p style={{ margin: "0 0 24px", fontSize: 14, color: dark ? "rgba(255,255,255,0.6)" : "#5b5687", lineHeight: 1.5 }}>
                  We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  style={btnStyle}
                >
                  Back to Login
                </button>
              </div>
            )}

            {/* ── STEP: OTP ── */}

            {step === "otp" && (
              <div>
                <button type="button" onClick={() => setStep("entry")} style={{ background: "none", border: "none", color: dark ? "#a78bfa" : "#7c3aed", cursor: "pointer", padding: 0, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>← Cancel</button>
                <p style={{ margin: "0 0 8px", fontSize: "clamp(17px,2.5vw,22px)", fontWeight: 800, color: dark ? "#fff" : "#1e1b4b", textAlign: "center" }}>
                  Enter Verification Code
                </p>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: dark ? "rgba(255,255,255,0.5)" : "#5b5687", textAlign: "center" }}>
                  Sent to {email}
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }} onPaste={handleOtpPaste}>
                  {otpArr.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      style={{
                        width: 40, height: 48, textAlign: "center", fontSize: 20, fontWeight: 700,
                        borderRadius: 10, border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
                        background: dark ? "rgba(255,255,255,0.05)" : "#fff", color: dark ? "#fff" : "#1e1b4b",
                        outline: "none"
                      }}
                    />
                  ))}
                </div>
                {loading && <p style={{ textAlign: "center", fontSize: 13, color: dark ? "#a78bfa" : "#7c3aed", margin: "0 0 16px" }}>Verifying...</p>}
              </div>
            )}

            {/* Developer Console card */}
            <button
              onClick={openAbout}
              style={{
                width:          "100%",
                padding:        "clamp(10px,1.5vw,13px) 14px",
                borderRadius:   12,
                background:     dark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.04)",
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
              onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.04)"}
            >
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#6d28d9,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0 }}>KK</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 700, color: dark ? "rgba(255,255,255,0.88)" : "#1e1b4b" }}>Khushneet Kaur</p>
                <p style={{ margin: 0, fontSize: 10, color: dark ? "rgba(255,255,255,0.38)" : "#a09bbf" }}>CSE · GZSCCET · MRSPTU</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 6, padding: "4px 8px", flexShrink: 0 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", animation: "consolePulse 1.2s step-end infinite", boxShadow: "0 0 5px #10b981" }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: "#10b981", fontFamily: "monospace", letterSpacing: 0.4 }}>CONSOLE</span>
              </div>
            </button>
            <p style={{ textAlign: "center", fontSize: "clamp(8px,1.1vw,10px)", color: dark ? "rgba(255,255,255,0.16)" : "#c4bfd8", margin: 0 }}>
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