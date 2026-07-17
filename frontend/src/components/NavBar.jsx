import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import { BRANCHES } from "../data/branches";
import MRSPTULogo from "./MRSPTULogo";
import { TABS } from "../utils/constants";
import UsernameSetupModal from "./UsernameSetupModal";

export default function NavBar() {
  const {
    dark, toggleDark,
    user, setUser,logout,
    saveMsg,
    totalBacklogs,
    cgpa,
    branch, setBranch,
    tab, setTab,
    screen, setScreen,
    c, btn, inp, scoreClr,
  } = useAppData();

  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const showSecondBar = screen === "app" && !!branch;
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

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
            {/* ── Dark mode toggle ──────────────────── */}
            <button
              type="button"
              onClick={e => { e.currentTarget.blur(); toggleDark(); }}
              title={dark ? "Light mode" : "Dark mode"}
              style={{
                width:          32,
                height:         32,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                background:     c.hover,
                border:         `1px solid ${c.border}`,
                borderRadius:   8,
                color:          c.sub,
                fontSize:       15,
                cursor:         "pointer",
                flexShrink:     0,
                transition:     "all 0.2s",
                outline:        "none",
              }}
            >
              {dark ? "☀" : "☾"}
            </button>

            {/* ── Desktop: username + edit + signout ── */}
            <div
              className="navbar-desktop-user"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {/* User pill */}
              <div style={{
                display:      "flex",
                alignItems:   "center",
                gap:          8,
                background:   c.hover,
                border:       `1px solid ${c.border}`,
                borderRadius: 99,
                padding:      "4px 12px 4px 4px",
              }}>
                <div style={{
                  width:          26,
                  height:         26,
                  borderRadius:   "50%",
                  background:     "linear-gradient(135deg, #6d28d9, #a78bfa)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       11,
                  fontWeight:     700,
                  color:          "#fff",
                  flexShrink:     0,
                }}>
                  {user?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <span
                  className="navbar-username-text"
                  style={{
                    fontSize:     12,
                    color:        c.text,
                    fontWeight:   500,
                    maxWidth:     90,
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                  }}
                >
                  {user?.username}
                </span>
              </div>

              {/* Edit username button */}
              <button
                onClick={() => setShowUsernameModal(true)}
                title="Change username"
                style={{
                  background:   c.hover,
                  border:       `1px solid ${c.border}`,
                  borderRadius: 8,
                  cursor:       "pointer",
                  fontSize:     11,
                  color:        c.sub,
                  fontFamily:   "inherit",
                  padding:      "5px 8px",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          4,
                  transition:   "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = c.accent;
                  e.currentTarget.style.color       = c.accent;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = c.border;
                  e.currentTarget.style.color       = c.sub;
                }}
              >
                ✏ <span className="navbar-signout-text">Username</span>
              </button>

              {/* Sign out */}
              <button
                type="button"
                onClick={e => { e.currentTarget.blur(); logout(); setScreen("login"); }}
                style={{
                  fontSize:     12,
                  color:        c.sub,
                  background:   "transparent",
                  border:       `1px solid ${c.border}`,
                  borderRadius: 8,
                  padding:      "6px 12px",
                  cursor:       "pointer",
                  whiteSpace:   "nowrap",
                  fontFamily:   "inherit",
                  transition:   "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background  = dark
                    ? "rgba(248,113,113,0.1)" : "rgba(220,38,38,0.06)";
                  e.currentTarget.style.borderColor = c.bad;
                  e.currentTarget.style.color       = c.bad;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = "transparent";
                  e.currentTarget.style.borderColor = c.border;
                  e.currentTarget.style.color       = c.sub;
                }}
              >
                <span className="navbar-signout-text">Sign out</span>
                <span className="navbar-signout-icon-only" style={{ display: "none" }}>→</span>
              </button>
            </div>

            {/* ── Mobile: avatar button only ───────── */}
            <div className="navbar-mobile-user" style={{ position: "relative" }}>
              <button
                onClick={() => setShowAvatarMenu(v => !v)}
                style={{
                  width:          34,
                  height:         34,
                  borderRadius:   "50%",
                  background:     "linear-gradient(135deg, #6d28d9, #a78bfa)",
                  border:         `2px solid ${showAvatarMenu
                    ? c.accent
                    : "transparent"}`,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       13,
                  fontWeight:     700,
                  color:          "#fff",
                  cursor:         "pointer",
                  flexShrink:     0,
                  boxShadow:      showAvatarMenu
                    ? `0 0 0 3px ${c.accent}44`
                    : "none",
                  transition:     "all 0.2s",
                }}
              >
                {user?.username?.[0]?.toUpperCase() || "?"}
              </button>

              {/* Avatar dropdown */}
              {showAvatarMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    onClick={() => setShowAvatarMenu(false)}
                    style={{
                      position: "fixed",
                      inset:    0,
                      zIndex:   148,
                    }}
                  />

                  {/* Dropdown card */}
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
                    minWidth:     220,
                    overflow:     "hidden",
                    animation:    "scaleIn 0.15s ease both",
                  }}>

                    {/* User info header */}
                    <div style={{
                      padding:      "14px 16px 10px",
                      borderBottom: `1px solid ${c.border}`,
                    }}>
                      <div style={{
                        display:    "flex",
                        alignItems: "center",
                        gap:        10,
                      }}>
                        <div style={{
                          width:          36,
                          height:         36,
                          borderRadius:   "50%",
                          background:     "linear-gradient(135deg, #6d28d9, #a78bfa)",
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          fontSize:       15,
                          fontWeight:     700,
                          color:          "#fff",
                          flexShrink:     0,
                        }}>
                          {user?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            margin:       0,
                            fontSize:     13,
                            fontWeight:   700,
                            color:        c.text,
                            overflow:     "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace:   "nowrap",
                            maxWidth:     140,
                          }}>
                            {user?.username}
                          </p>
                          <p style={{
                            margin:   0,
                            fontSize: 10,
                            color:    c.muted,
                          }}>
                            MRSPTU Student
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Change username */}
                    <button
                      onClick={() => {
                        setShowAvatarMenu(false);
                        setShowUsernameModal(true);
                      }}
                      style={{
                        width:      "100%",
                        display:    "flex",
                        alignItems: "center",
                        gap:        12,
                        padding:    "12px 16px",
                        border:     "none",
                        background: "transparent",
                        cursor:     "pointer",
                        fontFamily: "inherit",
                        textAlign:  "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e =>
                        e.currentTarget.style.background = c.hover}
                      onMouseLeave={e =>
                        e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontSize: 16 }}>✏️</span>
                      <div>
                        <p style={{
                          margin:     0,
                          fontSize:   13,
                          fontWeight: 500,
                          color:      c.text,
                        }}>
                          Change Username
                        </p>
                        {user?.usernameSetAt && (
                          <p style={{
                            margin:   0,
                            fontSize: 10,
                            color:    c.muted,
                          }}>
                            {(() => {
                              const days = Math.max(0, 30 - Math.floor(
                                (Date.now() - new Date(user.usernameSetAt).getTime())
                                / (1000 * 60 * 60 * 24)
                              ));
                              return days > 0
                                ? `Available in ${days} day${days === 1 ? "" : "s"}`
                                : "Available now";
                            })()}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Divider */}
                    <div style={{
                      height:     1,
                      background: c.border,
                      margin:     "2px 0",
                    }} />

                    {/* Sign out */}
                    <button
                      onClick={() => {
                        setShowAvatarMenu(false);
                        logout();
                        setScreen("login");
                      }}
                      style={{
                        width:      "100%",
                        display:    "flex",
                        alignItems: "center",
                        gap:        12,
                        padding:    "12px 16px",
                        border:     "none",
                        background: "transparent",
                        cursor:     "pointer",
                        fontFamily: "inherit",
                        textAlign:  "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e =>
                        e.currentTarget.style.background = `${c.bad}14`}
                      onMouseLeave={e =>
                        e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontSize: 16 }}>⎋</span>
                      <p style={{
                        margin:     0,
                        fontSize:   13,
                        fontWeight: 500,
                        color:      c.bad,
                      }}>
                        Sign out
                      </p>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Second bar: branch + tabs ─────────────────────────────── */}
      {showSecondBar && (
        <div 
          className="navbar-second-bar"
          style={{
            background: dark
              ? "rgba(19,22,42,0.9)"
              : "rgba(248,247,255,0.9)",
            backdropFilter:       "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: `1px solid ${dark
              ? "rgba(129,140,248,0.1)"
              : "rgba(109,40,217,0.08)"}`,
          }}>
          <div
            className="navbar-second-bar-inner"
            style={{
              maxWidth:   1080,
              margin:     "0 auto",
              display:    "flex",
              alignItems: "stretch",
              padding:    "0 1.25rem",
            }}
          >

            {/* ── Branch dropdown ───────────────────────────────────── */}
            <div style={{
              position:   "relative",
              display:    "flex",
              alignItems: "center",
              flexShrink: 0,
            }}>
              <button
                className="navbar-branch-btn"
                onClick={() => setBranchMenuOpen(o => !o)}
                style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:         8,
                  padding:     "0 16px 0 12px",
                  height:      44,
                  background:  "transparent",
                  border:      "none",
                  borderRight: `1px solid ${c.border}`,
                  cursor:      "pointer",
                  color:       c.text,
                  fontSize:    13,
                  fontWeight:  600,
                  fontFamily:  "inherit",
                  whiteSpace:  "nowrap",
                  transition:  "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = c.hover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Branch colour dot */}
                <span style={{
                  width:        8,
                  height:       8,
                  borderRadius: "50%",
                  background:   BRANCHES[branch]?.color || c.accent,
                  flexShrink:   0,
                  boxShadow:    `0 0 6px ${BRANCHES[branch]?.color || c.accent}88`,
                }} />
                {BRANCHES[branch]?.short}
                <span style={{
                  fontSize:   9,
                  color:      c.muted,
                  marginLeft: 2,
                }}>
                  ▾
                </span>
              </button>

              {/* ── Branch dropdown menu ─────────────────────────────── */}
              {branchMenuOpen && (
                <>
                  {/* Click-outside backdrop */}
                  <div
                    onClick={() => setBranchMenuOpen(o => !o)}
                    style={{
                      position: "fixed",
                      inset:    0,
                      zIndex:   99,
                    }}
                  />
                  <div style={{
                    position:     "absolute",
                    top:          "calc(100% + 6px)",
                    left:         0,
                    zIndex:       200,
                    background:   c.card,
                    border:       `1px solid ${c.border}`,
                    borderRadius: 14,
                    boxShadow:    dark
                      ? "0 16px 48px rgba(0,0,0,0.5)"
                      : "0 16px 48px rgba(109,40,217,0.12)",
                    minWidth:     240,
                    overflow:     "hidden",
                    padding:      "6px",
                  }}>
                    {/* Dropdown heading */}
                    <p style={{
                      margin:        "6px 10px 6px",
                      fontSize:      10,
                      color:         c.muted,
                      fontWeight:    600,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}>
                      Switch Branch
                    </p>

                    {Object.entries(BRANCHES).map(([key, b]) => {
                      const isActive = branch === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setBranch(key);
                            setBranchMenuOpen(false);
                          }}
                          style={{
                            width:        "100%",
                            display:      "flex",
                            alignItems:   "center",
                            gap:          10,
                            padding:      "9px 10px",
                            background:   isActive
                              ? dark
                                ? "rgba(129,140,248,0.15)"
                                : "rgba(109,40,217,0.07)"
                              : "transparent",
                            border:       "none",
                            borderRadius: 9,
                            cursor:       "pointer",
                            textAlign:    "left",
                            fontFamily:   "inherit",
                            transition:   "background 0.1s",
                          }}
                          onMouseEnter={e => {
                            if (!isActive)
                              e.currentTarget.style.background = c.hover;
                          }}
                          onMouseLeave={e => {
                            if (!isActive)
                              e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {/* Colour dot with glow */}
                          <span style={{
                            width:        10,
                            height:       10,
                            borderRadius: "50%",
                            background:   b.color,
                            flexShrink:   0,
                            boxShadow:    isActive
                              ? `0 0 8px ${b.color}99`
                              : "none",
                          }} />

                          {/* Labels */}
                          <span style={{ flex: 1 }}>
                            <span style={{
                              display:    "block",
                              fontSize:   13,
                              fontWeight: isActive ? 700 : 400,
                              color:      isActive ? c.accent : c.text,
                            }}>
                              {b.short}
                            </span>
                            <span style={{
                              display:  "block",
                              fontSize: 11,
                              color:    c.muted,
                            }}>
                              {b.name}
                            </span>
                          </span>

                          {/* Active checkmark */}
                          {isActive && (
                            <span style={{
                              fontSize:   13,
                              color:      c.accent,
                              fontWeight: 700,
                            }}>
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Divider + back to picker */}
                    <div style={{
                      height:     1,
                      background: c.border,
                      margin:     "6px 0",
                    }} />
                    <button
                      onClick={() => {
                        setBranch(null);
                        setBranchMenuOpen(false);
                      }}
                      style={{
                        width:        "100%",
                        display:      "flex",
                        alignItems:   "center",
                        gap:          8,
                        padding:      "8px 10px",
                        background:   "transparent",
                        border:       "none",
                        borderRadius: 9,
                        cursor:       "pointer",
                        textAlign:    "left",
                        fontSize:     12,
                        color:        c.sub,
                        fontFamily:   "inherit",
                        transition:   "background 0.1s",
                      }}
                      onMouseEnter={e =>
                        e.currentTarget.style.background = c.hover
                      }
                      onMouseLeave={e =>
                        e.currentTarget.style.background = "transparent"
                      }
                    >
                      ← Back to branch picker
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ── Tab strip ─────────────────────────────────────────── */}
            <div
              className="no-scrollbar navbar-tabs-scroll"
              style={{
                display:   "flex",
                alignItems:"stretch",
                overflowX: "auto",
                flex:      1,
                gap:       0,
                justifyContent: "space-evenly",
              }}
            >
              {TABS.map(t => {
                const isActive   = tab === t.key;
                const showBadge  = t.key === "backlogs" && totalBacklogs > 0;

                return (
                  <button
                    key={t.key}
                    type = "button"
                    className="navbar-tab-btn"
                    onClick={e => {
                      e.currentTarget.blur();
                      setTab(t.key);
                    }}
                    style={{
                      display:      "flex",
                      alignItems:   "center",
                      justifyContent: "center",
                      flex:         1,
                      minWidth:     "fit-content",
                      gap:          5,
                      padding:      "0 14px",
                      height:       44,
                      background:  isActive
                        ? dark
                          ? "rgba(129,140,248,0.14)"
                          : "rgba(109,40,217,0.08)"
                        : "transparent",
                      border:       "none",
                      borderBottom: isActive
                        ? `2px solid ${c.accent}`
                        : "2px solid transparent",
                      cursor:       "pointer",
                      color:        isActive ? c.accent : c.sub,
                      fontSize:     13,
                      fontWeight:   isActive ? 700 : 400,
                      whiteSpace:   "nowrap",
                      flexShrink:   0,
                      fontFamily:   "inherit",
                      transition: "background 0.22s ease, color 0.22s ease, border-color 0.22s ease",
                      position:     "relative",
                      outline:      "none",
                      boxShadow:    "none",
                    }}
                  >
                    
                    <span className="tab-icon" style={{ fontSize: 13 }}>{t.icon}</span>
                    {t.label}

                    {/* Backlog count badge */}
                    {showBadge && (
                      <span style={{
                        fontSize:     9,
                        background:   c.bad,
                        color:        "#fff",
                        borderRadius: 99,
                        padding:      "1px 5px",
                        fontWeight:   700,
                        marginLeft:   2,
                        lineHeight:   1.6,
                      }}>
                        {totalBacklogs}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}
      
      {showUsernameModal && (
        <UsernameSetupModal
          dark={dark}
          c={c}
          btn={btn}
          inp={inp}
          user={user}
          onDone={(updatedUser) => {
            setShowUsernameModal(false);
            if (updatedUser) setUser(updatedUser);
          }}
          isChange={true}
        />
      )}
    </header>
  );
}