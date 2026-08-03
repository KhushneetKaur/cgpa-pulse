import { memo, useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme } from "../context/ThemeContext";
import { ELECTIVE_OPTIONS } from "../data/electiveOptions";
import { getGrade, getMaxMarks } from "../data/gradeTable";

// ── Elective text input — memoized, theme from context ───────────────────────
const ElectiveInput = memo(function ElectiveInput({ code, value, onSave }) {
  const { c, inp } = useTheme();
  const [local, setLocal] = useState(value);

  useEffect(() => { setLocal(value); }, [value, code]);

  const handleSave = useCallback((val) => {
    onSave(code, val.trim() || "__other__");
  }, [code, onSave]);

  return (
    <input
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => handleSave(local)}
      onKeyDown={e => {
        if (e.key === "Enter") {
          handleSave(local);
          e.target.blur();
        }
      }}
      placeholder="Type your subject name…"
      autoFocus
      style={{
        ...inp({ fontSize: 10, padding: "3px 8px", marginTop: 4, borderColor: c.accent }),
        width: "100%",
      }}
    />
  );
});

// ── Subject row — memoized ────────────────────────────────────────────────────
const SubjectRow = memo(function SubjectRow({ sub, selSem, branch }) {
  const {
    marks, changeMark,
    bBacklogs, bElectiveNames,
    setElectiveName, toggleBacklog,
  } = useAppData();

  const { c, dark, inp, scoreClr } = useTheme();

  const intRef = useRef(null);
  const extRef = useRef(null);

  // Memoize static subject data
  const mx    = useMemo(() => getMaxMarks(sub.type), [sub.type]);
  const isLab = sub.type === "lab";

  const entry     = marks[sub.code] || {};
  const isBacklog = (bBacklogs[selSem] || []).includes(sub.code);

  // Memoize computed mark values
  const { iVal, eVal, total, grade, bothFilled, iWarn, eWarn } = useMemo(() => {
    const i = entry.int !== "" && entry.int !== undefined ? Number(entry.int) : null;
    const e = entry.ext !== "" && entry.ext !== undefined ? Number(entry.ext) : null;
    const t = i !== null && e !== null ? i + e : null;
    return {
      iVal:       i,
      eVal:       e,
      total:      t,
      grade:      getGrade(t),
      bothFilled: i !== null && e !== null,
      iWarn:      i !== null && i > mx.int,
      eWarn:      e !== null && e > mx.ext,
    };
  }, [entry.int, entry.ext, mx]);

  // Memoize elective data
  const { electiveName, opts, isCustom, dropVal, displayName } = useMemo(() => {
    const name  = bElectiveNames[sub.code] || "";
    const o     = sub.elective ? (ELECTIVE_OPTIONS[branch]?.[sub.code] || []) : [];
    const cust  = name && !o.includes(name);
    return {
      electiveName: name,
      opts:         o,
      isCustom:     cust,
      dropVal:      cust ? "__other__" : name,
      displayName:  name && name !== "__other__" ? name : sub.name,
    };
  }, [bElectiveNames, sub.code, sub.elective, branch]);

  // Stable handlers
  const handleIntKey = useCallback((e) => {
    if (e.key === "Enter") { e.preventDefault(); extRef.current?.focus(); }
  }, []);

  const handleExtKey = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const container  = intRef.current?.closest(".semester-container") || document;
      const allIntInputs = Array.from(container.querySelectorAll(".sr-int input"));
      const idx        = allIntInputs.indexOf(intRef.current);
      if (idx !== -1 && allIntInputs[idx + 1]) {
        allIntInputs[idx + 1].focus();
        allIntInputs[idx + 1].select();
      }
    }
  }, []);

  const handleSelectChange = useCallback((e) => {
    const val = e.target.value;
    setElectiveName(sub.code, val === "__other__" ? "__other__" : val);
  }, [sub.code, setElectiveName]);

  const handleBacklog = useCallback(
    () => toggleBacklog(selSem, sub.code),
    [toggleBacklog, selSem, sub.code]
  );

  const gradeColor = grade ? scoreClr(grade.points) : c.muted;

  return (
    <div style={{ paddingBottom: 2 }}>
      <div
        className="subject-row-grid"
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 34px 80px 80px 90px 50px 34px 34px",
          gap:                 6,
          alignItems:          "start",
        }}
      >
        {/* Name + elective */}
        <div className="sr-name">
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.3, fontWeight: isBacklog ? 600 : 500, color: isBacklog ? c.bad : c.text }}>
            {isBacklog && "⚠ "}{displayName}
          </p>
          <p style={{ margin: "1px 0 0", fontSize: 10, color: c.muted }}>
            {sub.code} · {sub.credits} cr
          </p>

          {sub.elective && (
            <div style={{ marginTop: 4 }}>
              <select
                value={dropVal}
                onChange={handleSelectChange}
                style={{ ...inp({ fontSize: 10, padding: "3px 6px" }), width: "100%" }}
              >
                <option value="">— Select subject —</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
                <option value="__other__">✏ Other (type below)</option>
              </select>

              {(electiveName === "__other__" || isCustom) && (
                <ElectiveInput
                  code={sub.code}
                  value={electiveName === "__other__" ? "" : electiveName}
                  onSave={setElectiveName}
                />
              )}
            </div>
          )}
        </div>

        {/* Type badge */}
        <div className="sr-type" style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 3 }}>
          <span style={{
            fontSize:      9,
            fontWeight:    700,
            borderRadius:  5,
            padding:       "2px 4px",
            background:    isLab
              ? (dark ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.1)")
              : (dark ? "rgba(124,131,245,0.15)" : "rgba(109,40,217,0.08)"),
            color:         isLab ? c.ok : c.accent,
            letterSpacing: 0.3,
          }}>
            {isLab ? "LAB" : "TH"}
          </span>
        </div>

        {/* Internal */}
        <div className="sr-int">
          <input
            ref={intRef}
            type="number" min="0" max={mx.int}
            value={entry.int ?? ""}
            onChange={e => changeMark(sub.code, "int", e.target.value, sub.type)}
            onKeyDown={handleIntKey}
            placeholder={`0–${mx.int}`}
            style={{
              ...inp({ textAlign: "center", fontSize: 13, padding: "6px 4px", borderColor: iWarn ? c.bad : undefined, boxShadow: iWarn ? `0 0 0 2px ${c.bad}33` : undefined }),
              width: "100%",
            }}
          />
          <p style={{ margin: "2px 0 0", fontSize: 9, color: c.muted, textAlign: "center" }}>max {mx.int}</p>
        </div>

        {/* External */}
        <div className="sr-ext">
          <input
            ref={extRef}
            type="number" min="0" max={mx.ext}
            value={entry.ext ?? ""}
            onChange={e => changeMark(sub.code, "ext", e.target.value, sub.type)}
            onKeyDown={handleExtKey}
            placeholder={`0–${mx.ext}`}
            style={{
              ...inp({ textAlign: "center", fontSize: 13, padding: "6px 4px", borderColor: eWarn ? c.bad : undefined, boxShadow: eWarn ? `0 0 0 2px ${c.bad}33` : undefined }),
              width: "100%",
            }}
          />
          <p style={{ margin: "2px 0 0", fontSize: 9, color: c.muted, textAlign: "center" }}>max {mx.ext}</p>
        </div>

        {/* Total */}
        <div className="sr-total" style={{
          background:     bothFilled ? (grade ? `${gradeColor}14` : c.hover) : c.hover,
          borderRadius:   8, padding: "7px 6px", textAlign: "center",
          fontSize:       14, fontWeight: 600, border: `1px solid ${c.border}`,
          color:          bothFilled ? gradeColor : c.muted,
          minHeight:      34, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {total !== null
            ? total
            : (iVal !== null || eVal !== null)
            ? <span style={{ fontSize: 10, color: c.muted }}>fill both</span>
            : "—"}
        </div>

        {/* Grade */}
        <span className="sr-grade" style={{ fontSize: 13, fontWeight: 700, color: gradeColor, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 6 }}>
          {grade ? grade.grade : "—"}
        </span>

        {/* Grade points */}
        <span className="sr-gp" style={{ fontSize: 13, fontWeight: 600, color: gradeColor, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 6 }}>
          {grade ? grade.points : "—"}
        </span>

        {/* Backlog toggle */}
        <button
          className="sr-bl"
          onClick={handleBacklog}
          title={isBacklog ? "Clear backlog" : "Mark as backlog"}
          style={{
            padding:        "5px 4px", borderRadius: 7,
            border:         `1px solid ${isBacklog ? c.bad : c.border}`,
            background:     isBacklog ? `${c.bad}14` : "transparent",
            cursor:         "pointer", fontSize: 12,
            color:          isBacklog ? c.bad : c.muted,
            fontWeight:     700, display: "flex", alignItems: "center", justifyContent: "center",
            transition:     "all 0.15s",
          }}
          onMouseEnter={e => { if (!isBacklog) { e.currentTarget.style.borderColor = c.bad; e.currentTarget.style.color = c.bad; } }}
          onMouseLeave={e => { if (!isBacklog) { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.muted; } }}
        >
          {isBacklog ? "✗" : "!"}
        </button>
      </div>
    </div>
  );
});

export default SubjectRow;