import { useState } from "react";
import { BRANCHES } from "../data/branches";
import { apiUpdateUsername } from "../services/user.api.js";
import { apiUpdateBranch }   from "../services/user.api.js";
import toast from "react-hot-toast";

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
  const [step,     setStep]     = useState(1); // 1=username, 2=branch, 3=welcome
  const [username, setUsername] = useState("");
  const [branch,   setBranch]   = useState(null);
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleUsernameNext() {
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

  async function handleBranchNext() {
    if (!branch) { setErr("Please select your branch"); return; }
    setErr("");
    setLoading(true);
    try {
      await apiUpdateBranch(branch);
      setStep(3);
    } catch (e) {
      setErr(e.message || "Failed to save branch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position:             "fixed",
      inset:                0,
      zIndex:               600,
      background:           "rgba(0,0,0,0.75)",
      backdropFilter:       "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      display:              "flex",
      alignItems:           "center",
      justifyContent:       "center",
      padding:              "1rem",
    }}>
      <div style={{
        background:   dark ? "#0f1424" : "#fff",
        border:       `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`,
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
          {[1, 2, 3].map(s => (
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
          <>
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
              onKeyDown={e => e.key === "Enter" && handleUsernameNext()}
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
              onClick={handleUsernameNext}
              disabled={loading}
              style={{
                ...btn("primary"),
                width:   "100%",
                padding: "13px",
                fontSize: 14,
                justifyContent: "center",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Checking..." : "Continue →"}
            </button>
          </>
        )}

        {/* ── Step 2: Branch ───────────────────────────────────── */}
        {step === 2 && (
          <>
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
              Hey <strong style={{ color: c.accent }}>@{username}</strong>! 🎉
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
              onClick={handleBranchNext}
              disabled={loading || !branch}
              style={{
                ...btn("primary"),
                width:          "100%",
                padding:        "13px",
                fontSize:       14,
                justifyContent: "center",
                opacity:        loading || !branch ? 0.6 : 1,
                cursor:         !branch ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving..." : "Continue →"}
            </button>
          </>
        )}

        {/* ── Step 3: Welcome ──────────────────────────────────── */}
        {step === 3 && (
          <>
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
                <strong style={{ color: c.text }}>{BRANCHES[branch]?.short}</strong>.
              </p>
            </div>

            {/* Quick tips */}
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
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>{tip.icon}</span>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: c.text }}>
                      {tip.title}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: c.sub, lineHeight: 1.5 }}>
                      {tip.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onDone(username, branch)}
              style={{
                ...btn("primary"),
                width:          "100%",
                padding:        "14px",
                fontSize:       15,
                justifyContent: "center",
              }}
            >
              Let's go! 🚀
            </button>
          </>
        )}
      </div>
    </div>
  );
}