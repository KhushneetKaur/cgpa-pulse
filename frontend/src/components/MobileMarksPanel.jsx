import { useState, useMemo, useCallback, memo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme }   from "../context/ThemeContext";
import { BRANCHES }          from "../data/branches";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";
import { getGrade, getMaxMarks } from "../data/gradeTable";
import { ELECTIVE_OPTIONS }          from "../data/electiveOptions";
import { PHARMACY_ELECTIVE_OPTIONS } from "../data/pharmacyBranches";
import CustomiseSubjectsModal from "./CustomiseSubjectsModal";

// ── ElectiveDockInput ─────────────────────────────────────────────────────────
const ElectiveDockInput = memo(function ElectiveDockInput({ code, value, onSave }) {
  const { c, dark } = useTheme();
  const [local, setLocal] = useState(value);

  const handleBlur = useCallback(() => {
    onSave(code, local.trim() || "__other__");
  }, [local, code, onSave]);

  return (
    <input
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e => { if (e.key === "Enter") { handleBlur(); e.target.blur(); } }}
      placeholder="Type your subject name…"
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "8px 10px", fontSize: 13, fontFamily: "inherit",
        borderRadius: 10, border: `1.5px solid ${c.accent}`,
        background: dark ? "rgba(255,255,255,0.06)" : "#fff",
        color: c.text, outline: "none",
      }}
    />
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function getBranchSemesters(branch, faculty) {
  if (!branch) return {};
  if (faculty === "pharmacy") return PHARMACY_BRANCHES[branch]?.semesters || {};
  return BRANCHES[branch]?.semesters || {};
}

