import { useEffect, useState } from "react";
import { useAppData } from "../../context/AppDataContext";

// ── Mock dashboard preview ────────────────────────────────────────────────────
function MockDashboard({ dark }) {
  const subjects = [
    { name: "Data Structures", int: 38, ext: 56, grade: "A+", gp: 10, type: "TH" },
    { name: "Operating Systems", int: 35, ext: 52, grade: "A",  gp: 9,  type: "TH" },
    { name: "DBMS",             int: 40, ext: 58, grade: "A+", gp: 10, type: "TH" },
    { name: "Computer Networks",int: 33, ext: 49, grade: "B+", gp: 8,  type: "TH" },
    { name: "DS Lab",           int: 55, ext: 38, grade: "A+", gp: 10, type: "LAB" },
    { name: "OS Lab",           int: 52, ext: 35, grade: "A",  gp: 9,  type: "LAB" },
  ];

  const gradeColor = (gp) => {
    if (gp >= 10) return "#2dd4aa";
    if (gp >= 9)  return "#7c83f5";
    if (gp >= 8)  return "#a78bfa";
    return "#94a3b8";
  };

  return (
    <div style={{
      padding:       "12px",
      width:         "100%",
      boxSizing:     "border-box",
      fontFamily:    "inherit",
    }}>

      {/* Top strip - CGPA summary */}
      <div style={{
        display:      "flex",
        background:   dark ? "#0f1424" : "#fff",
        borderRadius: 10,
        overflow:     "hidden",
        marginBottom: 10,
        border:       `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`,
      }}>
        {[
          { label: "CGPA",      value: "9.24", color: "#2dd4aa" },
          { label: "Sems",      value: "5/8",  color: "#7c83f5" },
          { label: "Backlogs",  value: "None", color: "#2dd4aa" },
          { label: "Live SGPA", value: "9.41", color: "#2dd4aa" },
        ].map((s, i) => (
          <div key={s.label} style={{
            flex:        1,
            padding:     "8px 6px",
            borderRight: i < 3
              ? `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`
              : "none",
            textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 7, color: dark ? "#4a5070" : "#a09bbf", textTransform: "uppercase", letterSpacing: 0.3 }}>
              {s.label}
            </p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Semester pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "hidden" }}>
        {["Sem 1","Sem 2","Sem 3","Sem 4","Sem 5"].map((s, i) => (
          <div key={s} style={{
            padding:      "4px 10px",
            borderRadius: 99,
            fontSize:     10,
            fontWeight:   i === 4 ? 700 : 400,
            background:   i === 4
              ? "rgba(124,131,245,0.2)"
              : dark ? "#0f1424" : "#fff",
            border:       `1px solid ${i === 4
              ? "#7c83f5"
              : dark ? "#1e2540" : "#e4e2f0"}`,
            color:        i === 4
              ? "#7c83f5"
              : dark ? "#4a5070" : "#a09bbf",
            flexShrink:   0,
          }}>
            {s}
          </div>
        ))}
      </div>

      {/* Subject grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 6,
      }}>
        {subjects.map(sub => (
          <div key={sub.name} style={{
            padding:      "8px 10px",
            borderRadius: 8,
            background:   dark ? "#0f1424" : "#fff",
            border:       `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <span style={{
                fontSize:     7,
                fontWeight:   700,
                color:        sub.type === "LAB" ? "#2dd4aa" : "#7c83f5",
                background:   sub.type === "LAB"
                  ? "rgba(45,212,170,0.12)"
                  : "rgba(124,131,245,0.12)",
                borderRadius: 3,
                padding:      "1px 4px",
              }}>
                {sub.type}
              </span>
              <p style={{
                margin:       0,
                fontSize:     9,
                color:        dark ? "#8b90b8" : "#5b5687",
                overflow:     "hidden",
                textOverflow: "ellipsis",
                whiteSpace:   "nowrap",
                flex:         1,
              }}>
                {sub.name}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontSize:   16,
                fontWeight: 800,
                color:      gradeColor(sub.gp),
              }}>
                {sub.int + sub.ext}
              </span>
              <span style={{
                fontSize:   11,
                fontWeight: 700,
                color:      gradeColor(sub.gp),
              }}>
                {sub.grade}
              </span>
              <span style={{ fontSize: 9, color: dark ? "#4a5070" : "#a09bbf", marginLeft: "auto" }}>
                {sub.gp} pts
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom dock preview */}
      <div style={{
        marginTop:    10,
        padding:      "10px 12px",
        borderRadius: 12,
        background:   dark ? "#0f1424" : "#fff",
        border:       `1px solid rgba(124,131,245,0.4)`,
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 3px", fontSize: 8, color: dark ? "#4a5070" : "#a09bbf", fontWeight: 600 }}>INTERNAL</p>
            <div style={{
              padding:      "6px",
              borderRadius: 8,
              border:       "1.5px solid rgba(124,131,245,0.4)",
              background:   dark ? "rgba(255,255,255,0.04)" : "#f4f3ff",
              textAlign:    "center",
              fontSize:     14,
              fontWeight:   700,
              color:        dark ? "#eceef8" : "#1e1b4b",
            }}>
              38
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 3px", fontSize: 8, color: dark ? "#4a5070" : "#a09bbf", fontWeight: 600 }}>EXTERNAL</p>
            <div style={{
              padding:      "6px",
              borderRadius: 8,
              border:       "1.5px solid rgba(124,131,245,0.4)",
              background:   dark ? "rgba(255,255,255,0.04)" : "#f4f3ff",
              textAlign:    "center",
              fontSize:     14,
              fontWeight:   700,
              color:        dark ? "#eceef8" : "#1e1b4b",
            }}>
              56
            </div>
          </div>
          <div style={{
            flex:           1,
            display:        "flex",
            flexDirection:  "column",
            justifyContent: "flex-end",
          }}>
            <div style={{
              padding:        "6px",
              borderRadius:   8,
              background:     "rgba(45,212,170,0.15)",
              textAlign:      "center",
              fontSize:       14,
              fontWeight:     800,
              color:          "#2dd4aa",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            4,
              marginTop:      "auto",
            }}>
              94 <span style={{ fontSize: 10 }}>A+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main mobile login drawer ──────────────────────────────────────────────────
export default function MobileLoginDrawer({ handleGoogleLogin, dark }) {
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawerVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position:  "fixed",
      inset:     0,
      overflow:  "hidden",
    }}>

      {/* ── Blurred dashboard preview ─────────────────────────── */}
      <div style={{
        position:   "absolute",
        inset:      0,
        background: dark ? "#080c18" : "#f4f3ff",
        overflow:   "hidden",
      }}>
        {/* Gradient overlay top — branding zone */}
        <div style={{
          position:   "absolute",
          top:        0,
          left:       0,
          right:      0,
          height:     "55%",
          background: dark
            ? "linear-gradient(180deg, rgba(8,12,24,0.95) 0%, rgba(8,12,24,0.4) 100%)"
            : "linear-gradient(180deg, rgba(244,243,255,0.95) 0%, rgba(244,243,255,0.4) 100%)",
          zIndex:     2,
          pointerEvents: "none",
        }} />

        {/* Blurred mock content */}
        <div style={{
          position:  "absolute",
          top:       "30%",
          left:      0,
          right:     0,
          bottom:    0,
          filter:    "blur(2px)",
          opacity:   dark ? 0.6 : 0.7,
          zIndex:    1,
          transform: "scale(1.02)",
        }}>
          <MockDashboard dark={dark} />
        </div>
      </div>

      {/* ── Top branding zone ─────────────────────────────────── */}
      <div style={{
        position:       "absolute",
        top:            0,
        left:           0,
        right:          0,
        height:         "58%",
        zIndex:         10,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "0 24px",
        textAlign:      "center",
      }}>
        {/* CGPA PULSE */}
        <div style={{ marginBottom: 12 }}>
          <h1 style={{
            margin:        0,
            fontSize:      "clamp(38px,10vw,56px)",
            fontWeight:    900,
            letterSpacing: -2,
            lineHeight:    1,
            color:         dark ? "rgba(255,255,255,0.93)" : "#1e1b4b",
          }}>
            CGPA
          </h1>
          <h1 style={{
            margin:        "2px 0 0",
            fontSize:      "clamp(38px,10vw,56px)",
            fontWeight:    900,
            fontStyle:     "italic",
            letterSpacing: -2,
            lineHeight:    1,
            background:    dark
              ? "linear-gradient(135deg,#c084fc,#67e8f9)"
              : "linear-gradient(135deg,#7c3aed,#10b981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip:      "text",
          }}>
            PULSE
          </h1>
        </div>

        <p style={{
          margin:   "0 0 6px",
          fontSize: 13,
          color:    dark ? "rgba(255,255,255,0.5)" : "#5b5687",
          lineHeight: 1.5,
        }}>
          Your CGPA. Tracked. Predicted. Owned.
        </p>

        <p style={{
          margin:     0,
          fontSize:   11,
          color:      dark ? "rgba(255,255,255,0.3)" : "#a09bbf",
          fontWeight: 500,
        }}>
          MRSPTU Bathinda · 6 Branches · Free forever
        </p>
      </div>

      {/* ── Bottom drawer ─────────────────────────────────────── */}
      <div style={{
        position:             "absolute",
        bottom:               0,
        left:                 0,
        right:                0,
        zIndex:               20,
        background:           dark
          ? "rgba(13,14,26,0.92)"
          : "rgba(255,255,255,0.92)",
        backdropFilter:       "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderRadius:         "24px 24px 0 0",
        border:               `1px solid ${dark
          ? "rgba(167,139,250,0.2)"
          : "rgba(124,58,237,0.12)"}`,
        borderBottom:         "none",
        padding:              "10px 24px 40px",
        boxShadow:            dark
          ? "0 -20px 60px rgba(0,0,0,0.6)"
          : "0 -20px 60px rgba(109,40,217,0.12)",
        transform:   drawerVisible ? "translateY(0)" : "translateY(100%)",
        transition:  "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* Drag handle */}
        <div style={{
          width:        40,
          height:       4,
          borderRadius: 99,
          background:   dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)",
          margin:       "0 auto 20px",
        }} />

        {/* Headline */}
        <p style={{
          margin:     "0 0 4px",
          fontSize:   18,
          fontWeight: 800,
          color:      dark ? "rgba(255,255,255,0.92)" : "#1e1b4b",
          textAlign:  "center",
        }}>
          Sign in to get started
        </p>
        <p style={{
          margin:     "0 0 20px",
          fontSize:   12,
          color:      dark ? "rgba(255,255,255,0.4)" : "#a09bbf",
          textAlign:  "center",
        }}>
          Your grades, saved securely to your account
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
              ? "rgba(255,255,255,0.15)"
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
            boxShadow:      dark
              ? "none"
              : "0 2px 8px rgba(0,0,0,0.08)",
            marginBottom:   16,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = dark
              ? "rgba(255,255,255,0.14)"
              : "#f8f9fa";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = dark
              ? "rgba(255,255,255,0.08)"
              : "#fff";
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

        {/* Developer credit */}
        <div style={{
          textAlign:  "center",
          padding:    "12px",
          borderRadius: 12,
          background: dark
            ? "rgba(124,131,245,0.06)"
            : "rgba(109,40,217,0.04)",
          border:     `1px solid ${dark
            ? "rgba(124,131,245,0.12)"
            : "rgba(109,40,217,0.08)"}`,
        }}>
          <p style={{
            margin:   "0 0 2px",
            fontSize: 11,
            color:    dark ? "rgba(255,255,255,0.35)" : "#a09bbf",
          }}>
            crafted with ✨ by
          </p>
          <p style={{
            margin:     0,
            fontSize:   14,
            fontWeight: 800,
            color:      dark ? "#a78bfa" : "#7c3aed",
          }}>
            Khushneet Kaur
          </p>
          <p style={{
            margin:   "2px 0 0",
            fontSize: 10,
            color:    dark ? "rgba(255,255,255,0.3)" : "#a09bbf",
          }}>
            CSE · GZSCCET · MRSPTU Bathinda
          </p>
        </div>

        {/* Disclaimer */}
        <p style={{
          textAlign:  "center",
          fontSize:   9,
          color:      dark ? "rgba(255,255,255,0.2)" : "#c4bfd8",
          marginTop:  10,
          lineHeight: 1.6,
        }}>
          Unofficial · Not affiliated with MRSPTU · Free forever
        </p>
      </div>
    </div>
  );
}