import { memo, useCallback } from "react";
import { useTheme }   from "../context/ThemeContext";
import { useAppData } from "../context/AppDataContext";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";

const BranchHintBanner = memo(function BranchHintBanner() {
  const { branch, setShowBranchHint } = useAppData();
  const { c, dark } = useTheme();

  const dismiss = useCallback(() => setShowBranchHint(false), [setShowBranchHint]);

  const branchName = PHARMACY_BRANCHES[branch]?.name || branch || "B.Pharm";
  const branchShort = PHARMACY_BRANCHES[branch]?.short || branch || "B.Pharm";

  return (
    <div style={{
      position:   "sticky",
      top:        57,           // sits just below the sticky NavBar top bar
      zIndex:     90,           // below NavBar (100) but above content
      background: dark
        ? "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(8,145,178,0.1))"
        : "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(8,145,178,0.05))",
      borderBottom: `1px solid ${dark ? "rgba(14,165,233,0.3)" : "rgba(14,165,233,0.2)"}`,
      padding:    "10px 20px",
    }}>
      <div style={{
        maxWidth:   1080,
        margin:     "0 auto",
        display:    "flex",
        alignItems: "flex-start",
        gap:        12,
      }}>

        {/* Icon */}
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>💊</span>

        {/* Message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: c.text }}>
            Showing <span style={{ color: "#0ea5e9" }}>{branchName}</span> by default
          </p>

          {/* Desktop instruction */}
          <p className="branch-hint-desktop" style={{ margin: "0 0 3px", fontSize: 12, color: c.sub, lineHeight: 1.5 }}>
            <strong style={{ color: c.text }}>💻 On laptop/desktop:</strong>{" "}
            Click the <span style={{ background: dark ? "rgba(14,165,233,0.15)" : "rgba(14,165,233,0.1)", color: "#0ea5e9", padding: "1px 6px", borderRadius: 4, fontWeight: 600, fontSize: 11 }}>{branchShort} ▾</span>{" "}
            button in the bar just below this — it's on the left side, next to the tabs.
          </p>

          {/* Mobile instruction */}
          <p className="branch-hint-mobile" style={{ margin: 0, fontSize: 12, color: c.sub, lineHeight: 1.5 }}>
            <strong style={{ color: c.text }}>📱 On mobile:</strong>{" "}
            Tap your <span style={{ background: "linear-gradient(135deg,#6d28d9,#a78bfa)", color: "#fff", padding: "1px 7px", borderRadius: 99, fontWeight: 700, fontSize: 11 }}>initials</span>{" "}
            avatar at the top right → tap <strong style={{ color: c.text }}>"Current Programme"</strong> to expand → choose Pharm.D or M.Pharm.
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          style={{
            background:   "transparent",
            border:       "none",
            cursor:       "pointer",
            color:        c.muted,
            fontSize:     18,
            lineHeight:   1,
            flexShrink:   0,
            padding:      "2px 4px",
            borderRadius: 6,
            transition:   "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = c.text}
          onMouseLeave={e => e.currentTarget.style.color = c.muted}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

export default BranchHintBanner;