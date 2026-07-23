import { useState, useEffect } from "react";
import { BRANCHES } from "../data/branches";
import { apiUpdateUsername, apiUpdateBranch, apiUpdateCurrentSem } from "../services/user.api.js";

function isValidUsername(u) {
  const v = u.trim();
  if (v.length < 4)  return { ok: false, msg: "Min 4 characters" };
  if (v.length > 15) return { ok: false, msg: "Max 15 characters" };
  if (!/^[a-zA-Z0-9_]+$/.test(v))
    return { ok: false, msg: "Only letters, numbers, underscores" };
  if (!/[a-zA-Z]/.test(v))
    return { ok: false, msg: "Must contain at least one letter" };
  return { ok: true };
}

export default function OnboardingModal({ dark, c, btn, inp, user, onDone }) {
  const [step,       setStep]       = useState(1); // 1=username, 2=branch, 3=semester, 4=welcome
  const [branch,     setBranch]     = useState(user?.branch || null);
  const [currentSem, setCurrentSem] = useState(user?.currentSem || null);
  const [err,        setErr]        = useState("");
  const [loading,    setLoading]    = useState(false);

  // Single state initialization for username
  const [username, setUsername] = useState(() => {
    if (!user?.username) return "";
    return user.username.replace(/_[a-z0-9]{4}$/i, "");
  });

  // Safe sync effect tied to user ID to avoid overwriting state while typing
  useEffect(() => {
    if (!user) return;
    if (user.username) {
      setUsername(user.username.replace(/_[a-z0-9]{4}$/i, ""));
    }
    if (user.branch) setBranch(user.branch);
    if (user.currentSem) setCurrentSem(user.currentSem);
  }, [user?.id || user?._id]);

  // Step 1: Save Username
  async function handleUsernameNext(e) {
    if (e) e.preventDefault();
    const check = isValidUsername(username);
    if (!check.ok) { setErr(check.msg); return; }
    setErr("");
    setLoading(true);
    try {
      await apiUpdateUsername(username.trim());
      setStep(2);
    } catch (e) {
      setErr(e.message || "Username taken — try another");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Select Branch locally
  function handleBranchNext() {
    if (!branch) { setErr("Please select your branch"); return; }
    setErr("");
    setStep(3);
  }

  // Step 3: Select & save Semester
  async function handleSemesterNext() {
    if (!currentSem) { setErr("Please select your current semester"); return; }
    setErr("");
    setLoading(true);
    try {
      if (typeof apiUpdateCurrentSem === "function") {
        await apiUpdateCurrentSem(currentSem);
      }
      setStep(4);
    } catch (e) {
      console.error("Error updating current sem:", e);
      // Non-critical — continue to final step anyway
      setStep(4);
    } finally {
      setLoading(false);
    }
  }

  // Step 4: Save branch to API and finish
  async function handleFinish(e) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (typeof apiUpdateBranch === "function") {
        await apiUpdateBranch(branch);
      }
    } catch (e) {
      console.error("Error completing onboarding:", e);
    } finally {
      setLoading(false);
      onDone(username.trim(), branch, currentSem);
    }
  }

  return (
    <div style={{
      position:             "fixed",
      inset:                0,
      zIndex:               9999,
      background:           "rgba(0,0,0,0.85)",
      backdropFilter:       "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      display:              "flex",
      alignItems:           "center",
      justifyContent:       "center",
      padding:              "1rem",
    }}>
      <div style={{
        background:    dark ? "#0f1424" : "#fff",
        border:        `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`,
        borderRadius: 20,
        padding:      "32px 28px",
        maxWidth:     440,
        width:        "100%",
        maxHeight:    "90vh",
        overflowY:    "auto",
        scrollbarWidth: "none",
        boxShadow:    dark
          ? "0 24px 80px rgba(0,0,0,0.7)"
          : "0 24px 80px rgba(109,40,217,0.18)",
        animation:    "scaleIn 0.25s ease both",
      }}>

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{
              width:        s === step ? 20 : 8,
              height:       8,
              borderRadius: 99,
              background:   s === step
                ? c.accent
                : s < step
                ? `${c.accent}60`
                : dark ? "#1e2540" : "#e4e2f0",
              transition:   "all 0.3s",
            }} />
          ))}
        </div>

        {/* ── Step 1: Username ──────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleUsernameNext}>
            <p style={{ margin: "0 0 6px", fontSize: 24, textAlign: "center" }}>👋</p>
            <h2 style={{
              margin: "0 0 6px", fontSize: 20, fontWeight: 800,
              color: c.text, textAlign: "center",
            }}>
              Welcome to CGPA Pulse!
            </h2>
            <p style={{
              margin: "0 0 24px", fontSize: 13, color: c.sub,
              textAlign: "center", lineHeight: 1.6,
            }}>
              Let's set up your profile. First, choose a username — this is how
              others will see you on the leaderboard.
            </p>

            <label style={{ fontSize: 12, fontWeight: 600, color: c.sub, display: "block", marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setErr(""); }}
              placeholder="e.g. khushneet_k"
              style={{
                ...inp(),
                marginBottom: 6,
                fontSize: 15,
                padding: "12px 14px",
              }}
              autoFocus
            />
            <p style={{ margin: "0 0 16px", fontSize: 11, color: c.muted }}>
              4–15 characters · letters, numbers, _ · must include a letter · can change after 30 days
            </p>

            {err && (
              <p style={{ margin: "0 0 12px", fontSize: 12, color: c.bad, fontWeight: 500 }}>
                ⚠ {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...btn("primary"),
                width:          "100%",
                padding:        "13px",
                fontSize:       14,
                justifyContent: "center",
                opacity:        loading ? 0.7 : 1,
              }}
            >
              {loading ? "Checking..." : "Continue →"}
            </button>
          </form>
        )}

        {/* ── Step 2: Branch ───────────────────────────────────── */}
        {step === 2 && (
          <>
            <button
              type="button"
              onClick={() => { setStep(1); setErr(""); }}
              style={{
                background: "none",
                border: "none",
                color: c.sub,
                cursor: "pointer",
                fontSize: 12,
                marginBottom: 12,
                padding: 0,
              }}
            >
              ← Back to username
            </button>
            <h2 style={{
              margin: "0 0 6px", fontSize: 20, fontWeight: 800,
              color: c.text, textAlign: "center",
            }}>
              Your Branch
            </h2>
            <p style={{
              margin: "0 0 20px", fontSize: 13, color: c.sub,
              textAlign: "center", lineHeight: 1.6,
            }}>
              Hey <strong style={{ color: c.accent }}>@{username || "there"}</strong>! 🎉
              Now select your engineering branch so we can load the right subjects.
            </p>

            <div style={{
              display:             "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:                 8,
              marginBottom:        20,
            }}>
              {Object.entries(BRANCHES).map(([key, b]) => {
                const isSelected = branch === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setBranch(key); setErr(""); }}
                    style={{
                      padding:      "12px 10px",
                      borderRadius: 12,
                      border:       isSelected
                        ? `2px solid ${b.color}`
                        : `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`,
                      background:   isSelected
                        ? `${b.color}14`
                        : dark ? "#080c18" : "#f9f8ff",
                      cursor:       "pointer",
                      fontFamily:   "inherit",
                      textAlign:    "left",
                      transition:   "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: b.color, flexShrink: 0,
                        boxShadow: isSelected ? `0 0 6px ${b.color}` : "none",
                      }} />
                      <span style={{
                        fontSize:   12,
                        fontWeight: isSelected ? 700 : 600,
                        color:      isSelected ? b.color : c.text,
                      }}>
                        {b.short}
                      </span>
                    </div>
                    <p style={{
                      margin:       0,
                      fontSize:     9,
                      color:        c.muted,
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace:   "nowrap",
                    }}>
                      {b.name.split("(")[0].trim()}
                    </p>
                  </button>
                );
              })}
            </div>

            {err && (
              <p style={{ margin: "0 0 12px", fontSize: 12, color: c.bad, fontWeight: 500 }}>
                ⚠ {err}
              </p>
            )}

            <button
              type="button"
              onClick={handleBranchNext}
              disabled={!branch}
              style={{
                ...btn("primary"),
                width:          "100%",
                padding:        "13px",
                fontSize:       14,
                justifyContent: "center",
                opacity:        !branch ? 0.6 : 1,
                cursor:         !branch ? "not-allowed" : "pointer",
              }}
            >
              Continue →
            </button>
          </>
        )}

        {/* ── Step 3: Semester selection ───────────────────────── */}
        {step === 3 && (
          <>
            <button
              type="button"
              onClick={() => { setStep(2); setErr(""); }}
              style={{
                background: "none",
                border: "none",
                color: c.sub,
                cursor: "pointer",
                fontSize: 12,
                marginBottom: 12,
                padding: 0,
              }}
            >
              ← Back to branch
            </button>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: c.text, textAlign: "center" }}>
              Which semester are you in?
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: c.sub, textAlign: "center", lineHeight: 1.6 }}>
              We'll open your current semester automatically.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setCurrentSem(s); setErr(""); }}
                  style={{
                    padding:      "14px 8px",
                    borderRadius: 12,
                    border:       currentSem === s
                      ? `2px solid ${c.accent}`
                      : `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`,
                    background:   currentSem === s
                      ? `${c.accent}14`
                      : dark ? "#080c18" : "#f9f8ff",
                    cursor:       "pointer",
                    fontFamily:   "inherit",
                    fontSize:     16,
                    fontWeight:   700,
                    color:        currentSem === s ? c.accent : c.text,
                    transition:   "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {currentSem && currentSem > 1 && (
              <div style={{
                padding:      "12px 14px",
                borderRadius: 10,
                background:   dark ? "rgba(124,131,245,0.08)" : "rgba(109,40,217,0.05)",
                border:       `1px solid ${dark ? "rgba(124,131,245,0.2)" : "rgba(109,40,217,0.12)"}`,
                marginBottom: 16,
                fontSize:     12,
                color:        c.sub,
                lineHeight:   1.6,
              }}>
                💡 <strong style={{ color: c.text }}>Tip:</strong> For Semesters 1–{currentSem - 1},
                use the <strong style={{ color: c.accent }}>⚡ Quick SGPA</strong> button inside
                the Calculator to enter your final SGPA directly.
              </div>
            )}

            {err && <p style={{ margin: "0 0 12px", fontSize: 12, color: c.bad }}>⚠ {err}</p>}

            <button
              type="button"
              onClick={handleSemesterNext}
              disabled={!currentSem || loading}
              style={{
                ...btn("primary"),
                width: "100%",
                padding: "13px",
                fontSize: 14,
                justifyContent: "center",
                opacity: (!currentSem || loading) ? 0.6 : 1,
                cursor: (!currentSem || loading) ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Saving..." : "Continue →"}
            </button>
          </>
        )}

        {/* ── Step 4: Welcome & Quick Guide ────────────────────── */}
        {step === 4 && (
          <form onSubmit={handleFinish}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <p style={{ fontSize: 48, margin: "0 0 12px" }}>🎓</p>
              <h2 style={{
                margin: "0 0 8px", fontSize: 22, fontWeight: 900,
                color: c.text,
              }}>
                You're all set!
              </h2>
              <p style={{
                margin: "0", fontSize: 13, color: c.sub, lineHeight: 1.6,
              }}>
                Welcome to CGPA Pulse,{" "}
                <strong style={{ color: c.accent }}>@{username}</strong>!
                Your branch is set to{" "}
                <strong style={{ color: c.text }}>{BRANCHES[branch]?.short || branch || "Selected Branch"}</strong>.
              </p>
            </div>

            <div style={{
              background:   dark ? "#080c18" : "#f4f3ff",
              borderRadius: 12,
              padding:      "16px",
              marginBottom: 20,
            }}>
              <p style={{
                margin: "0 0 12px", fontSize: 11, fontWeight: 700,
                color: c.muted, textTransform: "uppercase", letterSpacing: 0.8,
              }}>
                Quick guide
              </p>

              {[
  {
    icon:    "📲",
    title:   "Install CGPA Pulse on your phone",
    desc:    "Tap the Share button in Safari (iOS) or the menu in Chrome (Android) and select \"Add to Home Screen\" — works like a native app, no App Store needed.",
    highlight: true,
  },
  {
    icon:  "👤",
    title: "Your profile is in the top-right avatar",
    desc:  "Tap your initials button to change username, switch branch, view CGPA, or sign out.",
  },
  {
    icon:  "📝",
    title: "Enter marks in the Calculator tab",
    desc:  "Select a semester, enter internal + external marks for each subject, then hit Save.",
  },
  {
    icon:  "⚡",
    title: "Already have your SGPA? Use Quick SGPA",
    desc:  "Tap ⚡ inside the Calculator to directly enter a known SGPA for any semester — no need to enter every mark.",
  },
  {
    icon:  "✏️",
    title: "Customise subjects if your syllabus changed",
    desc:  "Use the Customise button inside the calculator to hide removed subjects or add new ones.",
  },
  {
    icon:  "🏆",
    title: "Join the leaderboard anytime",
    desc:  "Go to the Leaderboard tab and opt in to show your CGPA to other students.",
  },
].map(tip => (
  <div key={tip.title} style={{
    display:      "flex",
    gap:          10,
    marginBottom: 10,
    alignItems:   "flex-start",
    padding:      tip.highlight ? "10px 12px" : "0",
    borderRadius: tip.highlight ? 10 : 0,
    background:   tip.highlight
      ? dark
        ? "rgba(124,131,245,0.12)"
        : "rgba(109,40,217,0.07)"
      : "transparent",
    border: tip.highlight
      ? `1px solid ${dark ? "rgba(124,131,245,0.25)" : "rgba(109,40,217,0.18)"}`
      : "none",
  }}>
    <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.3 }}>
      {tip.icon}
    </span>
    <div>
      <p style={{
        margin:     "0 0 2px",
        fontSize:   12,
        fontWeight: 700,
        color:      tip.highlight ? c.accent : c.text,
      }}>
        {tip.title}
        {tip.highlight && (
          <span style={{
            marginLeft:   6,
            fontSize:     9,
            fontWeight:   700,
            color:        "#fff",
            background:   c.accent,
            borderRadius: 4,
            padding:      "1px 5px",
            verticalAlign: "middle",
          }}>
            NEW
          </span>
        )}
      </p>
      <p style={{
        margin:     0,
        fontSize:   11,
        color:      tip.highlight ? c.sub : c.sub,
        lineHeight: 1.5,
      }}>
        {tip.desc}
      </p>
    </div>
  </div>
))}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...btn("primary"),
                width:          "100%",
                padding:        "14px",
                fontSize:       15,
                justifyContent: "center",
                opacity:        loading ? 0.7 : 1,
              }}
            >
              {loading ? "Finishing..." : "Let's go! 🚀"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}