import { useState, useMemo, useCallback, memo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme } from "../context/ThemeContext";
import { BRANCHES } from "../data/branches";
import MRSPTULogo from "./MRSPTULogo";
import SkeletonCard from "./SkeletonCard";

// Module-level constants — never recreated
const BRANCH_ENTRIES = Object.entries(BRANCHES);
const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6];

export default function BranchSelect() {
  const { setBranch, hist, authLoading } = useAppData();
  const { c, dark, cardSty } = useTheme();

  const card = cardSty(); 

  // Stable handler 
  const handleSelect = useCallback((key) => setBranch(key), [setBranch]);

  // Memoize branch summaries 
  const branchSummaries = useMemo(() =>
    BRANCH_ENTRIES.map(([key, b]) => {
      const branchHist = hist[key];
      const savedSems  = branchHist
        ? Object.values(branchHist).filter(s => s?.sgpa).length
        : 0;
      const totalSems = Object.keys(b.semesters).length;
      return { key, b, savedSems, totalSems };
    }),
    [hist]
  );

  if (authLoading) {
    return (
      <div style={{ ...card, padding: "2.5rem 2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }} />
          <div style={{ width: 180, height: 16, borderRadius: 8, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }} />
          <div style={{ width: 280, height: 12, borderRadius: 6, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: 10, maxWidth: 620, margin: "0 auto" }}>
          {SKELETON_ITEMS.map(i => <SkeletonCard key={i} rows={2} height={100} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...card, textAlign: "center", padding: "2.5rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <MRSPTULogo size={56} />
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: c.text, margin: "0 0 6px" }}>
        Select Your Branch
      </h2>
      <p style={{ fontSize: 13, color: c.sub, margin: "0 0 28px", lineHeight: 1.5 }}>
        Choose your engineering discipline to load the correct subjects and marks scheme.
      </p>

      <div
        className="branch-select-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: 10, maxWidth: 620, margin: "0 auto" }}
      >
        {branchSummaries.map(({ key, b, savedSems, totalSems }) => (
          <BranchCard
            key={key}
            branchKey={key}
            branch={b}
            savedSems={savedSems}
            totalSems={totalSems}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <p style={{ fontSize: 11, color: c.muted, marginTop: 24, lineHeight: 1.5 }}>
        You can switch between branches anytime from the top bar.
        Progress is saved separately for each branch.
      </p>
    </div>
  );
}

// ── Branch card  ──────────────────
const BranchCard = memo(function BranchCard({ branchKey, branch, savedSems, totalSems, onSelect }) {
  const { c } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const hasProgress = savedSems > 0;
  const isComplete  = savedSems === totalSems;
  const progress    = Math.round((savedSems / totalSems) * 100);

  const handleClick     = useCallback(() => onSelect(branchKey), [onSelect, branchKey]);
  const handleHoverOn   = useCallback(() => setIsHovered(true),  []);
  const handleHoverOff  = useCallback(() => setIsHovered(false), []);

  const cardLabel = `${branch.name} (${branch.short}). ${
    hasProgress
      ? isComplete ? "All semesters saved." : `${savedSems} of ${totalSems} semesters saved.`
      : "No semesters saved."
  }`;

  return (
    <button
      onClick={handleClick}
      aria-label={cardLabel}
      onMouseEnter={handleHoverOn}
      onMouseLeave={handleHoverOff}
      onFocus={handleHoverOn}
      onBlur={handleHoverOff}
      style={{
        padding:         "16px 12px",
        background:      isHovered ? `${branch.color}11` : c.hover,
        border:          `2px solid ${isHovered ? branch.color : c.border}`,
        borderRadius:    10,
        cursor:          "pointer",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        gap:             6,
        transition:      "border-color 0.15s, background 0.15s, transform 0.15s",
        transform:       isHovered ? "translateY(-2px)" : "none",
        width:           "100%",
        outline:         "none",
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 700, color: branch.color }}>
        {branch.short}
      </span>
      <span style={{ fontSize: 11, color: c.sub, lineHeight: 1.3, textAlign: "center" }}>
        {branch.name}
      </span>

      {hasProgress && (
        <div style={{ width: "100%", marginTop: 4 }}>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ height: 4, background: c.border, borderRadius: 2, overflow: "hidden", marginBottom: 4 }}
          >
            <div style={{ height: "100%", width: `${progress}%`, background: isComplete ? c.ok : branch.color, borderRadius: 2, transition: "width 0.3s ease" }} />
          </div>
          <span style={{ fontSize: 10, color: isComplete ? c.ok : c.muted, fontWeight: isComplete ? 600 : 400 }}>
            {isComplete ? "All semesters saved ✓" : `${savedSems} / ${totalSems} saved`}
          </span>
        </div>
      )}
    </button>
  );
});