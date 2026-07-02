import { useAppData } from "../context/AppDataContext";
import { BRANCHES } from "../data/branches";
import MRSPTULogo from "./MRSPTULogo";
import SkeletonCard from "./SkeletonCard";


export default function BranchSelect() {
  const { setBranch, hist, c, dark, cardSty, authLoading } = useAppData();

if (authLoading) {
  return (
    <div style={{
      ...cardSty(),
      padding: "2.5rem 2rem",
    }}>
      {/* Fake heading bars */}
      <div style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        gap:            10,
        marginBottom:   28,
      }}>
        <div style={{
          width:        56,
          height:       56,
          borderRadius: "50%",
          background:   dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
        }} />
        <div style={{
          width:        180,
          height:       16,
          borderRadius: 8,
          background:   dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
        }} />
        <div style={{
          width:        280,
          height:       12,
          borderRadius: 6,
          background:   dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        }} />
      </div>

      {/* Fake branch cards grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))",
        gap:                 10,
        maxWidth:            620,
        margin:              "0 auto",
        position:            "relative",
        overflow:            "hidden",
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonCard key={i} dark={dark} rows={2} height={100} />
        ))}
      </div>
    </div>
  );
}

  return (
    <div style={{
      ...cardSty(),
      textAlign: "center",
      padding:   "2.5rem 2rem",
    }}>

      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <MRSPTULogo size={56} />
      </div>

      {/* Heading */}
      <p style={{
        fontSize:   16,
        fontWeight: 600,
        color:      c.text,
        margin:     "0 0 6px",
      }}>
        Select Your Branch
      </p>
      <p style={{
        fontSize:     13,
        color:        c.sub,
        margin:       "0 0 28px",
        lineHeight:   1.5,
      }}>
        Choose your engineering discipline to load the correct
        subjects and marks scheme.
      </p>

      {/* Branch grid */}
      <div
  className="branch-select-grid"
  style={{
    display:             "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))",
    gap:                 10,
    maxWidth:            620,
    margin:              "0 auto",
  }}
>
        {Object.entries(BRANCHES).map(([key, b]) => {
          const savedSems = hist[key]
            ? Object.values(hist[key]).filter(s => s.sgpa).length
            : 0;

          const totalSems = Object.keys(b.semesters).length;

          return (
            <BranchCard
              key={key}
              branchKey={key}
              branch={b}
              savedSems={savedSems}
              totalSems={totalSems}
              onSelect={() => setBranch(key)}
              c={c}
            />
          );
        })}
      </div>

      {/* Footer note */}
      <p style={{
        fontSize:   11,
        color:      c.muted,
        marginTop:  24,
        lineHeight: 1.5,
      }}>
        You can switch between branches anytime from the top bar.
        Progress is saved separately for each branch.
      </p>
    </div>
  );
}

// ─── Individual branch card ───────────────────────────────────────────────────
function BranchCard({ branch, savedSems, totalSems, onSelect, c }) {
  const hasProgress = savedSems > 0;
  const isComplete  = savedSems === totalSems;
  const progress    = Math.round((savedSems / totalSems) * 100);

  return (
    <button
      onClick={onSelect}
      style={{
        padding:       "16px 12px",
        background:    c.hover,
        border:        `2px solid ${c.border}`,
        borderRadius:  10,
        cursor:        "pointer",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           6,
        transition:    "border-color 0.15s, background 0.15s",
        width:         "100%",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = branch.color;
        e.currentTarget.style.background  = `${branch.color}11`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = c.border;
        e.currentTarget.style.background  = c.hover;
      }}
    >
      {/* Branch short name */}
      <span style={{
        fontSize:   22,
        fontWeight: 700,
        color:      branch.color,
      }}>
        {branch.short}
      </span>

      {/* Full branch name */}
      <span style={{
        fontSize:   11,
        color:      c.sub,
        lineHeight: 1.3,
        textAlign:  "center",
      }}>
        {branch.name}
      </span>

      {/* Progress indicator */}
      {hasProgress && (
        <div style={{ width: "100%", marginTop: 4 }}>
          {/* Progress bar */}
          <div style={{
            height:       4,
            background:   c.border,
            borderRadius: 2,
            overflow:     "hidden",
            marginBottom: 4,
          }}>
            <div style={{
              height:       "100%",
              width:        `${progress}%`,
              background:   isComplete ? c.ok : branch.color,
              borderRadius: 2,
              transition:   "width 0.3s ease",
            }} />
          </div>

          {/* Saved count */}
          <span style={{
            fontSize:   10,
            color:      isComplete ? c.ok : c.muted,
            fontWeight: isComplete ? 600 : 400,
          }}>
            {isComplete
              ? "All semesters saved ✓"
              : `${savedSems} / ${totalSems} semesters saved`}
          </span>
        </div>
      )}
    </button>
  );
}