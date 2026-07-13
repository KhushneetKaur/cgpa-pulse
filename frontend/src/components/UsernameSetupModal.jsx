import { useState } from "react";
import toast from "react-hot-toast";
import { apiUpdateUsername } from "../services/user.api";

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

export default function UsernameSetupModal({ dark, c, btn, inp, user, onDone, isChange = false }) {
  const [username, setUsername] = useState(isChange ? user.username : "");
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);

  const daysLeft = user.usernameSetAt
    ? Math.max(0, 30 - Math.floor(
        (Date.now() - new Date(user.usernameSetAt).getTime())
        / (1000 * 60 * 60 * 24)
      ))
    : 0;

  const canChange = !user.usernameSetAt || daysLeft === 0;

  async function handleSubmit() {
    const check = isValidUsername(username);
    if (!check.ok) { setErr(check.msg); return; }
    setErr("");
    setLoading(true);
    try {
      const updated = await apiUpdateUsername(username.trim());
      toast.success(isChange ? "Username updated!" : "Username set! Welcome 🎉");
      onDone(updated);
    } catch (e) {
      setErr(e.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position:             "fixed",
      inset:                0,
      zIndex:               500,
      background:           "rgba(0,0,0,0.65)",
      backdropFilter:       "blur(14px)",
      display:              "flex",
      alignItems:           "center",
      justifyContent:       "center",
      padding:              "1rem",
    }}>
      <div style={{
        background:   c.card,
        border:       `1px solid ${c.border}`,
        borderRadius: 20,
        padding:      "32px 28px",
        maxWidth:     400,
        width:        "100%",
        boxShadow:    dark
          ? "0 20px 60px rgba(0,0,0,0.6)"
          : "0 20px 60px rgba(109,40,217,0.15)",
      }}>

        <p style={{ fontSize: 32, margin: "0 0 8px", textAlign: "center" }}>
          {isChange ? "✏️" : "👋"}
        </p>
        <h3 style={{
          margin:     "0 0 6px",
          fontSize:   20,
          fontWeight: 800,
          color:      c.text,
          textAlign:  "center",
        }}>
          {isChange ? "Change Username" : "Choose your username"}
        </h3>
        <p style={{
          margin:     "0 0 20px",
          fontSize:   13,
          color:      c.sub,
          textAlign:  "center",
          lineHeight: 1.6,
        }}>
          {isChange
    ? canChange
      ? "You can change your username once every 30 days."
      : `You can change your username in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
    : "Pick a unique username. You can change it once every 30 days."}
</p>

        {/* Cooldown warning */}
        {isChange && !canChange && (
          <div style={{
            padding:      "10px 14px",
            borderRadius: 10,
            background:   `${c.warn}14`,
            border:       `1px solid ${c.warn}44`,
            marginBottom: 16,
            fontSize:     12,
            color:        c.warn,
            textAlign:    "center",
          }}>
            ⏳ Next change available in {daysLeft} day{daysLeft === 1 ? "" : "s"}
          </div>
        )}

        <input
          type="text"
          value={username}
          onChange={e => { setUsername(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && canChange && handleSubmit()}
          placeholder="e.g. khushneet_k"
          disabled={isChange && !canChange}
          style={{
            ...inp(),
            marginBottom: 8,
            opacity:      isChange && !canChange ? 0.5 : 1,
          }}
        />

        {/* Live validation hint */}
        <p style={{
          margin:     "0 0 12px",
          fontSize:   11,
          color:      c.muted,
        }}>
          4–15 characters · letters, numbers, _ · must include a letter
        </p>

        {err && (
          <p style={{
            margin:     "0 0 12px",
            fontSize:   12,
            color:      c.bad,
            fontWeight: 500,
          }}>
            ⚠ {err}
          </p>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {isChange && (
            <button
              onClick={() => onDone(null)}
              style={{ ...btn("ghost"), flex: 1 }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || (isChange && !canChange)}
            style={{
              ...btn("primary"),
              flex:    1,
              padding: "10px 16px",
              opacity: loading || (isChange && !canChange) ? 0.7 : 1,
              cursor:  loading || (isChange && !canChange) ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : isChange ? "Update Username" : "Set Username →"}
          </button>
        </div>
      </div>
    </div>
  );
}