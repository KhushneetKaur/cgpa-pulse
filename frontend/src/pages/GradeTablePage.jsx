import { memo, useState, useEffect } from "react";
import { useTheme }   from "../context/ThemeContext";
import { useAppData } from "../context/AppDataContext";
import {
  ENGINEERING_GRADES,
  PHARMACY_GRADES,
} from "../data/gradeTable";

// ── Mark structures per faculty ───────────────────────────────────────────────
const ENG_MARK_STRUCTURES = [
  { label: "Theory",           int: 40, ext: 60, total: 100, pass: "≥40 combined" },
  { label: "Lab / Practical", int: 60, ext: 40, total: 100, pass: "≥40 combined" },
  { label: "Project / Thesis",int: 100,ext: 0,  total: 100, pass: "≥40 combined" },
];

const PHARM_MARK_STRUCTURES = [
  { label: "Theory (standard)",               int: 25,  ext: 75,  total: 100, pass: "≥50% separately" },
  { label: "Practical / Lab (standard)",      int: 15,  ext: 35,  total: 50,  pass: "≥25 out of 50"   },
  { label: "NUE Theory — Comm / Remedial",    int: 15,  ext: 35,  total: 50,  pass: "≥25 out of 50"   },
  { label: "NUE Theory — Computer / Env Sci", int: 25,  ext: 50,  total: 75,  pass: "≥37.5 out of 75" },
  { label: "NUE Practical (small)",           int: 10,  ext: 15,  total: 25,  pass: "≥12.5 out of 25" },
  { label: "Practice School (Sem 7)",         int: 25,  ext: 125, total: 150, pass: "≥75 out of 150"  },
  { label: "Project Work (Sem 8)",            int: 0,   ext: 150, total: 150, pass: "≥75 out of 150"  },
];

// ── Custom Hook for Mobile Detection ─────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return isMobile;
}

// ── Grade Row Component ──────────────────────────────────────────────────────
const GradeRow = memo(function GradeRow({ g, isPharmacy, idx, isMobile }) {
  const { c, dark, scoreClr } = useTheme();

  const isPass = g.points >= (isPharmacy ? 6 : 4);
  const isFail = g.points === 0;
  const isTop  = idx === 0;

  const getPerformanceLabel = (points) => {
    if (points >= 9) return "Outstanding";
    if (points >= 7) return "Excellent";
    if (points >= 5) return "Good";
    if (points >= 4) return "Average";
    return "Fail";
  };

  // Mobile Stacked Card View
  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "10px 14px",
          borderRadius: 10,
          background: isFail
            ? dark ? "rgba(248,113,113,0.06)" : "rgba(220,38,38,0.04)"
            : isTop
            ? dark ? "rgba(45,212,170,0.08)" : "rgba(5,150,105,0.05)"
            : idx % 2 === 0 ? c.hover : "transparent",
          border: `1px solid ${
            isFail ? `${c.bad}25` : isTop ? `${c.ok}25` : c.border
          }`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: isFail ? c.bad : scoreClr(g.points) }}>
              {g.grade}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.sub }}>
              ({g.points} {g.points === 1 ? "Pt" : "Pts"})
            </span>
          </div>

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 99,
              background: isFail ? `${c.bad}15` : isPass ? `${c.ok}12` : `${c.warn}12`,
              color: isFail ? c.bad : isPass ? c.ok : c.warn,
            }}
          >
            {isFail ? "Fail" : isPass ? "Pass" : "Borderline"}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
          <span style={{ color: c.muted, fontWeight: 500 }}>
            Marks: <strong style={{ color: c.text }}>{isPharmacy ? `${g.min}%+` : g.label}</strong>
          </span>
          {!isPharmacy && (
            <span style={{ color: c.muted, fontStyle: "italic" }}>
              {getPerformanceLabel(g.points)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Desktop Table Grid View
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isPharmacy ? "1fr 1fr 1.5fr 1fr" : "1fr 1fr 1.5fr 1fr 1fr",
        gap: 12,
        padding: "12px 18px",
        borderRadius: 10,
        background: isFail
          ? dark ? "rgba(248,113,113,0.06)" : "rgba(220,38,38,0.04)"
          : isTop
          ? dark ? "rgba(45,212,170,0.08)" : "rgba(5,150,105,0.05)"
          : idx % 2 === 0 ? c.hover : "transparent",
        border: `1px solid ${
          isFail ? `${c.bad}25` : isTop ? `${c.ok}25` : "transparent"
        }`,
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 20, fontWeight: 900, color: isFail ? c.bad : scoreClr(g.points) }}>
        {g.grade}
      </span>

      <span style={{ fontSize: 16, fontWeight: 700, color: isFail ? c.bad : scoreClr(g.points) }}>
        {g.points}
      </span>

      <span style={{ fontSize: 13, color: c.sub, fontWeight: 500 }}>
        {isPharmacy ? `${g.min}%+` : g.label}
      </span>

      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: "3px 10px",
          borderRadius: 99,
          background: isFail ? `${c.bad}15` : isPass ? `${c.ok}12` : `${c.warn}12`,
          color: isFail ? c.bad : isPass ? c.ok : c.warn,
          textAlign: "center",
          width: "fit-content",
        }}
      >
        {isFail ? "Fail" : isPass ? "Pass" : "Borderline"}
      </span>

      {!isPharmacy && (
        <span style={{ fontSize: 12, color: c.muted }}>
          {getPerformanceLabel(g.points)}
        </span>
      )}
    </div>
  );
});

