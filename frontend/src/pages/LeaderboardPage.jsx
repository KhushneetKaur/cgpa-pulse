import { memo, useState, useEffect } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme } from "../context/ThemeContext";
import { BRANCHES } from "../data/branches";
import LeaderboardOptInModal from "../components/LeaderboardOptInModal";

// Pure function 
function getMedal(idx) {
  if (idx === 0) return "🥇";
  if (idx === 1) return "🥈";
  if (idx === 2) return "🥉";
  return null;
}

export default function LeaderboardPage() {
  const { user, branch, cgpa, lbData, lbOptIn, toggleLbOptIn, fetchLeaderboard } = useAppData();
  const { c, dark, btn, cardSty, scoreClr } = useTheme();

  const [showOptInModal, setShowOptInModal] = useState(false);
  const [optOutErr, setOptOutErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Safely extract array regardless of initial context state
  const entries = Array.isArray(lbData) ? lbData : (lbData?.leaderboard || []);

  // Fetch leaderboard data when component mounts or opt-in status updates
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (typeof fetchLeaderboard === "function") {
        try {
          setLoading(true);
          await fetchLeaderboard();
        } catch (err) {
          console.error("Failed to fetch leaderboard:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [fetchLeaderboard, lbOptIn]);

  async function handleToggle() {
    if (isSubmitting) return;
    if (!lbOptIn) { setShowOptInModal(true); return; }
    try {
      setIsSubmitting(true);
      setOptOutErr("");
      await toggleLbOptIn();
    } catch (err) {
      setOptOutErr(err?.message || "Cannot opt out right now");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmOptIn() {
    try {
      setIsSubmitting(true);
      setOptOutErr("");
      await toggleLbOptIn();
      setShowOptInModal(false); 
    } catch (err) {
      setOptOutErr(err?.message || "Failed to opt in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={cardSty()}>

      {/* Header */}
      <div
        className="lb-header-row"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: c.text }}>
            🏆 CGPA Leaderboard
          </p>
          <p style={{ margin: 0, fontSize: 13, color: c.sub }}>
            Anonymous opt-in ranking
          </p>
        </div>

        <div>
          <button
            onClick={handleToggle}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            style={{
              ...btn("ghost"),
              fontSize:    12,
              borderColor: lbOptIn ? c.ok : c.border,
              color:       lbOptIn ? c.ok : c.sub,
              fontWeight:  lbOptIn ? 600 : 400,
              opacity:     isSubmitting ? 0.6 : 1,
              cursor:      isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Updating..." : lbOptIn ? "✓ You're on the board · Opt out" : "Add my CGPA to the board"}
          </button>
          {optOutErr && (
            <p style={{ margin: "6px 0 0", fontSize: 11, color: c.bad, fontWeight: 500 }}>
              {optOutErr}
            </p>
          )}
        </div>
      </div>

      {/* Your standing */}
      {cgpa && (
        <div
          className="lb-your-standing"
          style={{
            padding: "10px 14px", background: c.accentLt,
            border: `1px solid ${c.accentTxt}44`, borderRadius: 8,
            marginBottom: 14, display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 11, color: c.sub }}>
              Your CGPA ({BRANCHES[branch]?.short || branch})
            </p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: scoreClr(cgpa) }}>
              {cgpa}
            </p>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: c.sub, flex: 1 }}>
            {lbOptIn
              ? "Your score is visible on the leaderboard below."
              : "Click 'Add my CGPA' above to appear on the leaderboard."}
          </p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <p style={{ color: c.sub, fontSize: 13, margin: 0 }}>Loading leaderboard entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <p style={{ fontSize: 32, margin: "0 0 8px" }}>🏅</p>
          <p style={{ color: c.sub,   fontSize: 13, margin: 0 }}>No entries yet.</p>
          <p style={{ color: c.muted, fontSize: 12, margin: "4px 0 0" }}>Be the first to opt in!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {entries.map((entry, idx) => (
            <LeaderboardRow
              key={entry._id || entry.id || `${entry.username}-${entry.branch}-${idx}`}
              entry={entry}
              idx={idx}
              isMe={entry.username === user?.username || entry.userId === user?._id}
            />
          ))}
        </div>
      )}

      {showOptInModal && (
        <LeaderboardOptInModal
          onConfirm={handleConfirmOptIn}
          onCancel={() => setShowOptInModal(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

// ── Leaderboard row — uses useTheme directly, no prop drilling ───────────────
const LeaderboardRow = memo(function LeaderboardRow({ entry, idx, isMe }) {
  const { c, scoreClr } = useTheme();

  // Handle variations in entry keys from different backends
  const username = entry.username || entry.name || "Anonymous User";
  const branchKey = entry.branch || entry.branchCode;
  const branchInfo = BRANCHES[branchKey];
  const medal = getMedal(idx);

  return (
    <div
      className="lb-row"
      style={{
        display:             "grid",
        gridTemplateColumns: "40px 1fr auto auto",
        gap:                 12,
        alignItems:          "center",
        padding:             "10px 14px",
        background:          isMe ? c.accentLt : c.hover,
        borderRadius:        8,
        border:              `1px solid ${isMe ? `${c.accentTxt}44` : c.border}`,
      }}
    >
      {/* Rank */}
      <span
        className="lb-rank"
        aria-label={`Rank ${idx + 1}`}
        style={{
          fontSize:   medal ? 18 : 13,
          textAlign:  "center",
          color:      medal ? undefined : c.muted,
          fontWeight: medal ? undefined : 600,
        }}
      >
        {medal || `#${idx + 1}`}
      </span>

      {/* Username + branch */}
      <div className="lb-info">
        <p style={{ margin: 0, fontSize: 13, fontWeight: isMe ? 700 : 400, color: isMe ? c.accentTxt : c.text }}>
          {username}
          {isMe && (
            <span style={{ fontSize: 10, color: c.accentTxt, marginLeft: 6, fontWeight: 400 }}>
              (you)
            </span>
          )}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: c.muted }}>
          {branchInfo?.name || branchKey || "General"}
          {entry.updatedAt ? ` · updated ${new Date(entry.updatedAt).toLocaleDateString()}` : ""}
        </p>
      </div>

      {/* Branch badge */}
      <span
        className="lb-badge"
        style={{
          fontSize:   11,
          color:      branchInfo?.color || c.sub,
          background: `${branchInfo?.color || c.border}18`,
          border:     `1px solid ${branchInfo?.color || c.border}44`,
          borderRadius: 6,
          padding:    "2px 8px",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {branchInfo?.short || branchKey || "N/A"}
      </span>

      {/* CGPA */}
      <span className="lb-cgpa" style={{ fontSize: 18, fontWeight: 700, color: scoreClr(entry.cgpa) }}>
        {entry.cgpa}
      </span>
    </div>
  );
});