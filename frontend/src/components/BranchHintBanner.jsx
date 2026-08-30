import { memo, useCallback } from "react";
import { useTheme }   from "../context/ThemeContext";
import { useAppData } from "../context/AppDataContext";
import { BRANCHES }          from "../data/branches";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";

const COPY = {
  engineering: {
    emoji:      "⚙️",
    noun:       "branch",
    Noun:       "Branch",
    accentColor:"#6d28d9",
    solidBg: {
      dark:  "#13103d",
      light: "#f3f0ff",
    },
    border:        (dark) => dark ? "rgba(124,131,245,0.35)" : "rgba(109,40,217,0.25)",
    mobileSection: "Current Branch",
  },
  pharmacy: {
    emoji:      "💊",
    noun:       "programme",
    Noun:       "Programme",
    accentColor:"#0ea5e9",
    solidBg: {
      dark:  "#0b1929",
      light: "#ecf7fe",
    },
    border:        (dark) => dark ? "rgba(14,165,233,0.35)" : "rgba(14,165,233,0.25)",
    mobileSection: "Current Programme",
  },
};

const BranchHintBanner = memo(function BranchHintBanner() {
  const { branch, faculty, setShowBranchHint } = useAppData();
  const { c, dark } = useTheme();

  const dismiss = useCallback(() => setShowBranchHint(false), [setShowBranchHint]);

  const branchInfo  = faculty === "pharmacy"
    ? PHARMACY_BRANCHES[branch]
    : BRANCHES[branch];

  const branchName  = branchInfo?.name  || branch || "default";
  const branchShort = branchInfo?.short || branch || "branch";
  const copy        = COPY[faculty] || COPY.engineering;
  const accentColor = copy.accentColor;

  return (
    // Normal in-flow element — no sticky/fixed, no overlap, scrolls away naturally
    <div style={{
      background:   dark ? copy.solidBg.dark : copy.solidBg.light,
      border:       `1px solid ${copy.border(dark)}`,
      borderRadius: 12,
      padding:      "14px 18px",
      marginBottom: 4,
    }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "flex-start", gap: 12 }}>

        {/* Icon */}
        <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.4 }}>{copy.emoji}</span>

        {/* Message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: c.text }}>
            Showing{" "}
            <span style={{ color: accentColor }}>{branchName}</span>
            {" "}by default
          </p>

          {/* Desktop — hidden on mobile */}
          <p className="branch-hint-desktop" style={{ margin: "0 0 4px", fontSize: 12, color: c.sub, lineHeight: 1.6 }}>
            <strong style={{ color: c.text }}>💻 On laptop / desktop:</strong>{" "}
            Click the{" "}
            <span style={{
              background:   dark ? `${accentColor}25` : `${accentColor}18`,
              color:        accentColor,
              padding:      "1px 8px",
              borderRadius: 5,
              fontWeight:   700,
              fontSize:     11,
            }}>
              {branchShort} ▾
            </span>
            {" "}button on the{" "}
            <strong style={{ color: c.text }}>left side of the bar below this</strong>,
            right next to the tab strip. Click it to see all{" "}
            {faculty === "engineering" ? "7 engineering branches" : "3 pharmacy programmes"}{" "}
            and switch instantly.
          </p>

          {/* Mobile — hidden on desktop */}
          <p className="branch-hint-mobile" style={{ margin: 0, fontSize: 12, color: c.sub, lineHeight: 1.6 }}>
            <strong style={{ color: c.text }}>📱 On mobile:</strong>{" "}
            Tap your{" "}
            <span style={{
              background:   "linear-gradient(135deg,#6d28d9,#a78bfa)",
              color:        "#fff",
              padding:      "1px 7px",
              borderRadius: 99,
              fontWeight:   700,
              fontSize:     11,
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
            background: "transparent",
            border:     "none",
            cursor:     "pointer",
            color:      c.muted,
            fontSize:   18,
            lineHeight: 1,
            flexShrink: 0,
            padding:    "2px 4px",
            borderRadius: 6,
            transition: "color 0.15s",
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