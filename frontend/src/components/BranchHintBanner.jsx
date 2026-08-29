import { memo, useCallback } from "react";
import { useTheme }   from "../context/ThemeContext";
import { useAppData } from "../context/AppDataContext";
import { BRANCHES }          from "../data/branches";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";

// Messaging per faculty
const COPY = {
  engineering: {
    emoji:      "⚙️",
    noun:       "branch",
    Noun:       "Branch",
    accentColor:"#6d28d9",
    accentBg:   (dark) => dark ? "linear-gradient(135deg,rgba(109,40,217,0.15),rgba(124,131,245,0.08))" : "linear-gradient(135deg,rgba(109,40,217,0.07),rgba(124,131,245,0.04))",
    border:     (dark) => dark ? "rgba(124,131,245,0.3)" : "rgba(109,40,217,0.2)",
    mobileSection: "Current Branch",
  },
  pharmacy: {
    emoji:      "💊",
    noun:       "programme",
    Noun:       "Programme",
    accentColor:"#0ea5e9",
    accentBg:   (dark) => dark ? "linear-gradient(135deg,rgba(14,165,233,0.15),rgba(8,145,178,0.1))" : "linear-gradient(135deg,rgba(14,165,233,0.07),rgba(8,145,178,0.04))",
    border:     (dark) => dark ? "rgba(14,165,233,0.3)" : "rgba(14,165,233,0.2)",
    mobileSection: "Current Programme",
  },
};

const BranchHintBanner = memo(function BranchHintBanner() {
  const { branch, faculty, setShowBranchHint } = useAppData();
  const { c, dark } = useTheme();

  const dismiss = useCallback(() => setShowBranchHint(false), [setShowBranchHint]);

  // Resolve branch display info — checks both branch registries
  const branchInfo = faculty === "pharmacy"
    ? PHARMACY_BRANCHES[branch]
    : BRANCHES[branch];

  const branchName  = branchInfo?.name  || branch || "default";
  const branchShort = branchInfo?.short || branch || "branch";
  const copy        = COPY[faculty] || COPY.engineering;
  const accentColor = copy.accentColor;

  return (
    <div style={{
      position:     "sticky",
      top:          57,
      zIndex:       90,
      background:   copy.accentBg(dark),
      borderBottom: `1px solid ${copy.border(dark)}`,
      padding:      "12px 20px",
    }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "flex-start", gap: 12 }}>

        {/* Icon */}
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.5 }}>{copy.emoji}</span>

        {/* Message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 5px", fontSize: 13, fontWeight: 700, color: c.text }}>
            Showing{" "}
            <span style={{ color: accentColor }}>{branchName}</span>
            {" "}by default
          </p>

          {/* Desktop instruction — hidden on mobile via CSS */}
          <p className="branch-hint-desktop" style={{ margin: "0 0 3px", fontSize: 12, color: c.sub, lineHeight: 1.6 }}>
            <strong style={{ color: c.text }}>💻 On laptop / desktop:</strong>{" "}
            Click the{" "}
            <span style={{
              background:   dark ? `${accentColor}20` : `${accentColor}15`,
              color:        accentColor,
              padding:      "1px 7px",
              borderRadius: 4,
              fontWeight:   700,
              fontSize:     11,
            }}>
              {branchShort} ▾
            </span>
            {" "}button in the bar just below this — it's on the{" "}
            <strong style={{ color: c.text }}>left side</strong>, right next to the tab strip.
            Click it to see all{" "}
            {faculty === "engineering" ? "7 engineering branches" : "3 pharmacy programmes"}
            {" "}and switch instantly.
          </p>

          {/* Mobile instruction — hidden on desktop via CSS */}
          <p className="branch-hint-mobile" style={{ margin: 0, fontSize: 12, color: c.sub, lineHeight: 1.6 }}>
            <strong style={{ color: c.text }}>📱 On mobile:</strong>{" "}
            Tap your{" "}
            <span style={{
              background:  "linear-gradient(135deg,#6d28d9,#a78bfa)",
              color:       "#fff",
              padding:     "1px 7px",
              borderRadius: 99,
              fontWeight:  700,
              fontSize:    11,
            }}>
              initials
            </span>
            {" "}button at the{" "}
            <strong style={{ color: c.text }}>top right</strong>
            {" "}→ tap{" "}
            <strong style={{ color: c.text }}>"{copy.mobileSection}"</strong>
            {" "}to expand the list → choose your {copy.noun}.
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: c.muted, fontSize: 18, lineHeight: 1, flexShrink: 0,
            padding: "2px 4px", borderRadius: 6, transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = c.text}
          onMouseLeave={e => e.currentTarget.style.color = c.muted}
        >
          ✕
        </button>
      </div>
    </div>
  );
});

export default BranchHintBanner;