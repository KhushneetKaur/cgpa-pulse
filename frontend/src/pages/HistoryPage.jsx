import { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme } from "../context/ThemeContext";
import { BRANCHES } from "../data/branches";
import { cgpaToPercentage, getPerformanceLabel } from "../utils/calculations";
import SemesterCard from "../components/SemesterCard";
import SkeletonCard from "../components/SkeletonCard";

// Module-level constant — never recreated across renders
const SKELETON_KEYS = [1, 2, 3];

export default function HistoryPage() {
  const {
    branch,
    semKeys = [],
    bHist = {},
    bBacklogs = {},
    cgpa,
    doneSems = 0,
    lbOptIn,
    toggleLbOptIn,
    openQuick,
    authLoading,
  } = useAppData();

  const { c, btn, cardSty, scoreClr } = useTheme();

  // Safely formatted CGPA string
  const formattedCgpa = useMemo(() => {
    if (cgpa === null || cgpa === undefined || isNaN(cgpa)) return "0.00";
    return typeof cgpa === "number" ? cgpa.toFixed(2) : String(cgpa);
  }, [cgpa]);

  // Derived values
  const percentage = useMemo(() => cgpaToPercentage(cgpa), [cgpa]);
  const performance = useMemo(() => (cgpa ? getPerformanceLabel(cgpa) : null), [cgpa]);

  const cardStyle = cardSty();

  // Memoize bar chart data
  const barData = useMemo(() => {
    return semKeys.map((s) => {
      const v = bHist[s]?.sgpa ? parseFloat(bHist[s].sgpa) : 0;
      const isQ = bHist[s]?.mode === "quick";
      return { s, v, isQ };
    });
  }, [semKeys, bHist]);

  // Memoize saved semesters
  const savedSems = useMemo(
    () => semKeys.filter((s) => bHist[s]?.sgpa),
    [semKeys, bHist]
  );

  // Safe branch lookup
  const branchName = BRANCHES[branch]?.name || "Your Branch";

  // 1. Loading State
  if (authLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <SkeletonCard rows={3} height={160} />
        {SKELETON_KEYS.map((i) => (
          <SkeletonCard key={i} rows={4} height={120} />
        ))}
      </div>
    );
  }

  // 2. Empty State
  if (doneSems === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
          <p style={{ fontSize: 36, margin: "0 0 10px" }}>📭</p>
          <p style={{ color: c.sub, fontSize: 14, margin: 0 }}>No semesters saved yet.</p>
          <p style={{ color: c.muted, fontSize: 12, margin: "6px 0 0" }}>
            Head to the Calculator tab and save a semester to see your history.
          </p>
        </div>
      </div>
    );
  }

  // 3. History Content State
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── CGPA Summary Card ───────────────────────────────────── */}
      <div style={cardStyle}>
        <div
          className="history-summary-row"
          style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}
        >
          {/* Left: CGPA */}
          <div className="history-cgpa-block">
            <p style={{ margin: "0 0 4px", fontSize: 12, color: c.sub }}>
              Cumulative CGPA — {branchName}
            </p>
            <p style={{ margin: 0, fontSize: 52, fontWeight: 700, color: scoreClr(cgpa), lineHeight: 1 }}>
              {formattedCgpa}
            </p>
            <p style={{ margin: "4px 0 2px", fontSize: 13, color: c.ok, fontWeight: 600 }}>
              ≈ {percentage}%
              <span style={{ fontSize: 11, color: c.muted, fontWeight: 400, marginLeft: 6 }}>
                (CGPA × 10)
              </span>
            </p>
            {performance && (
              <p style={{ margin: 0, fontSize: 12, color: c.sub }}>
                {performance.label}
                <span style={{ fontSize: 11, color: c.muted, marginLeft: 8 }}>
                  {doneSems}/8 semesters saved
                </span>
              </p>
            )}
          </div>

          {/* Right: SGPA Bar Chart */}
          <div
            className="history-bar-chart"
            style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 4, height: 60, minWidth: 160 }}
          >
            {barData.map(({ s, v, isQ }) => {
              const color = v ? (isQ ? c.purple : scoreClr(v)) : c.border;
              return (
                <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  {v > 0 && (
                    <span style={{ fontSize: 8, color, fontWeight: 600 }}>{v}</span>
                  )}
                  <div
                    title={`Sem ${s}: ${v || "not saved"}`}
                    style={{
                      width: "100%",
                      minHeight: 2,
                      height: v ? `${(v / 10) * 44}px` : "2px",
                      background: color,
                      borderRadius: "3px 3px 0 0",
                      transition: "height 0.3s ease",
                    }}
                  />
                  <span style={{ fontSize: 9, color: c.muted }}>{s}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
            paddingTop: 14,
            borderTop: `1px solid ${c.border}`,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: c.gold }}>
              🏆 Leaderboard
            </p>
            <p style={{ margin: 0, fontSize: 12, color: c.sub }}>
              {lbOptIn
                ? "Your CGPA is visible on the leaderboard"
                : "Share your CGPA anonymously on the leaderboard"}
            </p>
          </div>
          <button
            onClick={toggleLbOptIn}
            style={{
              ...btn("ghost"),
              fontSize: 12,
              borderColor: lbOptIn ? c.ok : c.border,
              color: lbOptIn ? c.ok : c.sub,
              fontWeight: lbOptIn ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {lbOptIn ? "✓ Opted in · Opt out" : "Opt in"}
          </button>
        </div>
      </div>

      {/* ── Semester Cards List ─────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {savedSems.map((s) => (
          <SemesterCard
            key={s}
            sem={s}
            h={bHist[s]}
            subs={BRANCHES[branch]?.semesters?.[s]?.subjects || []}
            semBLs={bBacklogs[s] || []}
            onEdit={() => openQuick(s)}
          />
        ))}
      </div>
    </div>
  );
}