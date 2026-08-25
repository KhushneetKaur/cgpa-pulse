import { memo } from "react";
import { useTheme }   from "../context/ThemeContext";
import { useAppData } from "../context/AppDataContext";
import {
  ENGINEERING_GRADES,
  PHARMACY_GRADES,
  getMaxMarks,
} from "../data/gradeTable";

// ── Mark structures per faculty ───────────────────────────────────────────────
const ENG_MARK_STRUCTURES = [
  { label: "Theory",          int: 40, ext: 60, total: 100, pass: "≥40 combined" },
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

// ── Grade row ─────────────────────────────────────────────────────────────────
const GradeRow = memo(function GradeRow({ g, isPharmacy, idx }) {
  const { c, dark, scoreClr } = useTheme();

  const isPass = g.points >= (isPharmacy ? 6 : 4); // D = 6 pharmacy, E = 4 engineering
  const isFail = g.points === 0;
  const isTop  = idx === 0;

  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: isPharmacy ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr 1fr 1fr",
      gap:                 12,
      padding:             "13px 18px",
      borderRadius:        10,
      background:          isFail
        ? dark ? "rgba(248,113,113,0.06)" : "rgba(220,38,38,0.04)"
        : isTop
        ? dark ? "rgba(45,212,170,0.08)" : "rgba(5,150,105,0.05)"
        : idx % 2 === 0 ? c.hover : "transparent",
      border:              `1px solid ${
        isFail ? `${c.bad}25` : isTop ? `${c.ok}25` : "transparent"
      }`,
      alignItems:          "center",
    }}>
      {/* Grade letter */}
      <span style={{
        fontSize:   22,
        fontWeight: 900,
        color:      isFail ? c.bad : scoreClr(g.points),
        letterSpacing: -0.5,
      }}>
        {g.grade}
      </span>

      {/* Grade points */}
      <span style={{
        fontSize:   18,
        fontWeight: 700,
        color:      isFail ? c.bad : scoreClr(g.points),
      }}>
        {g.points}
      </span>

      {/* Mark range */}
      <span style={{ fontSize: 13, color: c.sub, fontWeight: 500 }}>
        {isPharmacy ? `${g.min}%+` : g.label}
      </span>

      {/* Pass/Fail */}
      <span style={{
        fontSize:     11,
        fontWeight:   700,
        padding:      "3px 10px",
        borderRadius: 99,
        background:   isFail
          ? `${c.bad}15`
          : isPass
          ? `${c.ok}12`
          : `${c.warn}12`,
        color:        isFail ? c.bad : isPass ? c.ok : c.warn,
        whiteSpace:   "nowrap",
        textAlign:    "center",
      }}>
        {isFail ? "Fail" : isPass ? "Pass" : "Borderline"}
      </span>

      {/* Performance label — engineering only (one extra column) */}
      {!isPharmacy && (
        <span style={{ fontSize: 11, color: c.muted }}>
          {g.points >= 9  ? "Outstanding"
         : g.points >= 7  ? "Excellent"
         : g.points >= 5  ? "Good"
         : g.points >= 4  ? "Average"
         : "Fail"}
        </span>
      )}
    </div>
  );
});

