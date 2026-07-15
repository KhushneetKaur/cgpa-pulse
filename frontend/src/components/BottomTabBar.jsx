import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import { TABS } from "../utils/constants";

const CORE_TABS = ["calculator", "history", "target", "predictor"];

export default function BottomTabBar() {
  const {
    tab, setTab,
    totalBacklogs,
    screen, branch,
    c, dark,
  } = useAppData();

  const [showMore, setShowMore] = useState(false);

  if (screen !== "app" || !branch) return null;

  const coreTabs = TABS.filter(t => CORE_TABS.includes(t.key));
  const moreTabs = TABS.filter(t => !CORE_TABS.includes(t.key));
  const isMoreActive = moreTabs.some(t => t.key === tab);

  function handleTabClick(key) {
    setTab(key);
    setShowMore(false);
  }

  return (
    <>
      {/* ── More sheet backdrop ───────────────────────────────── */}
      {showMore && (
        <div
          onClick={() => setShowMore(false)}
          style={{
            position:   "fixed",
            inset:      0,
            zIndex:     148,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* ── More slide-up sheet ───────────────────────────────── */}
      <div
        className="bottom-tab-bar"
        style={{
          position:    "fixed",
          bottom:      64,
          left:        0,
          right:       0,
          zIndex:      149,
          background:  dark ? "#0f1424" : "#fff",
          borderRadius: "20px 20px 0 0",
          border:      `1px solid ${dark
            ? "rgba(129,140,248,0.2)"
            : "rgba(109,40,217,0.12)"}`,
          borderBottom: "none",
          boxShadow:   dark
            ? "0 -8px 40px rgba(0,0,0,0.5)"
            : "0 -8px 40px rgba(109,40,217,0.12)",
          transform:   showMore ? "translateY(0)" : "translateY(110%)",
          transition:  "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          padding:     "6px 0 8px",
        }}
      >
        {/* Sheet handle */}
        <div style={{
          width:        36,
          height:       4,
          borderRadius: 99,
          background:   dark
            ? "rgba(255,255,255,0.2)"
            : "rgba(0,0,0,0.15)",
          margin:       "6px auto 14px",
        }} />

        {/* Sheet title */}
        <p style={{
          margin:        "0 0 6px 20px",
          fontSize:      11,
          fontWeight:    700,
          color:         c.muted,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}>
          More
        </p>

        {/* More tabs */}
        {moreTabs.map(t => {
          const isActive  = tab === t.key;
          const showBadge = t.key === "backlogs" && totalBacklogs > 0;

          return (
            <button
              key={t.key}
              onClick={() => handleTabClick(t.key)}
              style={{
                width:          "100%",
                display:        "flex",
                alignItems:     "center",
                gap:            14,
                padding:        "13px 20px",
                border:         "none",
                background:     isActive
                  ? `${c.accent}12`
                  : "transparent",
                cursor:         "pointer",
                fontFamily:     "inherit",
                textAlign:      "left",
                transition:     "background 0.15s",
                borderLeft:     isActive
                  ? `3px solid ${c.accent}`
                  : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span style={{
                flex:       1,
                fontSize:   14,
                fontWeight: isActive ? 700 : 400,
                color:      isActive ? c.accent : c.text,
              }}>
                {t.label}
              </span>
              {showBadge && (
                <span style={{
                  background:   c.bad,
                  color:        "#fff",
                  fontSize:     10,
                  fontWeight:   700,
                  borderRadius: 99,
                  padding:      "2px 7px",
                }}>
                  {totalBacklogs}
                </span>
              )}
              {isActive && (
                <span style={{ fontSize: 13, color: c.accent }}>✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Bottom tab bar ────────────────────────────────────── */}
      <nav
        className="bottom-tab-bar"
        style={{
          position:       "fixed",
          bottom:         0,
          left:           0,
          right:          0,
          zIndex:         150,
          display:        "flex",
          alignItems:     "stretch",
          background:     dark
            ? "rgba(8,12,24,0.97)"
            : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderTop:      `1px solid ${dark
            ? "rgba(129,140,248,0.15)"
            : "rgba(109,40,217,0.1)"}`,
          paddingBottom:  "env(safe-area-inset-bottom)",
          height:         60,
        }}
      >
        {/* Core 4 tabs */}
        {coreTabs.map(t => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                setShowMore(false);
                handleTabClick(t.key);
              }}
              style={{
                flex:           1,
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                gap:            2,
                padding:        "6px 0",
                border:         "none",
                background:     "transparent",
                cursor:         "pointer",
                fontFamily:     "inherit",
                borderTop:      isActive
                  ? `2px solid ${c.accent}`
                  : "2px solid transparent",
                transition:     "all 0.15s",
              }}
            >
              <span style={{
                fontSize:   isActive ? 20 : 18,
                transition: "all 0.15s",
              }}>
                {t.icon}
              </span>
              <span style={{
                fontSize:      9,
                fontWeight:    isActive ? 700 : 400,
                color:         isActive ? c.accent : c.muted,
                letterSpacing: 0.3,
                textTransform: "uppercase",
              }}>
                {t.label}
              </span>
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setShowMore(v => !v)}
          style={{
            flex:           1,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            2,
            padding:        "6px 0",
            border:         "none",
            background:     "transparent",
            cursor:         "pointer",
            fontFamily:     "inherit",
            position:       "relative",
            borderTop:      (showMore || isMoreActive)
              ? `2px solid ${c.accent}`
              : "2px solid transparent",
            transition:     "all 0.15s",
          }}
        >
          {/* Dot indicator when a more-tab is active */}
          {isMoreActive && !showMore && (
            <span style={{
              position:     "absolute",
              top:          6,
              right:        "calc(50% - 14px)",
              width:        6,
              height:       6,
              borderRadius: "50%",
              background:   c.accent,
            }} />
          )}

          {/* Animated hamburger → X */}
          <div style={{
            display:        "flex",
            flexDirection:  "column",
            gap:            4,
            alignItems:     "center",
            justifyContent: "center",
            width:          20,
            height:         20,
            position:       "relative",
          }}>
            {showMore ? (
              <span style={{
                fontSize:   18,
                color:      c.accent,
                lineHeight: 1,
                fontWeight: 700,
              }}>✕</span>
            ) : (
              <>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width:        i === 1 ? 12 : 18,
                    height:       2,
                    borderRadius: 99,
                    background:   isMoreActive ? c.accent : c.muted,
                    transition:   "all 0.2s",
                  }} />
                ))}
              </>
            )}
          </div>

          <span style={{
            fontSize:      9,
            fontWeight:    (showMore || isMoreActive) ? 700 : 400,
            color:         (showMore || isMoreActive) ? c.accent : c.muted,
            letterSpacing: 0.3,
            textTransform: "uppercase",
          }}>
            More
          </span>
        </button>
      </nav>
    </>
  );
}