import { memo, useCallback } from "react";
import { useTheme }   from "../context/ThemeContext";
import { useAppData } from "../context/AppDataContext";
import MRSPTULogo     from "../components/MRSPTULogo";

const DEPARTMENTS = [
  {
    key:     "engineering",
    emoji:   "⚙️",
    title:   "Engineering",
    sub:     "B.Tech",
    desc:    "CSE · AIML · ECE · EE · ME · Civil · TE",
    color:   "#6d28d9",
    bgLight: "rgba(109,40,217,0.06)",
    bgDark:  "rgba(124,131,245,0.08)",
    border:  "rgba(109,40,217,0.2)",
  },
  {
    key:     "pharmacy",
    emoji:   "💊",
    title:   "University Departments",
    sub:     "Pharmacy",
    desc:    "B.Pharm · Pharm.D · M.Pharm",
    color:   "#0ea5e9",
    bgLight: "rgba(14,165,233,0.06)",
    bgDark:  "rgba(14,165,233,0.08)",
    border:  "rgba(14,165,233,0.2)",
  },
];

// No props needed — setFaculty comes from context
export default function DepartmentPickerPage() {
  const { setFaculty } = useAppData();
  const { c, dark, cardSty } = useTheme();

  const handlePick = useCallback((key) => setFaculty(key), [setFaculty]);

  return (
    <div style={{ ...cardSty(), textAlign: "center", padding: "2.5rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <MRSPTULogo size={56} />
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: c.text, margin: "0 0 6px" }}>
        MRSPTU Bathinda
      </h2>
      <p style={{ fontSize: 13, color: c.sub, margin: "0 0 32px", lineHeight: 1.5 }}>
        Select your programme to get started.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 480, margin: "0 auto" }}>
        {DEPARTMENTS.map(d => (
          <DeptCard key={d.key} dept={d} onPick={handlePick} />
        ))}
      </div>

      <p style={{ fontSize: 11, color: c.muted, marginTop: 28, lineHeight: 1.5 }}>
        More programmes coming soon. You can switch anytime from your profile.
      </p>
    </div>
  );
}

const DeptCard = memo(function DeptCard({ dept, onPick }) {
  const { c, dark } = useTheme();

  const handleClick = useCallback(() => onPick(dept.key), [onPick, dept.key]);

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        padding:       "24px 16px",
        borderRadius:  14,
        border:        `1.5px solid ${dept.border}`, // ← fixed: was dark ? border : border
        background:    dark ? dept.bgDark : dept.bgLight,
        cursor:        "pointer",
        fontFamily:    "inherit",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           10,
        transition:    "all 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = "translateY(-3px)";
        e.currentTarget.style.boxShadow  = `0 8px 24px ${dept.border}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = "translateY(0)";
        e.currentTarget.style.boxShadow  = "none";
      }}
    >
      <span style={{ fontSize: 36, lineHeight: 1 }}>{dept.emoji}</span>

      <div>
        <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: dept.color }}>
          {dept.title}
        </p>
        <p style={{ margin: "0 0 6px", fontSize: 11, color: c.muted, fontWeight: 500 }}>
          {dept.sub}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: c.muted, lineHeight: 1.5 }}>
          {dept.desc}
        </p>
      </div>

      <div style={{ marginTop: 4, padding: "4px 12px", borderRadius: 99, background: dept.color, color: "#fff", fontSize: 11, fontWeight: 700 }}>
        Select →
      </div>
    </button>
  );
});