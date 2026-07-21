import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { BRANCHES } from "../data/branches";
import { getGrade, getMaxMarks } from "../data/gradeTable";
import { ELECTIVE_OPTIONS } from "../data/electiveOptions";
import CustomiseSubjectsModal from "./CustomiseSubjectsModal";

function ElectiveDockInput({ code, value, onSave, dark, c }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value, code]);

  const handleBlurOrSubmit = useCallback(() => {
    const trimmed = local.trim();
    onSave(code, trimmed || "__other__");
  }, [local, code, onSave]);

  return (
    <input
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={handleBlurOrSubmit}
      onKeyDown={e => {
        if (e.key === "Enter") {
          handleBlurOrSubmit();
          e.target.blur();
        }
      }}
      placeholder="Type your subject name…"
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "8px 10px",
        fontSize: 13,
        fontFamily: "inherit",
        borderRadius: 10,
        border: `1.5px solid ${c.accent}`,
        background: dark ? "rgba(255,255,255,0.06)" : "#fff",
        color: c.text,
        outline: "none",
      }}
    />
  );
}

export default function MobileMarksPanel({ branch, selSem }) {
  const {
    marks, changeMark,
    bBacklogs, toggleBacklog,
    bCustomSubjects, bHiddenSubjects,
    bElectiveNames,
    liveRes, saving, saveSem,
    openQuick, deleteSemRecord, bHist,
    c, dark, scoreClr, btn, inp, setElectiveName,
    addCustomSubject, removeCustomSubject, toggleHiddenSubject,
  } = useAppData();

  const [activeIdx, setActiveIdx] = useState(0);
  const [showCustomise, setShowCustomise] = useState(false);
  const intRef = useRef(null);
  const extRef = useRef(null);

  // Memoize subject list generation
  const subs = useMemo(() => {
    const hiddenCodes = bHiddenSubjects?.[selSem] || [];
    const hardcodedSubs = (BRANCHES[branch]?.semesters[selSem]?.subjects || [])
      .filter(s => !hiddenCodes.includes(s.code));
    const customSubs = (bCustomSubjects?.[selSem] || []).map(s => ({
      ...s,
      isCustom: true,
    }));
    return [...hardcodedSubs, ...customSubs];
  }, [branch, selSem, bHiddenSubjects, bCustomSubjects]);

  // Reset active index when semester or subjects change
  useEffect(() => {
    setActiveIdx(0);
  }, [selSem]);

  const activeSub = subs[activeIdx] || subs[0];

  const focusInput = useCallback((ref) => {
    requestAnimationFrame(() => ref.current?.focus());
  }, []);

  if (!activeSub) return null;

  const mx = getMaxMarks(activeSub.type);
  const entry = marks[activeSub.code] || {};
  const isBacklog = (bBacklogs[selSem] || []).includes(activeSub.code);

  const getSubjectDisplay = (sub) => {
    const name = bElectiveNames[sub.code];
    return name && name !== "__other__" ? name : sub.name;
  };

  const getMicroCardData = (sub) => {
    const e = marks[sub.code] || {};
    const iV = e.int !== "" && e.int !== undefined ? Number(e.int) : null;
    const eV = e.ext !== "" && e.ext !== undefined ? Number(e.ext) : null;
    const total = iV !== null && eV !== null ? iV + eV : null;
    const grade = getGrade(total);
    const isBL = (bBacklogs[selSem] || []).includes(sub.code);
    return { total, grade, isBL };
  };

  // Pre-calculate active sub totals
  const iV = entry.int !== "" && entry.int !== undefined ? Number(entry.int) : null;
  const eV = entry.ext !== "" && entry.ext !== undefined ? Number(entry.ext) : null;
  const activeTotal = iV !== null && eV !== null ? iV + eV : null;
  const activeGrade = getGrade(activeTotal);

  // Elective setup for active sub
  const electiveOpts = ELECTIVE_OPTIONS[branch]?.[activeSub.code] || [];
  const electiveName = bElectiveNames[activeSub.code] || "";
  const isCustomElective = electiveName && !electiveOpts.includes(electiveName);
  const dropVal = isCustomElective ? "__other__" : electiveName;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 0,
      width: "100%",
      overflowX: "hidden",
      boxSizing: "border-box",
      paddingBottom: "320px",
    }}>

      {/* Live SGPA bar */}
      {liveRes && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          background: c.card,
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          marginBottom: 10,
        }}>
          <span style={{ fontSize: 12, color: c.sub }}>
            {liveRes.isPartial
              ? `Estimate (${liveRes.filled}/${liveRes.total} filled)`
              : "Live SGPA"}
          </span>
          <span style={{
            fontSize: 20,
            fontWeight: 800,
            color: liveRes.isPartial ? c.purple : scoreClr(liveRes.sgpa),
          }}>
            {liveRes.isPartial ? "~" : ""}{liveRes.sgpa}
          </span>
        </div>
      )}

      {/* Top grid — all subjects */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginBottom: 12,
        width: "100%",
        minWidth: 0,
      }}>
        {subs.map((sub, idx) => {
          const { total, grade, isBL } = getMicroCardData(sub);
          const isActive = idx === activeIdx;

          return (
            <button
              key={sub.code}
              onClick={() => {
                setActiveIdx(idx);
                focusInput(intRef);
              }}
              style={{
                padding: "10px",
                borderRadius: 10,
                border: isActive
                  ? `2px solid ${c.accent}`
                  : `1px solid ${isBL ? `${c.bad}44` : c.border}`,
                background: isActive
                  ? `${c.accent}12`
                  : isBL
                  ? `${c.bad}08`
                  : c.card,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "all 0.15s",
                position: "relative",
                minWidth: 0,
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {isActive && (
                <div style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: c.accent,
                }} />
              )}

              <p style={{
                margin: "0 0 4px",
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                color: isBL ? c.bad : isActive ? c.accent : c.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingRight: isActive ? 14 : 0,
              }}>
                {isBL ? "⚠ " : ""}{getSubjectDisplay(sub)}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: sub.type === "lab" ? c.ok : c.accent,
                  background: sub.type === "lab" ? `${c.ok}18` : `${c.accent}18`,
                  borderRadius: 4,
                  padding: "1px 4px",
                }}>
                  {sub.type === "lab" ? "LAB" : "TH"}
                </span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: grade ? scoreClr(grade.points) : c.muted,
                }}>
                  {total !== null ? total : "—"}
                </span>
                {grade && (
                  <span style={{
                    fontSize: 11,
                    color: scoreClr(grade.points),
                    fontWeight: 600,
                  }}>
                    {grade.grade}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom dock — input for active subject */}
      <div style={{
        background: c.card,
        border: `1px solid ${c.accent}44`,
        borderRadius: "14px 14px 0 0",
        padding: "14px 14px 8px",
        position: "fixed",
        bottom: 60,
        left: 0,
        right: 0,
        zIndex: 120,
        boxShadow: dark
          ? "0 -8px 32px rgba(0,0,0,0.5)"
          : "0 -8px 32px rgba(109,40,217,0.1)",
      }}>

        {/* Navigation header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 6 }}>
          <button
            onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
            disabled={activeIdx === 0}
            style={{
              ...btn("ghost"),
              padding: "5px 10px",
              fontSize: 12,
              opacity: activeIdx === 0 ? 0.3 : 1,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            ← Prev
          </button>

          <div style={{ textAlign: "center", flex: 1, minWidth: 0, padding: "0 2px" }}>
            <p style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              color: c.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {getSubjectDisplay(activeSub)}
            </p>
            <p style={{ margin: 0, fontSize: 9, color: c.muted, marginTop: 1 }}>
              {activeIdx + 1} of {subs.length} · {activeSub.credits} cr ·{" "}
              {activeSub.type === "lab" ? "Lab" : "Theory"}
            </p>
          </div>

          <button
            onClick={() => setActiveIdx(i => Math.min(subs.length - 1, i + 1))}
            disabled={activeIdx === subs.length - 1}
            style={{
              ...btn("ghost"),
              padding: "5px 10px",
              fontSize: 12,
              opacity: activeIdx === subs.length - 1 ? 0.3 : 1,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Next →
          </button>
        </div>

        {/* Elective selection */}
        {activeSub.elective && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: c.sub, fontWeight: 600 }}>
              Select Subject Name
            </p>
            <select
              value={dropVal}
              onChange={e => setElectiveName(activeSub.code, e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 10px",
                fontSize: 13,
                fontFamily: "inherit",
                borderRadius: 10,
                border: `1.5px solid ${c.accent}66`,
                background: dark ? "rgba(255,255,255,0.06)" : "#fff",
                color: c.text,
                outline: "none",
                marginBottom: isCustomElective ? 6 : 0,
              }}
            >
              <option value="">— Select subject —</option>
              {electiveOpts.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
              <option value="__other__">✏ Other (type below)</option>
            </select>

            {(electiveName === "__other__" || isCustomElective) && (
              <ElectiveDockInput
                code={activeSub.code}
                value={electiveName === "__other__" ? "" : electiveName}
                onSave={setElectiveName}
                dark={dark}
                c={c}
              />
            )}
          </div>
        )}

        {/* Mark Inputs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          {/* Internal */}
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: c.sub, fontWeight: 600 }}>
              Internal (max {mx.int})
            </p>
            <input
              ref={intRef}
              type="number"
              inputMode="decimal"
              min="0"
              max={mx.int}
              value={entry.int ?? ""}
              onChange={e => changeMark(activeSub.code, "int", e.target.value, activeSub.type)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  focusInput(extRef);
                }
              }}
              placeholder={`0–${mx.int}`}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                fontSize: 16,
                fontFamily: "inherit",
                borderRadius: 10,
                border: `1.5px solid ${Number(entry.int) > mx.int ? c.bad : `${c.accent}66`}`,
                background: dark ? "rgba(255,255,255,0.06)" : "#fff",
                color: c.text,
                outline: "none",
                textAlign: "center",
                fontWeight: 600,
              }}
            />
          </div>

          {/* External */}
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: c.sub, fontWeight: 600 }}>
              External (max {mx.ext})
            </p>
            <input
              ref={extRef}
              type="number"
              inputMode="decimal"
              min="0"
              max={mx.ext}
              value={entry.ext ?? ""}
              onChange={e => changeMark(activeSub.code, "ext", e.target.value, activeSub.type)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (activeIdx < subs.length - 1) {
                    setActiveIdx(i => i + 1);
                    focusInput(intRef);
                  }
                }
              }}
              placeholder={`0–${mx.ext}`}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                fontSize: 16,
                fontFamily: "inherit",
                borderRadius: 10,
                border: `1.5px solid ${Number(entry.ext) > mx.ext ? c.bad : `${c.accent}66`}`,
                background: dark ? "rgba(255,255,255,0.06)" : "#fff",
                color: c.text,
                outline: "none",
                textAlign: "center",
                fontWeight: 600,
              }}
            />
          </div>
        </div>

        {/* Total + Grade Display */}
        {activeTotal !== null && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "8px",
            borderRadius: 8,
            background: activeGrade ? `${scoreClr(activeGrade.points)}12` : c.hover,
            marginBottom: 10,
          }}>
            <span style={{ fontSize: 12, color: c.sub }}>Total</span>
            <span style={{
              fontSize: 20,
              fontWeight: 800,
              color: activeGrade ? scoreClr(activeGrade.points) : c.muted,
            }}>
              {activeTotal}
            </span>
            {activeGrade && (
              <>
                <span style={{ color: c.border }}>·</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: scoreClr(activeGrade.points) }}>
                  {activeGrade.grade}
                </span>
                <span style={{ fontSize: 12, color: scoreClr(activeGrade.points), fontWeight: 600 }}>
                  ({activeGrade.points} pts)
                </span>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => toggleBacklog(selSem, activeSub.code)}
            style={{
              ...btn(isBacklog ? "danger" : "ghost"),
              flex: 1,
              fontSize: 12,
              padding: "8px",
            }}
          >
            {isBacklog ? "⚠ Backlog" : "Mark Backlog"}
          </button>

          <button
            onClick={saveSem}
            disabled={saving}
            style={{
              ...btn("primary"),
              flex: 2,
              padding: "8px",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Save Semester"}
          </button>
        </div>

        {/* Footer quick links */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 8,
        }}>
          <button
            onClick={() => openQuick(selSem)}
            style={{
              background: "transparent", border: "none",
              fontSize: 11, color: c.muted,
              cursor: "pointer", fontFamily: "inherit", padding: "4px 8px",
            }}
          >
            ⚡ Quick SGPA
          </button>

          <button
            onClick={() => setShowCustomise(true)}
            style={{
              background: "transparent", border: "none",
              fontSize: 11, color: c.muted,
              cursor: "pointer", fontFamily: "inherit", padding: "4px 8px",
            }}
          >
            ✏️ Customise
          </button>

          {bHist[selSem] && (
            <button
              onClick={() => {
                if (window.confirm("Delete records for this semester?")) {
                  deleteSemRecord(selSem);
                }
              }}
              style={{
                background: "transparent", border: "none",
                fontSize: 11, color: c.bad,
                cursor: "pointer", fontFamily: "inherit", padding: "4px 8px",
              }}
            >
              Delete records
            </button>
          )}
        </div>
      </div>

      {/* Customise Modal */}
      {showCustomise && (
        <CustomiseSubjectsModal
          dark={dark}
          c={c}
          inp={inp}
          btn={btn}
          branch={branch}
          selSem={selSem}
          bCustomSubjects={bCustomSubjects}
          bHiddenSubjects={bHiddenSubjects}
          addCustomSubject={addCustomSubject}
          removeCustomSubject={removeCustomSubject}
          toggleHiddenSubject={toggleHiddenSubject}
          onClose={() => setShowCustomise(false)}
        />
      )}
    </div>
  );
}