// ── Mark structure row ────────────────────────────────────────────────────────
const MarkStructureRow = memo(function MarkStructureRow({ s, idx }) {
  const { c, dark } = useTheme();
  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "2fr 60px 60px 60px 1fr",
      gap:                 12,
      padding:             "11px 18px",
      borderRadius:        8,
      background:          idx % 2 === 0 ? c.hover : "transparent",
      alignItems:          "center",
    }}>
      <span style={{ fontSize: 13, color: c.text, fontWeight: 500 }}>{s.label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: c.accent, textAlign: "center" }}>{s.int}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: c.accent, textAlign: "center" }}>{s.ext}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: c.text, textAlign: "center" }}>{s.total}</span>
      <span style={{ fontSize: 11, color: c.ok, fontWeight: 600 }}>{s.pass}</span>
    </div>
  );
});

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GradeTablePage() {
  const { faculty } = useAppData();
  const { c, dark, cardSty, scoreClr } = useTheme();

  const isPharmacy    = faculty === "pharmacy";
  const grades        = isPharmacy ? PHARMACY_GRADES : ENGINEERING_GRADES;
  const markStructures = isPharmacy ? PHARM_MARK_STRUCTURES : ENG_MARK_STRUCTURES;
  const colHeaders    = isPharmacy
    ? ["Grade", "Points", "% Marks", "Status"]
    : ["Grade", "Points", "Marks Range", "Status", "Performance"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header card ──────────────────────────────────────────── */}
      <div style={{
        background:   dark
          ? "linear-gradient(135deg, rgba(109,40,217,0.15), rgba(6,182,212,0.08))"
          : "linear-gradient(135deg, rgba(109,40,217,0.06), rgba(6,182,212,0.04))",
        border:       `1px solid ${dark ? "rgba(124,131,245,0.25)" : "rgba(109,40,217,0.15)"}`,
        borderRadius: 16,
        padding:      "20px 24px",
      }}>
        <p style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: c.text }}>
          {isPharmacy ? "📋 Pharmacy Grading System" : "📋 Engineering Grading System"}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: c.sub, lineHeight: 1.6 }}>
          {isPharmacy
            ? "PCI/UGC-CBCS — grades based on percentage of total marks. O = Outstanding (highest). Pass: ≥50% in theory AND practical separately."
            : "MRSPTU B.Tech — grades based on total marks out of 100. A+ = highest grade. Pass: ≥40 marks combined."}
        </p>

        {/* SGPA formula */}
        <div style={{
          marginTop:    14,
          padding:      "10px 14px",
          background:   dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)",
          borderRadius: 10,
          fontSize:     13,
          color:        c.sub,
          lineHeight:   1.7,
        }}>
          <strong style={{ color: c.text }}>SGPA formula:</strong>
          {" Σ(Grade Points × Credits) ÷ Total Credits"}
          <br />
          <strong style={{ color: c.text }}>CGPA formula:</strong>
          {" Σ(SGPA × Semester Credits) ÷ Total Credits across all semesters"}
        </div>
      </div>

      {/* ── Grade table card ──────────────────────────────────────── */}
      <div style={{ ...cardSty(), padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px 12px", borderBottom: `1px solid ${c.border}`, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.text }}>
            Grade Points Scale
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: c.muted }}>
            {isPharmacy
              ? "Boundaries are percentages — applies to all subject types regardless of total marks"
              : "Boundaries are raw total marks out of 100"}
          </p>
        </div>

        {/* Column headers */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: isPharmacy ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr 1fr 1fr",
          gap:                 12,
          padding:             "10px 18px",
          borderBottom:        `1px solid ${c.border}`,
        }}>
          {colHeaders.map(h => (
            <p key={h} style={{ margin: 0, fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>
              {h}
            </p>
          ))}
        </div>

        <div style={{ padding: "8px 0" }}>
          {grades.map((g, i) => (
            <GradeRow key={g.grade} g={g} isPharmacy={isPharmacy} idx={i} />
          ))}
        </div>

        {/* Pharmacy special note */}
        {isPharmacy && (
          <div style={{ margin: "0 12px 12px", padding: "10px 14px", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 10, fontSize: 12, color: "#0ea5e9", lineHeight: 1.6 }}>
            ⚕️ <strong>Dual pass condition:</strong> A student must score ≥50% in theory AND ≥50% in practical separately to pass. Scoring well in theory cannot compensate for failing a practical.
          </div>
        )}
      </div>

      {/* ── Mark structures card ──────────────────────────────────── */}
      <div style={{ ...cardSty(), padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px 12px", borderBottom: `1px solid ${c.border}`, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.text }}>Marks Structure</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: c.muted }}>Internal assessment + End semester examination</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 60px 60px 60px 1fr", gap: 12, padding: "10px 18px", borderBottom: `1px solid ${c.border}` }}>
          {["Subject Type", "Int", "Ext", "Total", "Pass Mark"].map(h => (
            <p key={h} style={{ margin: 0, fontSize: 10, fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: 0.8, textAlign: h !== "Subject Type" && h !== "Pass Mark" ? "center" : "left" }}>
              {h}
            </p>
          ))}
        </div>

        <div style={{ padding: "8px 0" }}>
          {markStructures.map((s, i) => <MarkStructureRow key={s.label} s={s} idx={i} />)}
        </div>

        {/* NUE note — pharmacy only */}
        {isPharmacy && (
          <div style={{ margin: "0 12px 12px", padding: "10px 14px", background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 11, color: c.muted, lineHeight: 1.6 }}>
            <strong style={{ color: c.sub }}>NUE</strong> = Non-University Examination (assessed by the college internally). Marks are still included in SGPA calculation.
          </div>
        )}
      </div>
    </div>
  );
}