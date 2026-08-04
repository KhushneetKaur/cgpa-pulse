import { memo, useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme } from "../context/ThemeContext";
import { getGrade } from "../data/gradeTable";

// ── Badge  ────────────────────────────────────────────────────
const Badge = memo(function Badge({ color, bg, children }) {
  return (
    <span style={{
      fontSize:     11,
      color:        color,
      background:   bg,
      border:       `1px solid ${color}44`,
      borderRadius: 6,
      padding:      "2px 7px",
      fontWeight:   500,
    }}>
      {children}
    </span>
  );
});

// ── Single subject entry row  ───────────────────────────────────────
const SubjectEntry = memo(function SubjectEntry({ sub, marks, isBL, displayName, idx }) {
  const { c, scoreClr } = useTheme();

  const { iV, eV, tot, grade, isLab } = useMemo(() => {
    const entry = marks?.[sub.code] || {};
    const i = entry.int !== "" && entry.int !== undefined ? Number(entry.int) : null;
    const e = entry.ext !== "" && entry.ext !== undefined ? Number(entry.ext) : null;
    const t = i !== null && e !== null ? i + e : null;
    return {
      iV:    i,
      eV:    e,
      tot:   t,
      grade: getGrade(t),
      isLab: sub.type === "lab",
    };
  }, [marks, sub.code, sub.type]);

  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "1fr 28px 46px 46px 80px",
      gap:                 4,
      alignItems:          "center",
      padding:             "5px 8px",
      borderRadius:        8,
      background:          idx % 2 === 0 ? `${c.hover}88` : "transparent",
    }}>
      <span style={{ fontSize: 12, color: isBL ? c.bad : c.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: isBL ? 600 : 400 }}>
        {isBL ? "⚠ " : ""}{displayName}
      </span>
      <span style={{ fontSize: 9, fontWeight: 700, color: isLab ? c.ok : c.accent, textAlign: "center", letterSpacing: 0.2 }}>
        {isLab ? "LAB" : "TH"}
      </span>
      <span style={{ fontSize: 11, color: c.muted, textAlign: "center" }}>
        {iV !== null ? `I:${iV}` : "—"}
      </span>
      <span style={{ fontSize: 11, color: c.muted, textAlign: "center" }}>
        {eV !== null ? `E:${eV}` : "—"}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: grade ? scoreClr(grade.points) : c.muted, textAlign: "right" }}>
        {tot !== null ? `${tot} · ${grade?.grade || "—"}` : "—"}
      </span>
    </div>
  );
});

// ── Semester card  ──────────────────────────────────────────────────
const SemesterCard = memo(function SemesterCard({ sem, h, subs, semBLs, onEdit }) {
  const { bElectiveNames } = useAppData();
  const { c, btn, scoreClr } = useTheme();

  const isQuick   = h.mode === "quick";
  const isPartial = h.isPartial;

  // Memoize semBLs set for O(1) lookup instead of O(n) includes per subject
  const semBLSet = useMemo(() => new Set(semBLs), [semBLs]);

  return (
    <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 14, overflow: "hidden" }}>

      {/* Header */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        padding:        "12px 16px",
        borderBottom:   (!isQuick && subs.length) ? `1px solid ${c.border}` : "none",
        flexWrap:       "wrap",
        gap:            8,
      }}>
        {/* Left: title + badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>
            Semester {sem}
          </span>
          <span style={{ fontSize: 11, color: c.muted }}>
            saved {h.savedAt}
          </span>
          {isQuick && (
            <Badge color={c.accent} bg={c.accentLt}>⚡ quick entry</Badge>
          )}
          {isPartial && (
            <Badge color={c.warn} bg={`${c.warn}14`}>partial</Badge>
          )}
          {semBLs.length > 0 && (
            <Badge color={c.bad} bg={`${c.bad}14`}>
              ⚠ {semBLs.length} backlog{semBLs.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Right: SGPA + edit */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onEdit} style={{ ...btn("ghost"), fontSize: 11, padding: "4px 10px" }}>
            Edit SGPA
          </button>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 10, color: c.muted, fontWeight: 500 }}>SGPA</p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: scoreClr(h.sgpa), letterSpacing: -0.3 }}>
              {h.sgpa}
            </p>
          </div>
        </div>
      </div>

      {/* Subject breakdown */}
      {!isQuick && subs.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 0, padding: "4px 8px 8px" }}>
          {subs.map((sub, idx) => {
            const customName = bElectiveNames[sub.code];
            const displayName = customName && customName !== "__other__" ? customName : sub.name;
            return (
              <SubjectEntry
                key={sub.code}
                sub={sub}
                marks={h.marks}
                isBL={semBLSet.has(sub.code)}
                displayName={displayName}
                idx={idx}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

export default SemesterCard;