export default function MobileMarksPanel({ branch, selSem }) {
  const {
    marks, changeMark,
    bBacklogs, toggleBacklog,
    bCustomSubjects, bHiddenSubjects,
    bElectiveNames,
    liveRes, saving, saveSem,
    openQuick, deleteSemRecord, bHist,
    setElectiveName,
    addCustomSubject, removeCustomSubject, toggleHiddenSubject,
    scheme, faculty,
  } = useAppData();

  const { c, dark, btn, inp, scoreClr } = useTheme();

  const [activeIdx,     setActiveIdx]     = useState(0);
  const [showCustomise, setShowCustomise] = useState(false);

  // Subjects — faculty-aware
  const subs = useMemo(() => {
    const branchSems = getBranchSemesters(branch, faculty);
    const hiddenCodes = bHiddenSubjects?.[selSem] || [];
    const hardcoded   = (branchSems[selSem]?.subjects || [])
      .filter(s => !hiddenCodes.includes(s.code));
    const custom = (bCustomSubjects?.[selSem] || []).map(s => ({ ...s, isCustom: true }));
    return [...hardcoded, ...custom];
  }, [branch, faculty, selSem, bHiddenSubjects, bCustomSubjects]);

  useEffect(() => { setActiveIdx(0); }, [selSem]);

  const activeSub = subs[activeIdx] || subs[0];

  const focusInput = useCallback((ref) => {
    requestAnimationFrame(() => ref?.current?.focus());
  }, []);

  // Active subject — all computed values, scheme-aware
  const activeData = useMemo(() => {
    if (!activeSub) return null;
    const entry    = marks[activeSub.code] || {};
    const mx       = getMaxMarks(activeSub.type, scheme); // ← scheme passed
    const maxTotal = mx.total || (mx.int + mx.ext) || 100;
    const iV       = entry.int !== "" && entry.int !== undefined ? Number(entry.int) : null;
    const eV       = entry.ext !== "" && entry.ext !== undefined ? Number(entry.ext) : null;
    const total    = iV !== null && eV !== null ? iV + eV : null;
    const grade    = getGrade(total, scheme, maxTotal); // ← scheme + maxTotal passed
    const isBacklog = (bBacklogs[selSem] || []).includes(activeSub.code);

    const electiveOpts  = ELECTIVE_OPTIONS?.[branch]?.[activeSub.code]
                        || PHARMACY_ELECTIVE_OPTIONS?.[activeSub.code]
                        || [];
    const electiveName  = bElectiveNames[activeSub.code] || "";
    const isCustomElective = electiveName && !electiveOpts.includes(electiveName);

    return {
      entry, mx, maxTotal, iV, eV, total, grade, isBacklog,
      electiveOpts, electiveName,
      isCustomElective,
      dropVal: isCustomElective ? "__other__" : electiveName,
    };
  }, [activeSub, marks, bBacklogs, selSem, bElectiveNames, branch, scheme]);

  // Micro card data — scheme-aware grade lookup
  const getMicroCardData = useCallback((sub) => {
    const e      = marks[sub.code] || {};
    const iV     = e.int !== "" && e.int !== undefined ? Number(e.int) : null;
    const eV     = e.ext !== "" && e.ext !== undefined ? Number(e.ext) : null;
    const total  = iV !== null && eV !== null ? iV + eV : null;
    const mx     = getMaxMarks(sub.type, scheme); // ← scheme passed
    const maxTotal = mx.total || (mx.int + mx.ext) || 100;
    return {
      total,
      grade: getGrade(total, scheme, maxTotal), // ← scheme + maxTotal
      isBL:  (bBacklogs[selSem] || []).includes(sub.code),
    };
  }, [marks, bBacklogs, selSem, scheme]);

  const getSubjectDisplay = useCallback((sub) => {
    const name = bElectiveNames[sub.code];
    return name && name !== "__other__" ? name : sub.name;
  }, [bElectiveNames]);

  // Stable handlers
  const handlePrev    = useCallback(() => setActiveIdx(i => Math.max(0, i - 1)), []);
  const handleNext    = useCallback(() => setActiveIdx(i => Math.min(subs.length - 1, i + 1)), [subs.length]);
  const handleQuick   = useCallback(() => openQuick(selSem), [openQuick, selSem]);
  const handleCustomise      = useCallback(() => setShowCustomise(true), []);
  const handleCloseCustomise = useCallback(() => setShowCustomise(false), []);
  const handleDelete  = useCallback(() => {
    if (window.confirm("Delete records for this semester?")) deleteSemRecord(selSem);
  }, [deleteSemRecord, selSem]);
  const handleBacklog = useCallback(() => {
    if (activeSub) toggleBacklog(selSem, activeSub.code);
  }, [toggleBacklog, selSem, activeSub]);
  const handleElectiveChange = useCallback((e) => {
    setElectiveName(activeSub.code, e.target.value);
  }, [setElectiveName, activeSub?.code]);

  // changeMark with subType as 4th arg — context uses it for scheme-aware max enforcement
  const handleIntChange = useCallback((e) => {
    changeMark(activeSub.code, "int", e.target.value, activeSub.type);
  }, [changeMark, activeSub?.code, activeSub?.type]);

  const handleExtChange = useCallback((e) => {
    changeMark(activeSub.code, "ext", e.target.value, activeSub.type);
  }, [changeMark, activeSub?.code, activeSub?.type]);

  const intRef = useRef(null);
  const extRef = useRef(null);

  const handleIntKey = useCallback((e) => {
    if (e.key === "Enter") { e.preventDefault(); focusInput(extRef); }
  }, [focusInput]);

  const handleExtKey = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx < subs.length - 1) { setActiveIdx(i => i + 1); focusInput(intRef); }
    }
  }, [activeIdx, subs.length, focusInput]);

  if (!activeSub || !activeData) return null;

  const {
    entry, mx, maxTotal, total: activeTotal, grade: activeGrade,
    isBacklog, electiveOpts, electiveName, isCustomElective, dropVal,
  } = activeData;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%", overflowX: "hidden", boxSizing: "border-box", paddingBottom: "320px" }}>

      {/* Live SGPA bar */}
      {liveRes && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: c.sub }}>
            {liveRes.isPartial ? `Estimate (${liveRes.filled}/${liveRes.total} filled)` : "Live SGPA"}
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: liveRes.isPartial ? c.purple : scoreClr(liveRes.sgpa) }}>
            {liveRes.isPartial ? "~" : ""}{liveRes.sgpa}
          </span>
        </div>
      )}

      {/* Subject grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, width: "100%", minWidth: 0 }}>
        {subs.map((sub, idx) => {
          const { total, grade, isBL } = getMicroCardData(sub);
          const isActive = idx === activeIdx;
          const mx       = getMaxMarks(sub.type, scheme);
          const subMax   = mx.total || (mx.int + mx.ext) || 100;

          return (
            <button
              key={sub.code}
              onClick={() => { setActiveIdx(idx); focusInput(intRef); }}
              style={{
                padding: "10px", borderRadius: 10, cursor: "pointer",
                textAlign: "left", fontFamily: "inherit", transition: "all 0.15s",
                position: "relative", minWidth: 0, overflow: "hidden", boxSizing: "border-box",
                border:     isActive ? `2px solid ${c.accent}` : `1px solid ${isBL ? `${c.bad}44` : c.border}`,
                background: isActive ? `${c.accent}12` : isBL ? `${c.bad}08` : c.card,
              }}
            >
              {isActive && <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: c.accent }} />}
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: isActive ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: isActive ? 14 : 0, color: isBL ? c.bad : isActive ? c.accent : c.text }}>
                {isBL ? "⚠ " : ""}{getSubjectDisplay(sub)}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 8, fontWeight: 700, borderRadius: 4, padding: "1px 4px", color: sub.type === "lab" ? c.ok : c.accent, background: sub.type === "lab" ? `${c.ok}18` : `${c.accent}18` }}>
                  {sub.type === "lab" ? "LAB" : sub.type === "project" || sub.type === "practice-school" ? "PROJ" : "TH"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: grade ? scoreClr(grade.points) : c.muted }}>
                  {total !== null ? `${total}/${subMax}` : "—"}
                </span>
                {grade && <span style={{ fontSize: 11, fontWeight: 600, color: scoreClr(grade.points) }}>{grade.grade}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom dock */}
      <div style={{ background: c.card, border: `1px solid ${c.accent}44`, borderRadius: "14px 14px 0 0", padding: "14px 14px 8px", position: "fixed", bottom: 60, left: 0, right: 0, zIndex: 120, boxShadow: dark ? "0 -8px 32px rgba(0,0,0,0.5)" : "0 -8px 32px rgba(109,40,217,0.1)" }}>

        {/* Nav header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 6 }}>
          <button onClick={handlePrev} disabled={activeIdx === 0}
            style={{ ...btn("ghost"), padding: "5px 10px", fontSize: 12, opacity: activeIdx === 0 ? 0.3 : 1, flexShrink: 0, whiteSpace: "nowrap" }}>
            ← Prev
          </button>
          <div style={{ textAlign: "center", flex: 1, minWidth: 0, padding: "0 2px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {getSubjectDisplay(activeSub)}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 9, color: c.muted }}>
              {activeIdx + 1} of {subs.length} · {activeSub.credits} cr · int {mx.int} + ext {mx.ext} = {maxTotal}
            </p>
          </div>
          <button onClick={handleNext} disabled={activeIdx === subs.length - 1}
            style={{ ...btn("ghost"), padding: "5px 10px", fontSize: 12, opacity: activeIdx === subs.length - 1 ? 0.3 : 1, flexShrink: 0, whiteSpace: "nowrap" }}>
            Next →
          </button>
        </div>

        {/* Elective */}
        {activeSub.elective && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: c.sub, fontWeight: 600 }}>Select Subject Name</p>
            <select value={dropVal} onChange={handleElectiveChange}
              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", fontSize: 13, fontFamily: "inherit", borderRadius: 10, border: `1.5px solid ${c.accent}66`, background: dark ? "rgba(255,255,255,0.06)" : "#fff", color: c.text, outline: "none", marginBottom: isCustomElective ? 6 : 0 }}>
              <option value="">— Select subject —</option>
              {electiveOpts.map(o => <option key={o} value={o}>{o}</option>)}
              <option value="__other__">✏ Other (type below)</option>
            </select>
            {(electiveName === "__other__" || isCustomElective) && (
              <ElectiveDockInput
                code={activeSub.code}
                value={electiveName === "__other__" ? "" : electiveName}
                onSave={setElectiveName}
              />
            )}
          </div>
        )}

        {/* Mark inputs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: c.sub, fontWeight: 600 }}>
              Internal (max {mx.int})
            </p>
            <input
              ref={intRef}
              type="number" inputMode="decimal" min="0" max={mx.int}
              value={entry.int ?? ""}
              onChange={handleIntChange}
              onKeyDown={handleIntKey}
              placeholder={`0–${mx.int}`}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 16, fontFamily: "inherit", borderRadius: 10, border: `1.5px solid ${entry.int > mx.int ? c.bad : `${c.accent}66`}`, background: dark ? "rgba(255,255,255,0.06)" : "#fff", color: c.text, outline: "none", textAlign: "center", fontWeight: 600 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: c.sub, fontWeight: 600 }}>
              External (max {mx.ext})
            </p>
            <input
              ref={extRef}
              type="number" inputMode="decimal" min="0" max={mx.ext}
              value={entry.ext ?? ""}
              onChange={handleExtChange}
              onKeyDown={handleExtKey}
              placeholder={`0–${mx.ext}`}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 16, fontFamily: "inherit", borderRadius: 10, border: `1.5px solid ${entry.ext > mx.ext ? c.bad : `${c.accent}66`}`, background: dark ? "rgba(255,255,255,0.06)" : "#fff", color: c.text, outline: "none", textAlign: "center", fontWeight: 600 }}
            />
          </div>
        </div>

        {/* Total + grade */}
        {activeTotal !== null && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "8px", borderRadius: 8, background: activeGrade ? `${scoreClr(activeGrade.points)}12` : c.hover, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: c.sub }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: activeGrade ? scoreClr(activeGrade.points) : c.muted }}>
              {activeTotal}
              {maxTotal !== 100 && <span style={{ fontSize: 11, color: c.muted, fontWeight: 400 }}>/{maxTotal}</span>}
            </span>
            {activeGrade && (
              <>
                <span style={{ color: c.border }}>·</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: scoreClr(activeGrade.points) }}>{activeGrade.grade}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: scoreClr(activeGrade.points) }}>({activeGrade.points} pts)</span>
              </>
            )}
          </div>
        )}

        {/* Save + backlog */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleBacklog}
            style={{ ...btn(isBacklog ? "danger" : "ghost"), flex: 1, fontSize: 12, padding: "8px" }}>
            {isBacklog ? "⚠ Backlog" : "Mark Backlog"}
          </button>
          <button onClick={saveSem} disabled={saving}
            style={{ ...btn("primary"), flex: 2, padding: "8px", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save Semester"}
          </button>
        </div>

        {/* Action row */}
        <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: dark ? "rgba(255,255,255,0.03)" : "rgba(109,40,217,0.03)", border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", gap: 6, flexWrap: "wrap" }}>
          <button onClick={handleQuick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "6px 10px", borderRadius: 8, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = c.hover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{ fontSize: 9, color: c.muted, fontWeight: 600, whiteSpace: "nowrap" }}>Quick SGPA</span>
          </button>

          <div style={{ width: 1, height: 28, background: c.border, flexShrink: 0 }} />

          <button onClick={handleCustomise} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "6px 10px", borderRadius: 8, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = c.hover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 16 }}>✏️</span>
            <span style={{ fontSize: 9, color: c.muted, fontWeight: 600, whiteSpace: "nowrap" }}>Customise</span>
          </button>

          {bHist[selSem] && (
            <>
              <div style={{ width: 1, height: 28, background: c.border, flexShrink: 0 }} />
              <button onClick={handleDelete} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "6px 10px", borderRadius: 8, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = `${c.bad}14`}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ fontSize: 16 }}>🗑️</span>
                <span style={{ fontSize: 9, color: c.bad, fontWeight: 600, whiteSpace: "nowrap" }}>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {showCustomise && (
        <CustomiseSubjectsModal
          branch={branch} selSem={selSem}
          bCustomSubjects={bCustomSubjects}
          bHiddenSubjects={bHiddenSubjects}
          addCustomSubject={addCustomSubject}
          removeCustomSubject={removeCustomSubject}
          toggleHiddenSubject={toggleHiddenSubject}
          onClose={handleCloseCustomise}
        />
      )}
    </div>
  );
}