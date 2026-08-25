import { memo, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme }   from "../context/ThemeContext";
import { getGrade, getMaxMarks } from "../data/gradeTable";
import { ELECTIVE_OPTIONS }    from "../data/electiveOptions";
import { PHARMACY_ELECTIVE_OPTIONS } from "../data/pharmacyBranches";


const SubjectRow = memo(function SubjectRow({ sub, selSem, branch }) {
  const {
    marks, changeMark,
    bElectiveNames, setElectiveName,
    bBacklogs, toggleBacklog,
    scheme,           
    subDisplayName,
  } = useAppData();

  const { c, inp, scoreClr } = useTheme();

  // ── Max marks — scheme-aware ───────────────────────────────────────────────
  // Engineering theory: 40/60 | Pharmacy theory: 25/75
  // Engineering lab:    60/40 | Pharmacy lab:    15/35
  const mx = getMaxMarks(sub.type, scheme);

  const entry    = marks[sub.code] || {};
  const intVal   = entry.int !== "" && entry.int !== undefined ? Number(entry.int) : null;
  const extVal   = entry.ext !== "" && entry.ext !== undefined ? Number(entry.ext) : null;
  const total    = intVal !== null && extVal !== null ? intVal + extVal : null;

  // Grade is percentage-based for pharmacy, raw-marks-based for engineering
  const maxTotal = mx.total || (mx.int + mx.ext) || 100;
  const grade    = getGrade(total, scheme, maxTotal);

  const isBacklog = (bBacklogs[selSem] || []).includes(sub.code);

  // ── Elective setup ─────────────────────────────────────────────────────────
  // Check both engineering and pharmacy elective option maps
  const electiveOpts = (
    ELECTIVE_OPTIONS?.[branch]?.[sub.code] ||
    PHARMACY_ELECTIVE_OPTIONS?.[sub.code]  ||
    []
  );
  const electiveName     = bElectiveNames[sub.code] || "";
  const isCustomElective = electiveName && !electiveOpts.includes(electiveName);
  const dropVal          = isCustomElective ? "__other__" : electiveName;

  // ── Handlers ───────────────────────────────────────────────────────────────
  // subType passed as 4th arg — AppDataContext.changeMark uses it to enforce scheme limits
  const handleIntChange = useCallback((e) =>
    changeMark(sub.code, "int", e.target.value, sub.type),
    [sub.code, sub.type, changeMark]
  );

  const handleExtChange = useCallback((e) =>
    changeMark(sub.code, "ext", e.target.value, sub.type),
    [sub.code, sub.type, changeMark]
  );

  const handleBacklog = useCallback(() =>
    toggleBacklog(selSem, sub.code),
    [toggleBacklog, selSem, sub.code]
  );

  const handleElectiveChange = useCallback((e) =>
    setElectiveName(sub.code, e.target.value),
    [setElectiveName, sub.code]
  );

  const isLab     = sub.type === "lab" || sub.type.includes("lab");
  const isProject = sub.type === "project" || sub.type === "practice-school";

  const inputStyle = (val, maxVal) => ({
    ...inp(),
    width:     "100%",
    textAlign: "center",
    fontSize:  14,
    fontWeight: 600,
    padding:   "6px 4px",
    border:    `1.5px solid ${
      val !== null && val > maxVal
        ? c.bad
        : `${c.accent}55`
    }`,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

      {/* Elective name selector */}
      {sub.elective && (
        <div style={{ marginBottom: 4 }}>
          <select
            value={dropVal}
            onChange={handleElectiveChange}
            style={{ ...inp(), width: "100%", fontSize: 12, marginBottom: isCustomElective ? 4 : 0 }}
          >
            <option value="">— Select elective subject —</option>
            {electiveOpts.map(o => <option key={o} value={o}>{o}</option>)}
            <option value="__other__">✏ Other (type below)</option>
          </select>
          {(electiveName === "__other__" || isCustomElective) && (
            <ElectiveDockInput
              code={sub.code}
              value={electiveName === "__other__" ? "" : electiveName}
              onSave={setElectiveName}
            />
          )}
        </div>
      )}

      {/* Main row grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 34px 80px 80px 90px 50px 34px 34px",
        gap:                 6,
        alignItems:          "center",
      }}>

        {/* Subject name */}
        <div style={{ minWidth: 0 }}>
          <p style={{
            margin:       0,
            fontSize:     13,
            fontWeight:   500,
            color:        isBacklog ? c.bad : c.text,
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}>
            {isBacklog && <span style={{ marginRight: 4 }}>⚠</span>}
            {subDisplayName(sub)}
            {sub.isCustom && (
              <span style={{ marginLeft: 6, fontSize: 9, background: `${c.ok}20`, color: c.ok, borderRadius: 4, padding: "1px 5px", fontWeight: 700, verticalAlign: "middle" }}>
                CUSTOM
              </span>
            )}
          </p>
          <p style={{ margin: 0, fontSize: 10, color: c.muted }}>
            {sub.credits} cr
            {" · "}
            {isProject ? "Project" : isLab ? "Lab" : "Theory"}
            {" · "}
            <span style={{ color: c.muted }}>
              int {mx.int} + ext {mx.ext} = {mx.total || mx.int + mx.ext}
            </span>
          </p>
        </div>

        {/* Type badge */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <span style={{
            fontSize:     8,
            fontWeight:   700,
            borderRadius: 4,
            padding:      "2px 5px",
            textAlign:    "center",
            background:   isProject ? `${c.purple}18` : isLab ? `${c.ok}18` : `${c.accent}10`,
            color:        isProject ? c.purple : isLab ? c.ok : c.accent,
            letterSpacing: 0.3,
          }}>
            {isProject ? "PROJ" : isLab ? "LAB" : "TH"}
          </span>
        </div>

        {/* Internal marks input */}
        <div>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max={mx.int}
            value={entry.int ?? ""}
            onChange={handleIntChange}
            placeholder={`0–${mx.int}`}
            disabled={isProject && mx.int === 0} // Project Work has no internal
            style={inputStyle(intVal, mx.int)}
          />
        </div>

        {/* External marks input */}
        <div>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max={mx.ext}
            value={entry.ext ?? ""}
            onChange={handleExtChange}
            placeholder={`0–${mx.ext}`}
            style={inputStyle(extVal, mx.ext)}
          />
        </div>

        {/* Total */}
        <div style={{ textAlign: "center" }}>
          <p style={{
            margin:     0,
            fontSize:   16,
            fontWeight: 700,
            color:      grade ? scoreClr(grade.points) : c.muted,
          }}>
            {total !== null ? total : "—"}
          </p>
          {total !== null && maxTotal !== 100 && (
            <p style={{ margin: 0, fontSize: 9, color: c.muted }}>
              /{maxTotal}
            </p>
          )}
        </div>

        {/* Grade */}
        <div style={{ textAlign: "center" }}>
          {grade ? (
            <span style={{ fontSize: 14, fontWeight: 700, color: scoreClr(grade.points) }}>
              {grade.grade}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: c.muted }}>—</span>
          )}
        </div>

        {/* Grade points */}
        <div style={{ textAlign: "center" }}>
          {grade ? (
            <span style={{ fontSize: 12, fontWeight: 600, color: scoreClr(grade.points) }}>
              {grade.points}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: c.muted }}>—</span>
          )}
        </div>

        {/* Backlog toggle */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={handleBacklog}
            title={isBacklog ? "Remove backlog" : "Mark as backlog"}
            style={{
              width:        24,
              height:       24,
              borderRadius: "50%",
              border:       `1.5px solid ${isBacklog ? c.bad : c.border}`,
              background:   isBacklog ? `${c.bad}18` : "transparent",
              cursor:       "pointer",
              fontSize:     10,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              transition:   "all 0.15s",
              color:        isBacklog ? c.bad : c.muted,
            }}
          >
            {isBacklog ? "⚠" : "○"}
          </button>
        </div>
      </div>
    </div>
  );
});

export default SubjectRow;