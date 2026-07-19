import { useState } from "react";
import AboutModal from "../pages/login/AboutModal";
import { useAppData } from "../context/AppDataContext";
import { BRANCHES } from "../data/branches";
import MRSPTULogo from "./MRSPTULogo";
import { TABS } from "../utils/constants";
import UsernameSetupModal from "./UsernameSetupModal";

export default function NavBar() {
 const {
  dark, toggleDark,
  user, setUser, logout,
  saveMsg, totalBacklogs, cgpa,
  branch, setBranch,
  tab, setTab,
  screen, setScreen,
  lbOptIn,
  c, btn, inp, scoreClr,
} = useAppData();

  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const showSecondBar = screen === "app" && !!branch;
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showAbout,        setShowAbout]        = useState(false);
const [showProfileSheet, setShowProfileSheet] = useState(false);
const [mobileBranchOpen, setMobileBranchOpen] = useState(false);

  return (
    <header style={{
      position:  "sticky",
      top:       0,
      zIndex:    100,
    }}>

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div style={{
        background: dark
          ? "rgba(13,14,26,0.85)"
          : "rgba(255,255,255,0.85)",
        backdropFilter:         "blur(16px)",
        WebkitBackdropFilter:   "blur(16px)",
        borderBottom: `1px solid ${dark
          ? "rgba(129,140,248,0.15)"
          : "rgba(109,40,217,0.1)"}`,
      }}>
        <div
          className="navbar-top-grid"
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            height: 56,
            padding: "0 1.25rem",
            gap: 18,
          }}
        >

          {/* ── Brand ─────────────────────────────────────────────── */}
          <div style={{
            display:    "flex",
            alignItems: "center",
            gap:        10,
            justifySelf: "start",
            minWidth:   0,
          }}>
            {/* Logo circle — replaces the old SVG maroon logo */}
            <MRSPTULogo size={36} />
            

            <div style={{ minWidth: 0 }}>
              <p style={{
                margin:      0,
                fontSize:    13,
                fontWeight:  700,
                color:       c.text,
                lineHeight:  1.2,
                whiteSpace:  "nowrap",
                overflow:    "hidden",
                textOverflow:"ellipsis",
              }}>
                MRSPTU Bathinda
              </p>
              <p
                className="navbar-brand-subtitle"
                style={{
                  margin:    0,
                  fontSize:  10,
                  color:     c.sub,
                  lineHeight:1.2,
                }}
              >
                B.Tech CGPA Calculator
              </p>
            </div>
          </div>

          <div
            className="navbar-center-pills"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {/* ── Live CGPA pill ────────────────────────────────────── */}
            {cgpa && (
              <div style={{
                display:      "flex",
                alignItems:   "center",
                gap:          8,
                background:   dark
                  ? "rgba(129,140,248,0.12)"
                  : "rgba(109,40,217,0.07)",
                border:       `1px solid ${dark
                  ? "rgba(129,140,248,0.25)"
                  : "rgba(109,40,217,0.15)"}`,
                borderRadius: 99,
                padding:      "5px 14px",
              }}>
                <div style={{
                  width:        6,
                  height:       6,
                  borderRadius: "50%",
                  background:   scoreClr(cgpa),
                  flexShrink:   0,
                }} />
                <span style={{
                  fontSize:   11,
                  color:      c.sub,
                  fontWeight: 500,
                }}>
                  CGPA
                </span>
                <span style={{
                  fontSize:      16,
                  fontWeight:    800,
                  color:         scoreClr(cgpa),
                  letterSpacing: -0.3,
                }}>
                  {cgpa}
                </span>
                <span style={{
                  fontSize:    10,
                  color:       c.muted,
                  borderLeft:  `1px solid ${c.border}`,
                  paddingLeft: 8,
                  marginLeft:  2,
                }}>
                  {(parseFloat(cgpa) * 10).toFixed(1)}%
                </span>
              </div>
            )}

            {/* ── Save flash ────────────────────────────────────────── */}
            {saveMsg && (
              <span style={{
                fontSize:     11,
                color:        c.ok,
                fontWeight:   600,
                background:   dark
                  ? "rgba(52,211,153,0.12)"
                  : "rgba(5,150,105,0.08)",
                border:       `1px solid ${dark
                  ? "rgba(52,211,153,0.25)"
                  : "rgba(5,150,105,0.2)"}`,
                borderRadius: 99,
                padding:      "3px 12px",
                whiteSpace:   "nowrap",
              }}>
                ✓ {saveMsg}
              </span>
            )}

            {/* ── Backlog badge ─────────────────────────────────────── */}
            {totalBacklogs > 0 && (
              <button
                onClick={() => setTab("backlogs")}
                style={{
                  fontSize:     11,
                  fontWeight:   600,
                  color:        c.bad,
                  background:   dark
                    ? "rgba(248,113,113,0.12)"
                    : "rgba(220,38,38,0.07)",
                  border:       `1px solid ${dark
                    ? "rgba(248,113,113,0.25)"
                    : "rgba(220,38,38,0.2)"}`,
                  borderRadius: 99,
                  padding:      "3px 12px",
                  cursor:       "pointer",
                  whiteSpace:   "nowrap",
                }}
              >
                ⚠ {totalBacklogs} backlog{totalBacklogs > 1 ? "s" : ""}
              </button>
            )}

          </div>


         <div style={{
  display:        "flex",
  alignItems:     "center",
  justifyContent: "flex-end",
  gap:            8,
}}>

  {/* Dark toggle */}
  <button
    type="button"
    onClick={e => { e.currentTarget.blur(); toggleDark(); }}
    style={{
      width: 32, height: 32,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: c.hover, border: `1px solid ${c.border}`,
      borderRadius: 8, color: c.sub, fontSize: 15,
      cursor: "pointer", flexShrink: 0, transition: "all 0.2s", outline: "none",
    }}
  >
    {dark ? "☀" : "☾"}
  </button>

  {/* ── Desktop user area ───────────────────────────────── */}
  <div className="navbar-desktop-user" style={{ position: "relative" }}>
    <button
      onClick={() => setShowAvatarMenu(v => !v)}
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          8,
        background:   c.hover,
        border:       `1px solid ${showAvatarMenu ? c.accent : c.border}`,
        borderRadius: 99,
        padding:      "4px 12px 4px 4px",
        cursor:       "pointer",
        fontFamily:   "inherit",
        transition:   "all 0.2s",
      }}
    >
      <div style={{
        width:          26, height: 26, borderRadius: "50%",
        background:     "linear-gradient(135deg,#6d28d9,#a78bfa)",
        display:        "flex", alignItems: "center", justifyContent: "center",
        fontSize:       11, fontWeight: 700, color: "#fff", flexShrink: 0,
      }}>
        {user?.username?.[0]?.toUpperCase() || "?"}
      </div>
      <span className="navbar-username-text" style={{
        fontSize: 12, color: c.text, fontWeight: 500,
        maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {user?.username}
      </span>
      <span style={{ fontSize: 9, color: c.muted }}>▾</span>
    </button>

    {/* ── Desktop dropdown ──────────────────────────────── */}
    {showAvatarMenu && (
      <>
        <div onClick={() => setShowAvatarMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 148 }} />
        <div style={{
          position:     "absolute",
          top:          "calc(100% + 8px)",
          right:        0,
          zIndex:       149,
          background:   dark ? "#0f1424" : "#fff",
          border:       `1px solid ${c.border}`,
          borderRadius: 16,
          boxShadow:    dark
            ? "0 16px 48px rgba(0,0,0,0.5)"
            : "0 16px 48px rgba(109,40,217,0.12)",
          minWidth:     260,
          overflow:     "hidden",
          animation:    "scaleIn 0.15s ease both",
        }}>

          {/* Header */}
          <div style={{
            padding:      "16px",
            borderBottom: `1px solid ${c.border}`,
            background:   dark ? "rgba(255,255,255,0.02)" : "rgba(109,40,217,0.02)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width:          44, height: 44, borderRadius: "50%",
                background:     "linear-gradient(135deg,#6d28d9,#a78bfa)",
                display:        "flex", alignItems: "center", justifyContent: "center",
                fontSize:       17, fontWeight: 900, color: "#fff", flexShrink: 0,
                boxShadow:      "0 4px 12px rgba(109,40,217,0.35)",
              }}>
                {user?.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  margin: 0, fontSize: 14, fontWeight: 800, color: c.text,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {user?.username}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: c.sub }}>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* CGPA stat */}
            {cgpa && (
              <div style={{
                marginTop:    10,
                padding:      "8px 10px",
                borderRadius: 8,
                background:   dark ? "rgba(45,212,170,0.08)" : "rgba(5,150,105,0.06)",
                border:       `1px solid ${dark ? "rgba(45,212,170,0.2)" : "rgba(5,150,105,0.15)"}`,
                display:      "flex",
                alignItems:   "center",
                justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 11, color: c.muted }}>Current CGPA</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: scoreClr(cgpa) }}>
                  {cgpa}
                </span>
              </div>
            )}
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px" }}>

            {/* Change username */}
            {(() => {
              const daysLeft = user?.usernameSetAt
                ? Math.max(0, 30 - Math.floor(
                    (Date.now() - new Date(user.usernameSetAt).getTime()) / 86400000
                  ))
                : 0;
              return (
                <button
                  onClick={() => { setShowAvatarMenu(false); setShowUsernameModal(true); }}
                  disabled={daysLeft > 0}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: 10, padding: "10px 10px", border: "none",
                    background: "transparent", cursor: daysLeft > 0 ? "not-allowed" : "pointer",
                    fontFamily: "inherit", borderRadius: 9, transition: "background 0.15s",
                    opacity: daysLeft > 0 ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (!daysLeft) e.currentTarget.style.background = c.hover; }}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 16 }}>✏️</span>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: c.text }}>
                      Change Username
                    </p>
                    {daysLeft > 0 && (
                      <p style={{ margin: 0, fontSize: 10, color: c.muted }}>
                        Available in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>
                </button>
              );
            })()}

            {/* Leaderboard status */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>🏆</span>
                <p style={{ margin: 0, fontSize: 13, color: c.text }}>Leaderboard</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                background: lbOptIn
                  ? dark ? "rgba(45,212,170,0.12)" : "rgba(5,150,105,0.08)"
                  : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                color: lbOptIn ? c.ok : c.muted,
              }}>
                {lbOptIn ? "Opted in" : "Private"}
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: c.border, margin: "4px 0" }} />

            {/* Developer Console */}
            <button
              onClick={() => { setShowAvatarMenu(false); setShowAbout(true); }}
              style={{
                width:        "100%",
                display:      "flex",
                alignItems:   "center",
                gap:          10,
                padding:      "10px 10px",
                border:       "1px solid rgba(16,185,129,0.25)",
                borderRadius: 9,
                background:   "rgba(16,185,129,0.05)",
                cursor:       "pointer",
                fontFamily:   "monospace",
                transition:   "all 0.2s",
                animation:    "termGlow 3s ease-in-out infinite",
                margin:       "4px 0",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(16,185,129,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(16,185,129,0.05)";
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#10b981", flexShrink: 0,
                animation: "consolePulse 1.2s step-end infinite",
                boxShadow: "0 0 5px #10b981",
              }} />
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#10b981" }}>
                  [ Developer Console ]
                </p>
                <p style={{ margin: 0, fontSize: 9, color: "rgba(16,185,129,0.6)" }}>
                  meet the architect · GitHub · LinkedIn
                </p>
              </div>
            </button>

            {/* Divider */}
            <div style={{ height: 1, background: c.border, margin: "4px 0" }} />

            {/* Sign out */}
            <button
              onClick={() => { setShowAvatarMenu(false); logout(); setScreen("login"); }}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: 10, padding: "10px 10px", border: "none",
                background: "transparent", cursor: "pointer",
                fontFamily: "inherit", borderRadius: 9, transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${c.bad}14`}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 16 }}>→</span>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: c.bad }}>
                Sign out
              </p>
            </button>
          </div>
        </div>
      </>
    )}
  </div>

  {/* ── Mobile avatar button ─────────────────────────────── */}
  <div className="navbar-mobile-user" style={{ position: "relative" }}>
    <button
      onClick={() => setShowProfileSheet(true)}
      style={{
        width:          34, height: 34, borderRadius: "50%",
        background:     "linear-gradient(135deg,#6d28d9,#a78bfa)",
        border:         "2px solid transparent",
        display:        "flex", alignItems: "center", justifyContent: "center",
        fontSize:       13, fontWeight: 700, color: "#fff",
        cursor:         "pointer", flexShrink: 0, transition: "all 0.2s",
      }}
    >
      {user?.username?.[0]?.toUpperCase() || "?"}
    </button>
  </div>
</div>

      </div>
</div>

{/* ── Mobile profile bottom sheet ─────────────────────── */}
{showProfileSheet && (
  <>
    {/* Backdrop */}
    <div
      onClick={() => { setShowProfileSheet(false); setMobileBranchOpen(false); }}
      style={{
        position: "fixed", inset: 0, zIndex: 198,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
    />

    {/* Sheet */}
    <div style={{
      position:             "fixed",
      bottom:               0, left: 0, right: 0,
      zIndex:               199,
      background:           dark ? "#0f1424" : "#fff",
      borderRadius:         "20px 20px 0 0",
      border:               `1px solid ${c.border}`,
      borderBottom:         "none",
      maxHeight:            "85vh",
      overflowY:            "auto",
      scrollbarWidth:       "none",
      boxShadow:            dark
        ? "0 -16px 48px rgba(0,0,0,0.55)"
        : "0 -16px 48px rgba(109,40,217,0.12)",
      animation:            "slideUp 0.3s ease both",
      paddingBottom:        "env(safe-area-inset-bottom)",
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

      {/* Handle */}
      <div style={{
        width: 40, height: 4, borderRadius: 99,
        background: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
        margin: "10px auto 0",
      }} />

      {/* Header */}
      <div style={{
        padding:      "16px 20px",
        borderBottom: `1px solid ${c.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width:          52, height: 52, borderRadius: "50%",
            background:     "linear-gradient(135deg,#6d28d9,#a78bfa)",
            display:        "flex", alignItems: "center", justifyContent: "center",
            fontSize:       20, fontWeight: 900, color: "#fff", flexShrink: 0,
            boxShadow:      "0 6px 16px rgba(109,40,217,0.4)",
          }}>
            {user?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              margin: 0, fontSize: 17, fontWeight: 800, color: c.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.username}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: c.sub }}>
              {user?.email}
            </p>
          </div>
          {cgpa && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 9, color: c.muted, textTransform: "uppercase" }}>CGPA</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: scoreClr(cgpa) }}>
                {cgpa}
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "8px 12px" }}>

        {/* Branch switcher */}
        <p style={{
          margin: "8px 0 6px 4px", fontSize: 10, fontWeight: 700,
          color: c.muted, textTransform: "uppercase", letterSpacing: 0.8,
        }}>
          Current Branch
        </p>
        <button
          onClick={() => setMobileBranchOpen(v => !v)}
          style={{
            width:        "100%",
            display:      "flex",
            alignItems:   "center",
            gap:          10,
            padding:      "11px 14px",
            borderRadius: 10,
            border:       `1px solid ${mobileBranchOpen ? c.accent : c.border}`,
            background:   mobileBranchOpen ? `${c.accent}10` : c.hover,
            cursor:       "pointer",
            fontFamily:   "inherit",
            transition:   "all 0.15s",
            marginBottom: 4,
          }}
        >
          <span style={{
            width: 10, height: 10, borderRadius: "50%",
            background: BRANCHES[branch]?.color || c.accent, flexShrink: 0,
            boxShadow: `0 0 6px ${BRANCHES[branch]?.color || c.accent}88`,
          }} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: c.text, textAlign: "left" }}>
            {BRANCHES[branch]?.name || "Select Branch"}
          </span>
          <span style={{ fontSize: 10, color: c.muted }}>
            {mobileBranchOpen ? "▴" : "▾"}
          </span>
        </button>

        {mobileBranchOpen && (
          <div style={{
            borderRadius: 10, border: `1px solid ${c.border}`,
            background: c.card, overflow: "hidden", marginBottom: 4,
          }}>
            {Object.entries(BRANCHES).map(([key, b]) => {
              const isActive = branch === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setBranch(key);
                    setMobileBranchOpen(false);
                    setShowProfileSheet(false);
                  }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: 10, padding: "10px 14px", border: "none",
                    background: isActive
                      ? dark ? "rgba(129,140,248,0.15)" : "rgba(109,40,217,0.07)"
                      : "transparent",
                    cursor: "pointer", fontFamily: "inherit", transition: "background 0.1s",
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", background: b.color, flexShrink: 0,
                    boxShadow: isActive ? `0 0 6px ${b.color}88` : "none",
                  }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 400,
                    color: isActive ? c.accent : c.text, textAlign: "left" }}>
                    {b.short}
                  </span>
                  <span style={{ fontSize: 11, color: c.muted }}>{b.name.split("(")[0].trim()}</span>
                  {isActive && <span style={{ fontSize: 12, color: c.accent }}>✓</span>}
                </button>
              );
            })}
            <button
              onClick={() => { setBranch(null); setMobileBranchOpen(false); setShowProfileSheet(false); }}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: 10, padding: "10px 14px", border: "none", borderTop: `1px solid ${c.border}`,
                background: "transparent", cursor: "pointer", fontFamily: "inherit",
                fontSize: 12, color: c.sub,
              }}
            >
              ← Back to branch picker
            </button>
          </div>
        )}

        {/* Username change */}
        {(() => {
          const daysLeft = user?.usernameSetAt
            ? Math.max(0, 30 - Math.floor(
                (Date.now() - new Date(user.usernameSetAt).getTime()) / 86400000
              ))
            : 0;
          return (
            <button
              onClick={() => { setShowProfileSheet(false); setShowUsernameModal(true); }}
              disabled={daysLeft > 0}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 14px", borderRadius: 10,
                border: `1px solid ${c.border}`, background: c.hover,
                cursor: daysLeft > 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit", marginBottom: 4, opacity: daysLeft > 0 ? 0.5 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>✏️</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: c.text }}>
                    Change Username
                  </p>
                  {daysLeft > 0 && (
                    <p style={{ margin: 0, fontSize: 10, color: c.muted }}>
                      Available in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 10, color: c.muted }}>@{user?.username}</span>
            </button>
          );
        })()}

        {/* Leaderboard */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "13px 14px", borderRadius: 10,
          border: `1px solid ${c.border}`, background: c.hover, marginBottom: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🏆</span>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: c.text }}>
              Leaderboard
            </p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
            background: lbOptIn
              ? dark ? "rgba(45,212,170,0.12)" : "rgba(5,150,105,0.08)"
              : "transparent",
            color: lbOptIn ? c.ok : c.muted,
            border: lbOptIn ? `1px solid ${c.ok}44` : "none",
          }}>
            {lbOptIn ? "Opted in" : "Private"}
          </span>
        </div>

        {/* Developer Console */}
        <button
          onClick={() => { setShowProfileSheet(false); setShowAbout(true); }}
          style={{
            width:        "100%",
            display:      "flex",
            alignItems:   "center",
            gap:          12,
            padding:      "13px 14px",
            borderRadius: 10,
            border:       "1px solid rgba(16,185,129,0.3)",
            background:   "rgba(16,185,129,0.06)",
            cursor:       "pointer",
            fontFamily:   "monospace",
            marginBottom: 4,
            animation:    "termGlow 3s ease-in-out infinite",
            transition:   "all 0.2s",
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#10b981", flexShrink: 0,
            animation: "consolePulse 1.2s step-end infinite",
            boxShadow: "0 0 6px #10b981",
          }} />
          <div style={{ textAlign: "left" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#10b981", fontFamily: "monospace" }}>
              [ Developer Console ]
            </p>
            <p style={{ margin: 0, fontSize: 9, color: "rgba(16,185,129,0.55)", fontFamily: "sans-serif" }}>
              Khushneet Kaur · GitHub · LinkedIn
            </p>
          </div>
        </button>

        {/* Sign out */}
        <button
          onClick={() => { setShowProfileSheet(false); logout(); setScreen("login"); }}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            gap: 10, padding: "13px 14px", borderRadius: 10,
            border: `1px solid ${c.bad}33`, background: `${c.bad}08`,
            cursor: "pointer", fontFamily: "inherit", marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>→</span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: c.bad }}>
            Sign out
          </p>
        </button>
      </div>
    </div>
  </>
)}

{/* Username modal */}
{showUsernameModal && (
  <UsernameSetupModal
    dark={dark} c={c} btn={btn} inp={inp} user={user}
    onDone={updatedUser => {
      setShowUsernameModal(false);
      if (updatedUser) setUser(updatedUser);
    }}
    isChange={true}
  />
)}

{/* About modal */}
{showAbout && (
  <AboutModal onClose={() => setShowAbout(false)} dark={dark} />
)}
    </header>
  );
}