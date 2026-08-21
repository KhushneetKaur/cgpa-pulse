import { memo } from "react";
import { useTheme } from "../context/ThemeContext";
import { ENGINEERING_GRADES } from "../data/gradeTable";

// ── Module-level constants — never recreated ─────────────────────────────────
const GRID_COLS = "110px 90px 56px 72px 1fr";

const HEADERS = ["Marks Range", "Grade", "GP", "% Equiv", "Performance"];

const FORMULA_BOXES = [
  {
    icon:  "📗",
    title: "Theory Marks Scheme",
    body:  "Internal Assessment (MST) = 40 marks · End Semester Exam (ESE) = 60 marks · Total = 100 marks",
  },
  {
    icon:  "🔬",
    title: "Lab / Practical / Training Marks Scheme",
    body:  "Internal Assessment = 60 marks · External Viva / Practical Exam = 40 marks · Total = 100 marks",
  },
  {
    icon:  "📐",
    title: "SGPA Formula",
    body:  "Σ(Grade Points × Credits per subject) ÷ Total credits of ALL subjects in that semester. Unfilled subjects contribute 0 grade points but their credits still count in the denominator.",
  },
  {
    icon:  "📊",
    title: "CGPA Formula",
    body:  "Σ(Semester SGPA × Total semester credits) ÷ Σ(All saved semester credits). This is credit-weighted — not a simple average of SGPAs.",
  },
  {
    icon:  "💯",
    title: "Percentage Conversion (MRSPTU)",
    body:  "Percentage = CGPA × 10  (e.g. CGPA 8.5 = 85.0%)",
  },
];

const PERF_MAP = {
  10: "Outstanding",
  9:  "Excellent",
  8:  "Very Good",
  7:  "Good",
  6:  "Average",
  5:  "Pass",
  4:  "Marginal Pass",
  0:  "Fail — reappear required",
};

// ── Grade row — memoized, scoreClr computed once ─────────────────────────────
const GradeRow = memo(function GradeRow({ row }) {
  const { c, scoreClr } = useTheme();
  const color  = scoreClr(row.points);
  const isFail = row.grade === "F";

  return (
    <div
      className="grade-table-row"
      style={{
        display:             "grid",
        gridTemplateColumns: GRID_COLS,
        gap:                 12,
        padding:             "10px 12px",
        background:          isFail ? `${c.bad}08` : c.hover,
        borderRadius:        8,
        border:              isFail ? `1px solid ${c.bad}22` : "none",
        alignItems:          "center",
      }}
    >
      <span style={{ fontSize: 13, color: c.text, fontWeight: 500 }}>
        {row.label}
      </span>
      <span style={{ fontSize: 16, fontWeight: 700, color, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
        {row.grade}
        <span style={{ fontSize: 11, color: c.muted }}>({row.points} pts)</span>
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color }}>
        {row.points}
      </span>
      <span style={{ fontSize: 13, color: c.sub }}>
        {row.points > 0 ? `${row.points * 10}%` : "—"}
      </span>
      <span style={{ fontSize: 13, color: c.sub }}>
        {PERF_MAP[row.points]}
      </span>
    </div>
  );
});

// ── Formula box — memoized ────────────────────────────────────────────────────
const FormulaBox = memo(function FormulaBox({ box }) {
  const { c } = useTheme();
  return (
    <div style={{
      padding:      "12px 14px",
      background:   c.goldBg,
      borderRadius: 8,
      border:       `1px solid ${c.gold}33`,
      display:      "flex",
      gap:          12,
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{box.icon}</span>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: c.gold }}>
          {box.title}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: c.text, lineHeight: 1.6 }}>
          {box.body}
        </p>
      </div>
    </div>
  );
});

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GradeTablePage() {
  const { c, cardSty, scoreClr } = useTheme();
  const card = cardSty();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Grade scale table ─────────────────────────────────────── */}
      <div style={card}>
        <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: c.text }}>
          MRSPTU Grading Scale — B.Tech Engineering
        </p>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: c.sub }}>
          Official grade boundaries as per MRSPTU regulations.
          8 grades including E — no O grade in engineering.
        </p>

        {/* Header — columns now match row columns exactly */}
        <div
          className="grade-table-header"
          style={{
            display:             "grid",
            gridTemplateColumns: GRID_COLS,
            gap:                 12,
            padding:             "4px 12px",
            marginBottom:        4,
          }}
        >
          {HEADERS.map(h => (
            <span key={h} style={{ fontSize: 10, color: c.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {h}
            </span>
          ))}
        </div>

        {/* Grade rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {GRADE_TABLE.map(row => (
            <GradeRow key={row.grade} row={row} />
          ))}
        </div>

        {/* Note */}
        <div style={{
          marginTop:    12,
          padding:      "8px 12px",
          background:   c.goldBg,
          borderRadius: 8,
          border:       `1px solid ${c.gold}33`,
          fontSize:     12,
          color:        c.sub,
          lineHeight:   1.6,
        }}>
          <strong style={{ color: c.gold }}>Note:</strong>{" "}
          Grade E (40–45) is a passing grade worth 4 grade points.
          Grade D (46–50) is also passing, worth 5 points.
          Any marks below 40 result in F (Fail) and require reappear.
        </div>
      </div>

      {/* ── Formula boxes ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gap: 10 }}>
        {FORMULA_BOXES.map(box => (
          <FormulaBox key={box.title} box={box} />
        ))}
      </div>

    </div>
  );
}