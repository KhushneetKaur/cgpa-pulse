import { useState, useMemo, useCallback, memo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme }   from "../context/ThemeContext";
import { BRANCHES }          from "../data/branches";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";
import MRSPTULogo   from "./MRSPTULogo";
import SkeletonCard from "./SkeletonCard";

// Module-level — never recreated
const ENG_BRANCH_ENTRIES   = Object.entries(BRANCHES);
const PHARM_BRANCH_ENTRIES = Object.entries(PHARMACY_BRANCHES);
const SKELETON_ITEMS       = [1, 2, 3, 4, 5, 6];

const COPY = {
  engineering: {
    heading:    "Select Your Branch",
    subheading: "Choose your engineering discipline to load the correct subjects and marks scheme.",
    footer:     "You can switch between branches anytime from the top bar. Progress is saved separately for each branch.",
  },
  pharmacy: {
    heading:    "Select Your Programme",
    subheading: "Choose your pharmacy programme to load the correct subjects and grading scheme.",
    footer:     "You can switch programmes anytime from your profile. Progress is saved separately for each programme.",
  },
};

export default function BranchSelect() {
  const { setBranch, hist, authLoading, faculty } = useAppData();
  const { c, dark, cardSty } = useTheme();

  const card = cardSty();
  const copy = COPY[faculty] || COPY.engineering;

  const handleSelect = useCallback((key) => setBranch(key), [setBranch]);

  // faculty is the stable dep — ENG/PHARM_BRANCH_ENTRIES are module-level constants
  const branchSummaries = useMemo(() => {
    const entries = faculty === "pharmacy" ? PHARM_BRANCH_ENTRIES : ENG_BRANCH_ENTRIES;
    return entries.map(([key, b]) => {
      const branchHist = hist[key];
      const savedSems  = branchHist
        ? Object.values(branchHist).filter(s => s?.sgpa).length
        : 0;
      const totalSems = Object.keys(b.semesters).length;
      return { key, b, savedSems, totalSems };
    });
  }, [faculty, hist]);

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
        {copy.heading}
      </h2>
      <p style={{ fontSize: 13, color: c.sub, margin: "0 0 28px", lineHeight: 1.5 }}>
        {copy.subheading}
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
        {copy.footer}
      </p>
    </div>
  );
}

// ── Branch card — works for both engineering (short="CSE") and pharmacy (short="B.Pharm") ──
const BranchCard = memo(function BranchCard({ branchKey, branch, savedSems, totalSems, onSelect }) {
  const { c } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const hasProgress = savedSems > 0;
  const isComplete  = savedSems === totalSems;
  const progress    = Math.round((savedSems / totalSems) * 100);

  // "Year" for Pharm.D, "Sem" for everything else
  const unit = (branch.semLabel || "Sem").toLowerCase();

  const handleClick    = useCallback(() => onSelect(branchKey), [onSelect, branchKey]);
  const handleHoverOn  = useCallback(() => setIsHovered(true),  []);
  const handleHoverOff = useCallback(() => setIsHovered(false), []);

  const cardLabel = `${branch.name} (${branch.short}). ${
    hasProgress
      ? isComplete
        ? `All ${unit}s saved.`
        : `${savedSems} of ${totalSems} ${unit}s saved.`
      : `No ${unit}s saved.`
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
        padding:       "16px 12px",
        background:    isHovered ? `${branch.color}11` : c.hover,
        border:        `2px solid ${isHovered ? branch.color : c.border}`,
        borderRadius:  10,
        cursor:        "pointer",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           6,
        transition:    "border-color 0.15s, background 0.15s, transform 0.15s",
        transform:     isHovered ? "translateY(-2px)" : "none",
        width:         "100%",
        outline:       "none",
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
            {isComplete ? `All ${unit}s saved ✓` : `${savedSems} / ${totalSems} saved`}
          </span>
        </div>
      )}
    </button>
  );
});