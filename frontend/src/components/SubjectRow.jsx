import { useAppData } from "../context/AppDataContext";
import { ELECTIVE_OPTIONS } from "../data/electiveOptions";
import { getGrade, getMaxMarks } from "../data/gradeTable";
import React,{ useRef, useState, useEffect } from "react";

function ElectiveInput({ code, value, onSave, inp, c, accent }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value, code]);

  return (
    <input
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => {
        const trimmed = local.trim();
        onSave(code, trimmed || "__other__");
      }}
      onKeyDown={e => {
        if (e.key === "Enter") {
          const trimmed = local.trim();
          onSave(code, trimmed || "__other__");
          e.target.blur();
        }
      }}
      placeholder="Type your subject name…"
      autoFocus
      style={{
        ...inp({
          fontSize: 10,
          padding: "3px 8px",
          marginTop: 4,
          borderColor: accent,
        }),
        width: "100%",
      }}
    />
  );
}

export default function SubjectRow({ sub, selSem, branch }) {
  const {
    marks,
    changeMark,
    bBacklogs,
    bElectiveNames,
    setElectiveName,
    toggleBacklog,
    c, dark, inp, scoreClr,
  } = useAppData();

  const mx         = getMaxMarks(sub.type);
  const entry      = marks[sub.code] || {};
  const isLab      = sub.type === "lab";
  const isBacklog  = (bBacklogs[selSem] || []).includes(sub.code);

  const iVal = entry.int !== "" && entry.int !== undefined
    ? Number(entry.int) : null;
  const eVal = entry.ext !== "" && entry.ext !== undefined
    ? Number(entry.ext) : null;

  const total      = iVal !== null && eVal !== null ? iVal + eVal : null;
  const grade      = getGrade(total);
  const bothFilled = iVal !== null && eVal !== null;
  const iWarn      = iVal !== null && iVal > mx.int;
  const eWarn      = eVal !== null && eVal > mx.ext;

  const electiveName = bElectiveNames[sub.code] || "";
  const opts         = sub.elective
    ? (ELECTIVE_OPTIONS[branch]?.[sub.code] || [])
    : [];
  const isCustom     = electiveName && !opts.includes(electiveName);
  const dropVal      = isCustom ? "__other__" : electiveName;

  const displayName = electiveName && electiveName !== "__other__"
    ? electiveName
    : sub.name;

  const intRef = useRef(null);
  const extRef = useRef(null);

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

        {/* ── Subject name + elective picker ──────────────────────── */}
        <div className="sr-name">
          <p style={{
            margin:     0,
            fontSize:   13,
            color:      isBacklog ? c.bad : c.text,
            lineHeight: 1.3,
            fontWeight: isBacklog ? 600 : 500,
          }}>
            {isBacklog && "⚠ "}
            {displayName}
          </p>
          <p style={{
            margin:    0,
            fontSize:  10,
            color:     c.muted,
            marginTop: 1,
          }}>
            {sub.code} · {sub.credits} cr
          </p>

          {sub.elective && (
            <div style={{ marginTop: 4 }}>
              <select
                value={dropVal}
                onChange={e => {
                  const val = e.target.value;
                  setElectiveName(
                    sub.code,
                    val === "__other__" ? "__other__" : val
                  );
                }}
                style={{
                  ...inp({ fontSize: 10, padding: "3px 6px" }),
                  width: "100%",
                }}
              >
                <option value="">— Select subject —</option>
                {opts.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
                <option value="__other__">✏ Other (type below)</option>
              </select>

              {(electiveName === "__other__" || isCustom) && (
                <React.Fragment>
                  <ElectiveInput
                    code={sub.code}
                    value={electiveName === "__other__" ? "" : electiveName}
                    onSave={setElectiveName}
                    inp={inp}
                    c={c}
                    accent={c.accent}
                  />
                </React.Fragment>
              )}
            </div>
          )}
        </div>

        {/* ── Type badge ──────────────────────────────────────────── */}
        <div className="sr-type" style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          paddingTop:     3,
        }}>
          <span style={{
            fontSize:     9,
            fontWeight:   700,
            borderRadius: 5,
            padding:      "2px 4px",
            background:   isLab
              ? (dark ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.1)")
              : (dark ? "rgba(124,131,245,0.15)" : "rgba(109,40,217,0.08)"),
            color:        isLab ? c.ok : c.accent,
            letterSpacing: 0.3,
          }}>
            {isLab ? "LAB" : "TH"}
          </span>
        </div>

        {/* ── Internal input ──────────────────────────────────────── */}
        <div className="sr-int">
          <input
            ref={intRef}
            type="number"
            min="0"
            max={mx.int}
            value={entry.int ?? ""}
            onChange={e =>
              changeMark(sub.code, "int", e.target.value, sub.type)
            }
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                extRef.current?.focus();
              }
            }}
            placeholder={`0–${mx.int}`}
            style={{
              ...inp({
                textAlign:   "center",
                fontSize:    13,
                padding:     "6px 4px",
                borderColor: iWarn ? c.bad : undefined,
                boxShadow:   iWarn ? `0 0 0 2px ${c.bad}33` : undefined,
              }),
              width: "100%",
            }}
          />
          <p style={{
            margin:    "2px 0 0",
            fontSize:  9,
            color:     c.muted,
            textAlign: "center",
          }}>
            max {mx.int}
          </p>
        </div>

        {/* ── External input ──────────────────────────────────────── */}
        <div className="sr-ext">
          <input
            ref={extRef}
            type="number"
            min="0"
            max={mx.ext}
            value={entry.ext ?? ""}
            onChange={e =>
              changeMark(sub.code, "ext", e.target.value, sub.type)
            }
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                
                // 1. Find the parent container holding all the rows to scope the query
                const container = intRef.current?.closest(".semester-container") || document;
                
                // 2. Query only the internal inputs inside this specific container
                const allIntInputs = container.querySelectorAll(".sr-int input");
                const intList = Array.from(allIntInputs);
                
                // 3. Jump to the next index
                const currentIdx = intList.indexOf(intRef.current);
                if (currentIdx !== -1 && intList[currentIdx + 1]) {
                  intList[currentIdx + 1].focus();
                  intList[currentIdx + 1].select(); // Optional: selects text for easier overwriting
                }
              }
            }}
            placeholder={`0–${mx.ext}`}
            style={{
              ...inp({
                textAlign:   "center",
                fontSize:    13,
                padding:     "6px 4px",
                borderColor: eWarn ? c.bad : undefined,
                boxShadow:   eWarn ? `0 0 0 2px ${c.bad}33` : undefined,
              }),
              width: "100%",
            }}
          />
          <p style={{
            margin:    "2px 0 0",
            fontSize:  9,
            color:     c.muted,
            textAlign: "center",
          }}>
            max {mx.ext}
          </p>
        </div>

        {/* ── Total ───────────────────────────────────────────────── */}
        <div className="sr-total" style={{
          background:  bothFilled
            ? (grade ? `${scoreClr(grade.points)}14` : c.hover)
            : c.hover,
          borderRadius: 8,
          padding:      "7px 6px",
          textAlign:    "center",
          fontSize:     14,
          fontWeight:   600,
          border:       `1px solid ${c.border}`,
          color:        bothFilled
            ? (grade ? scoreClr(grade.points) : c.muted)
            : c.muted,
          minHeight:    34,
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
        }}>
          {total !== null
            ? total
            : (iVal !== null || eVal !== null)
            ? <span style={{ fontSize: 10, color: c.muted }}>fill both</span>
            : "—"}
        </div>

        {/* ── Grade ───────────────────────────────────────────────── */}
        <span className="sr-grade" style={{
          fontSize:       13,
          fontWeight:     700,
          color:          grade ? scoreClr(grade.points) : c.muted,
          textAlign:      "center",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          paddingTop:     6,
        }}>
          {grade ? grade.grade : "—"}
        </span>

        {/* ── Grade points ──────────────────────────────────────────── */}
        <span className="sr-gp" style={{
          fontSize:       13,
          fontWeight:     600,
          color:          grade ? scoreClr(grade.points) : c.muted,
          textAlign:      "center",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          paddingTop:     6,
        }}>
          {grade ? grade.points : "—"}
        </span>

        {/* ── Backlog toggle ──────────────────────────────────────── */}
        <button
          className="sr-bl"
          onClick={() => toggleBacklog(selSem, sub.code)}
          title={isBacklog ? "Clear backlog" : "Mark as backlog"}
          style={{
            padding:        "5px 4px",
            borderRadius:   7,
            border:         `1px solid ${isBacklog ? c.bad : c.border}`,
            background:     isBacklog ? `${c.bad}14` : "transparent",
            cursor:         "pointer",
            fontSize:       12,
            color:          isBacklog ? c.bad : c.muted,
            fontWeight:     700,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            transition:     "all 0.15s",
          }}
          onMouseEnter={e => {
            if (!isBacklog) {
              e.currentTarget.style.borderColor = c.bad;
              e.currentTarget.style.color       = c.bad;
            }
          }}
          onMouseLeave={e => {
            if (!isBacklog) {
              e.currentTarget.style.borderColor = c.border;
              e.currentTarget.style.color       = c.muted;
            }
          }}
        >
          {isBacklog ? "✗" : "!"}
        </button>

      </div>
    </div>
  );
}