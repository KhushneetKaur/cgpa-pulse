import { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme }   from "../context/ThemeContext";
import { BRANCHES }          from "../data/branches";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";
import { cgpaToPercentage, getPerformanceLabel } from "../utils/calculations";
import SemesterCard from "../components/SemesterCard";
import SkeletonCard from "../components/SkeletonCard";

const SKELETON_KEYS = [1, 2, 3];

// Works for both engineering and pharmacy branches
function getBranchData(branch, faculty) {
  if (!branch) return null;
  if (faculty === "pharmacy") return PHARMACY_BRANCHES[branch] || null;
  return BRANCHES[branch] || null;
}

export default function HistoryPage() {
  const {
    branch, faculty, scheme,
    semKeys = [],
    bHist   = {},
    bBacklogs = {},
    cgpa,
    doneSems  = 0,
    openQuick,
    authLoading,
  } = useAppData();
  // lbOptIn + toggleLbOptIn removed — leaderboard is now mandatory, no opt-out

  const { c, cardSty, scoreClr } = useTheme();

  const formattedCgpa = useMemo(() => {
    if (cgpa === null || cgpa === undefined || isNaN(cgpa)) return "0.00";
    return typeof cgpa === "number" ? cgpa.toFixed(2) : String(cgpa);
  }, [cgpa]);

  const percentage  = useMemo(() => cgpaToPercentage(cgpa), [cgpa]);
  const performance = useMemo(() => (cgpa ? getPerformanceLabel(cgpa) : null), [cgpa]);
  const cardStyle   = cardSty();

  // Branch data — faculty-aware
  const branchData = useMemo(() => getBranchData(branch, faculty), [branch, faculty]);
  const branchName = branchData?.name || "Your Programme";
  const semLabel   = branchData?.semLabel || "Sem"; // "Year" for Pharm.D, "Sem" for everything else
  const totalSems  = semKeys.length; // dynamic — 8 for B.Tech, 5 for Pharm.D, 4 for M.Pharm

  // Bar chart data
  const barData = useMemo(() =>
    semKeys.map(s => ({
      s,
      v:   bHist[s]?.sgpa ? parseFloat(bHist[s].sgpa) : 0,
      isQ: bHist[s]?.mode === "quick",
    })),
    [semKeys, bHist]
  );

  const savedSems = useMemo(() =>
    semKeys.filter(s => bHist[s]?.sgpa),
    [semKeys, bHist]
  );

  if (authLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <SkeletonCard rows={3} height={160} />
        {SKELETON_KEYS.map(i => <SkeletonCard key={i} rows={4} height={120} />)}
      </div>
    );
  }

  if (doneSems === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
          <p style={{ fontSize: 36, margin: "0 0 10px" }}>📭</p>
          <p style={{ color: c.sub,   fontSize: 14, margin: 0 }}>No semesters saved yet.</p>
          <p style={{ color: c.muted, fontSize: 12, margin: "6px 0 0" }}>
            Head to the Calculator tab and save a {semLabel.toLowerCase()} to see your history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── CGPA Summary Card ─────────────────────────────────── */}
      <div style={cardStyle}>
        <div className="history-summary-row" style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>

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
                  {/* Dynamic total — not hardcoded 8 */}
                  {doneSems}/{totalSems} {semLabel.toLowerCase()}s saved
                </span>
              </p>
            )}
          </div>

          {/* Right: SGPA bar chart */}
          <div className="history-bar-chart" style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 4, height: 60, minWidth: 160 }}>
            {barData.map(({ s, v, isQ }) => {
              const color = v ? (isQ ? c.purple : scoreClr(v)) : c.border;
              // semLabel-aware tooltip: "Year 1: 8.5" or "Sem 3: 8.5"
              return (
                <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  {v > 0 && <span style={{ fontSize: 8, color, fontWeight: 600 }}>{v}</span>}
                  <div
                    title={`${semLabel} ${s}: ${v || "not saved"}`}
                    style={{ width: "100%", minHeight: 2, height: v ? `${(v / 10) * 44}px` : "2px", background: color, borderRadius: "3px 3px 0 0", transition: "height 0.3s ease" }}
                  />
                  {/* X-axis label — shorter for Pharm.D (5 years vs 8 sems, less cramped) */}
                  <span style={{ fontSize: 9, color: c.muted }}>
                    {semLabel === "Year" ? `Y${s}` : s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard strip — now read-only, no opt-in/out button */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          gap:            10,
          marginTop:      16,
          paddingTop:     14,
          borderTop:      `1px solid ${c.border}`,
        }}>
          <span style={{ fontSize: 16 }}>🏆</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: c.gold }}>
              Leaderboard
            </p>
            <p style={{ margin: 0, fontSize: 12, color: c.sub }}>
              Your CGPA is automatically visible on the leaderboard when you save a semester.
            </p>
          </div>
        </div>
      </div>

      {/* ── Semester Cards ────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {savedSems.map(s => (
          <SemesterCard
            key={s}
            sem={s}
            h={bHist[s]}
            semLabel={semLabel}
            // Faculty-aware subject lookup — passes correct subjects for pharmacy
            subs={branchData?.semesters?.[s]?.subjects || []}
            semBLs={bBacklogs[s] || []}
            onEdit={() => openQuick(s)}
          />
        ))}
      </div>
    </div>
  );
}