// ── Mark Structure Row Component ─────────────────────────────────────────────
const MarkStructureRow = memo(function MarkStructureRow({ s, idx, isMobile }) {
  const { c, dark } = useTheme();

  // Mobile Stacked View
  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "10px 14px",
          borderRadius: 8,
          background: idx % 2 === 0 ? c.hover : "transparent",
          border: `1px solid ${c.border}`,
        }}
      >
        <span style={{ fontSize: 13, color: c.text, fontWeight: 700 }}>
          {s.label}
        </span>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ color: c.muted }}>Int: <strong style={{ color: c.accent }}>{s.int}</strong></span>
            <span style={{ color: c.muted }}>Ext: <strong style={{ color: c.accent }}>{s.ext}</strong></span>
            <span style={{ color: c.muted }}>Total: <strong style={{ color: c.text }}>{s.total}</strong></span>
          </div>
          <span style={{ color: c.ok, fontWeight: 600, fontSize: 10 }}>{s.pass}</span>
        </div>
      </div>
    );
  }

  // Desktop Table Grid View
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 60px 60px 60px 1.5fr",
        gap: 12,
        padding: "11px 18px",
        borderRadius: 8,
        background: idx % 2 === 0 ? c.hover : "transparent",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 13, color: c.text, fontWeight: 500 }}>{s.label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: c.accent, textAlign: "center" }}>{s.int}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: c.accent, textAlign: "center" }}>{s.ext}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: c.text, textAlign: "center" }}>{s.total}</span>
      <span style={{ fontSize: 11, color: c.ok, fontWeight: 600 }}>{s.pass}</span>
    </div>
  );
});

