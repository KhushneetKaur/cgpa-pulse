import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme }   from "../context/ThemeContext";
import { BRANCHES }          from "../data/branches";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMedal(idx) {
  if (idx === 0) return "🥇";
  if (idx === 1) return "🥈";
  if (idx === 2) return "🥉";
  return null;
}

// Combined branch lookup — works for both engineering and pharmacy
function getBranchInfo(branchKey) {
  return BRANCHES[branchKey] || PHARMACY_BRANCHES[branchKey] || null;
}

// All branches for the filter pill bar
const ALL_FILTER_OPTIONS = [
  { key: "ALL", label: "All", color: null },
  ...Object.entries(BRANCHES).map(([key, b]) => ({
    key, label: b.short, color: b.color, faculty: "engineering",
  })),
  ...Object.entries(PHARMACY_BRANCHES).map(([key, b]) => ({
    key, label: b.short, color: b.color, faculty: "pharmacy",
  })),
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const {
    user, branch, faculty: userFaculty, cgpa,
    lbData, fetchLeaderboard,
  } = useAppData();
  const { c, dark, cardSty, scoreClr } = useTheme();

  const [activeTab,    setActiveTab]    = useState("overall");
  const [branchFilter, setBranchFilter] = useState("ALL"); 
  const [loading,      setLoading]      = useState(false);

  // Safe array regardless of API response shape
  const entries = useMemo(() =>
    Array.isArray(lbData) ? lbData : [],
    [lbData]
  );

  // Overall tab — filtered by branch pill selection
  const overallEntries = useMemo(() => {
    if (branchFilter === "ALL") return entries;
    return entries.filter(e => e.branch === branchFilter);
  }, [entries, branchFilter]);

  // Branch tab — always the user's own branch
  const branchEntries = useMemo(() =>
    branch ? entries.filter(e => e.branch === branch) : [],
    [entries, branch]
  );

  const displayEntries = activeTab === "branch" ? branchEntries : overallEntries;

  // Lazy load on first visit
  useEffect(() => {
    if (!entries.length) {
      setLoading(true);
      fetchLeaderboard().finally(() => setLoading(false));
    }
  }, []); 

  const userBranchInfo = getBranchInfo(branch);
  const myEntry        = entries.find(e => e.username === user?.username);
  const myRank         = myEntry ? entries.indexOf(myEntry) + 1 : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Hero stats card ─────────────────────────────────────── */}
      <div style={{
        background:   dark
          ? "linear-gradient(135deg, rgba(109,40,217,0.15), rgba(6,182,212,0.08))"
          : "linear-gradient(135deg, rgba(109,40,217,0.06), rgba(6,182,212,0.04))",
        border:       `1px solid ${dark ? "rgba(124,131,245,0.25)" : "rgba(109,40,217,0.15)"}`,
        borderRadius: 16,
        padding:      "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          {/* Left — title */}
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: c.text }}>
              🏆 CGPA Leaderboard
            </p>
            <p style={{ margin: 0, fontSize: 13, color: c.sub }}>
              Everyone who saves a semester appears automatically
            </p>
          </div>

          {/* Right — user's own stats */}
          {cgpa && (
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          16,
              background:   dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
              border:       `1px solid ${dark ? "rgba(124,131,245,0.2)" : "rgba(109,40,217,0.12)"}`,
              borderRadius: 12,
              padding:      "12px 20px",
            }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 2px", fontSize: 10, color: c.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>Your CGPA</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: scoreClr(cgpa), letterSpacing: -1 }}>{cgpa}</p>
              </div>
              {myRank && (
                <>
                  <div style={{ width: 1, height: 40, background: c.border }} />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 10, color: c.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>Overall Rank</p>
                    <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: c.accent, letterSpacing: -1 }}>#{myRank}</p>
                  </div>
                </>
              )}
              {userBranchInfo && (
                <>
                  <div style={{ width: 1, height: 40, background: c.border }} />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 10, color: c.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>Programme</p>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: userBranchInfo.color }}>{userBranchInfo.short}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Main leaderboard card ────────────────────────────────── */}
      <div style={{
        ...cardSty(),
        padding: 0,
        overflow: "hidden",
      }}>
        {/* Tab bar */}
        <div style={{
          display:        "flex",
          borderBottom:   `1px solid ${c.border}`,
          background:     dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        }}>
          {[
            { key: "overall", label: "🌐 Overall" },
            { key: "branch",  label: `🎓 ${userBranchInfo?.short || "My Branch"}` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding:      "14px 24px",
                background:   "transparent",
                border:       "none",
                borderBottom: activeTab === t.key
                  ? `2px solid ${c.accent}`
                  : "2px solid transparent",
                color:        activeTab === t.key ? c.accent : c.sub,
                fontWeight:   activeTab === t.key ? 700 : 400,
                fontSize:     14,
                cursor:       "pointer",
                fontFamily:   "inherit",
                transition:   "all 0.15s",
                position:     "relative",
              }}
            >
              {t.label}
              {t.key === "branch" && branchEntries.length > 0 && (
                <span style={{ marginLeft: 8, fontSize: 11, background: c.accent, color: "#fff", borderRadius: 99, padding: "2px 7px", fontWeight: 700 }}>
                  {branchEntries.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 20px" }}>
          {/* Branch filter pills — overall tab only */}
          {activeTab === "overall" && (
            <div
              className="no-scrollbar"
              style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, marginBottom: 4, flexWrap: "wrap" }}
            >
              {ALL_FILTER_OPTIONS.map(opt => {
                const isActive = branchFilter === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setBranchFilter(opt.key)}
                    style={{
                      padding:      "5px 12px",
                      borderRadius: 99,
                      border:       isActive
                        ? `1.5px solid ${opt.color || c.accent}`
                        : `1px solid ${c.border}`,
                      background:   isActive
                        ? `${opt.color || c.accent}18`
                        : "transparent",
                      color:        isActive
                        ? (opt.color || c.accent)
                        : c.sub,
                      fontSize:     12,
                      fontWeight:   isActive ? 700 : 400,
                      cursor:       "pointer",
                      fontFamily:   "inherit",
                      transition:   "all 0.15s",
                      whiteSpace:   "nowrap",
                      flexShrink:   0,
                    }}
                  >
                    {opt.key !== "ALL" && (
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: opt.color || c.muted, marginRight: 5, verticalAlign: "middle" }} />
                    )}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Branch tab info bar */}
          {activeTab === "branch" && branch && (
            <div style={{ fontSize: 12, color: c.muted, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              {userBranchInfo && <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: userBranchInfo.color }} />}
              Showing {userBranchInfo?.name || branch} students
              {branchEntries.length > 0 && ` · ${branchEntries.length} enrolled`}
            </div>
          )}

          {/* Column headers — desktop only */}
          <div
            className="lb-col-headers"
            style={{
              display:             "grid",
              gridTemplateColumns: "48px 1fr auto auto auto",
              gap:                 12,
              padding:             "6px 12px",
              marginBottom:        4,
            }}
          >
            {["#", "Student", "Programme", "Dept", "CGPA"].map(h => (
              <p key={h} style={{ margin: 0, fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: 0.8, textAlign: h === "CGPA" || h === "#" ? "center" : "left" }}>
                {h}
              </p>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "2.5rem 0", color: c.sub, fontSize: 13 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${c.border}`, borderTop: `2px solid ${c.accent}`, animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              Loading leaderboard...
            </div>
          ) : displayEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
              <p style={{ fontSize: 40, margin: "0 0 12px" }}>🏅</p>
              <p style={{ color: c.sub,   fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>No entries yet</p>
              <p style={{ color: c.muted, fontSize: 12, margin: 0 }}>
                {activeTab === "branch"
                  ? `Be the first from ${userBranchInfo?.short || "your programme"}!`
                  : branchFilter !== "ALL"
                  ? `No one from ${getBranchInfo(branchFilter)?.short || branchFilter} yet.`
                  : "Save your first semester to appear here!"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {displayEntries.map((entry, idx) => (
                <LeaderboardRow
                  key={entry._id || entry.id || `${entry.username}-${idx}`}
                  entry={entry}
                  idx={idx}
                  isMe={entry.username === user?.username}
                />
              ))}
            </div>
          )}

          {/* Count footer */}
          {displayEntries.length > 0 && (
            <p style={{ margin: "14px 0 0", fontSize: 11, color: c.muted, textAlign: "center" }}>
              Showing {displayEntries.length} student{displayEntries.length !== 1 ? "s" : ""}
              {branchFilter !== "ALL" && activeTab === "overall" ? ` from ${getBranchInfo(branchFilter)?.short || branchFilter}` : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard row ───────────────────────────────────────────────────────────
const LeaderboardRow = memo(function LeaderboardRow({ entry, idx, isMe }) {
  const { c, dark, scoreClr } = useTheme();

  const medal      = getMedal(idx);
  const branchInfo = getBranchInfo(entry.branch);
  const username   = entry.username || "Anonymous";

  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "48px 1fr auto auto auto",
      gap:                 12,
      alignItems:          "center",
      padding:             "11px 12px",
      borderRadius:        10,
      background:          isMe
        ? dark ? "rgba(109,40,217,0.12)" : "rgba(109,40,217,0.06)"
        : idx % 2 === 0 ? c.hover : "transparent",
      border:              `1px solid ${isMe
        ? dark ? "rgba(124,131,245,0.3)" : "rgba(109,40,217,0.2)"
        : "transparent"}`,
      transition:          "background 0.15s",
    }}>

      {/* Rank */}
      <div style={{ textAlign: "center" }}>
        {medal ? (
          <span style={{ fontSize: 20 }}>{medal}</span>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 600, color: c.muted }}>#{idx + 1}</span>
        )}
      </div>

      {/* Name + branch name */}
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: isMe ? 700 : 500, color: isMe ? c.accent : c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {username}
          {isMe && <span style={{ marginLeft: 6, fontSize: 10, color: c.accent, fontWeight: 400 }}>(you)</span>}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: c.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {branchInfo?.name || entry.branch || "—"}
          {entry.semCount ? ` · ${entry.semCount} sem${entry.semCount !== 1 ? "s" : ""}` : ""}
        </p>
      </div>

      {/* Faculty badge */}
      <span style={{
        fontSize:     11,
        fontWeight:   600,
        padding:      "3px 9px",
        borderRadius: 99,
        background:   entry.faculty === "pharmacy"
          ? dark ? "rgba(14,165,233,0.12)" : "rgba(14,165,233,0.08)"
          : dark ? "rgba(109,40,217,0.12)" : "rgba(109,40,217,0.07)",
        color:        entry.faculty === "pharmacy" ? "#0ea5e9" : c.accent,
        whiteSpace:   "nowrap",
        display:      "none", 
      }}
        className="lb-faculty-badge"
      >
        {entry.faculty === "pharmacy" ? "Pharmacy" : "Engineering"}
      </span>

      {/* Branch badge */}
      <span style={{
        fontSize:     11,
        fontWeight:   700,
        padding:      "3px 9px",
        borderRadius: 6,
        background:   `${branchInfo?.color || c.border}15`,
        border:       `1px solid ${branchInfo?.color || c.border}35`,
        color:        branchInfo?.color || c.sub,
        whiteSpace:   "nowrap",
      }}>
        {branchInfo?.short || entry.branch || "—"}
      </span>

      {/* CGPA */}
      <span style={{ fontSize: 20, fontWeight: 900, color: scoreClr(entry.cgpa), textAlign: "center", letterSpacing: -0.5 }}>
        {entry.cgpa}
      </span>
    </div>
  );
});