// ── Main Page Component ───────────────────────────────────────────────────────
export default function GradeTablePage() {
  const { faculty } = useAppData();
  const { c, dark, cardSty } = useTheme();
  const isMobile = useIsMobile();

  const isPharmacy     = faculty === "pharmacy";
  const grades         = isPharmacy ? PHARMACY_GRADES : ENGINEERING_GRADES;
  const markStructures = isPharmacy ? PHARM_MARK_STRUCTURES : ENG_MARK_STRUCTURES;
  const colHeaders     = isPharmacy
    ? ["Grade", "Points", "% Marks", "Status"]
    : ["Grade", "Points", "Marks Range", "Status", "Performance"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 20 }}>
      
      {/* ── Header Card ─────────────────────────────────────────── */}
      <div
        style={{
          background: dark
            ? "linear-gradient(135deg, rgba(109,40,217,0.15), rgba(6,182,212,0.08))"
            : "linear-gradient(135deg, rgba(109,40,217,0.06), rgba(6,182,212,0.04))",
          border: `1px solid ${dark ? "rgba(124,131,245,0.25)" : "rgba(109,40,217,0.15)"}`,
          borderRadius: 14,
          padding: isMobile ? "14px 16px" : "20px 24px",
        }}
      >
        <p style={{ margin: "0 0 6px", fontSize: isMobile ? 17 : 20, fontWeight: 800, color: c.text }}>
          {isPharmacy ? "📋 Pharmacy Grading System" : "📋 Engineering Grading System"}
        </p>
        <p style={{ margin: 0, fontSize: isMobile ? 12 : 13, color: c.sub, lineHeight: 1.5 }}>
          {isPharmacy
            ? "PCI/UGC-CBCS — grades based on percentage of total marks. Pass: ≥50% in theory AND practical separately."
            : "MRSPTU B.Tech — grades based on total marks out of 100. Pass: ≥40 marks combined."}
        </p>

        <div
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)",
            borderRadius: 8,
            fontSize: isMobile ? 11 : 12,
            color: c.sub,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: c.text }}>SGPA:</strong> Σ(GP × Credits) ÷ Total Credits
          {!isMobile && <br />}
          <span style={{ display: isMobile ? "block" : "inline", marginTop: isMobile ? 4 : 0, marginLeft: isMobile ? 0 : 12 }}>
            <strong style={{ color: c.text }}>CGPA:</strong> Σ(SGPA × Sem Credits) ÷ Total Credits
          </span>
        </div>
      </div>

      {/* ── Grade Table Card ────────────────────────────────────── */}
      <div style={{ ...cardSty(), padding: isMobile ? 12 : 16 }}>
        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, fontWeight: 700, color: c.text }}>
            Grade Points Scale
          </p>
          <p style={{ margin: "2px 0 0", fontSize: isMobile ? 11 : 12, color: c.muted }}>
            {isPharmacy ? "Boundaries are percentages" : "Boundaries are raw marks out of 100"}
          </p>
        </div>

        {/* Desktop Header Row (Hidden on Mobile) */}
        {!isMobile && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isPharmacy ? "1fr 1fr 1.5fr 1fr" : "1fr 1fr 1.5fr 1fr 1fr",
              gap: 12,
              padding: "8px 18px",
              borderBottom: `1px solid ${c.border}`,
            }}
          >
            {colHeaders.map((h) => (
              <p key={h} style={{ margin: 0, fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase" }}>
                {h}
              </p>
            ))}
          </div>
        )}

        {/* Rows List */}
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 4, marginTop: 4 }}>
          {grades.map((g, i) => (
            <GradeRow key={g.grade} g={g} isPharmacy={isPharmacy} idx={i} isMobile={isMobile} />
          ))}
        </div>

        {isPharmacy && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 8, fontSize: 11, color: "#0ea5e9" }}>
            ⚕️ Must score ≥50% in theory AND practical separately.
          </div>
        )}
      </div>

      {/* ── Mark Structures Card ────────────────────────────────── */}
      <div style={{ ...cardSty(), padding: isMobile ? 12 : 16 }}>
        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, fontWeight: 700, color: c.text }}>Marks Structure</p>
          <p style={{ margin: "2px 0 0", fontSize: isMobile ? 11 : 12, color: c.muted }}>Internal assessment + External exams</p>
        </div>

        {/* Desktop Header Row (Hidden on Mobile) */}
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 60px 60px 60px 1.5fr", gap: 12, padding: "8px 18px", borderBottom: `1px solid ${c.border}` }}>
            {["Subject Type", "Int", "Ext", "Total", "Pass Mark"].map((h) => (
              <p key={h} style={{ margin: 0, fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", textAlign: h !== "Subject Type" && h !== "Pass Mark" ? "center" : "left" }}>
                {h}
              </p>
            ))}
          </div>
        )}

        {/* Rows List */}
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 4, marginTop: 4 }}>
          {markStructures.map((s, i) => (
            <MarkStructureRow key={s.label} s={s} idx={i} isMobile={isMobile} />
          ))}
        </div>
      </div>

    </div>
  );
}