import { usePredictor } from "../hooks/usePredictor";
import { getMaxMarks } from "../data/gradeTable";

export default function PredictorPage() {
  const {
    semKeys,
    predSem,
    predDesiredSGPA,
    predInt,
    subs,
    breakdown,
    anyIntFilled,
    selectPredSem,
    setPredDesiredSGPA,
    setPredIntForSub,
    getDisplayName,
    c,
    cardSty,
    scoreClr,
    inp,
  } = usePredictor();

  return (
    <div style={cardSty()}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{
          margin:     "0 0 4px",
          fontSize:   16,
          fontWeight: 700,
          color:      c.text,
        }}>
          🔮 SGPA Predictor
        </p>
        <p style={{
          margin:     0,
          fontSize:   13,
          color:      c.sub,
          lineHeight: 1.5,
        }}>
          Enter your internal marks and desired SGPA — see exactly
          how many external marks you need per subject.
        </p>
      </div>

      {/* Semester pills */}
      <div style={{
        display:      "flex",
        gap:          6,
        flexWrap:     "wrap",
        marginBottom: 20,
      }}>
        {semKeys.map(s => {
          const active = predSem === s;
          return (
            <button
              key={s}
              onClick={() => selectPredSem(s)}
              style={{
                padding:      "6px 14px",
                borderRadius: 99,
                fontSize:     12,
                cursor:       "pointer",
                fontFamily:   "inherit",
                fontWeight:   active ? 700 : 400,
                border:       `1px solid ${active ? c.accent : c.border}`,
                background:   active ? c.accentLt : "transparent",
                color:        active ? c.accent : c.sub,
                transition:   "all 0.15s",
              }}
            >
              Sem {s}
            </button>
          );
        })}
      </div>

      {!predSem ? (
        <div style={{
          textAlign:  "center",
          padding:    "2.5rem 0",
          color:      c.muted,
          fontSize:   13,
        }}>
          <p style={{ fontSize: 32, margin: "0 0 10px" }}>👆</p>
          Select a semester above to start predicting.
        </div>
      ) : (
        <>
          {/* Top: desired SGPA + range */}
          <div
  className="predictor-top-grid"
  style={{
    display:             "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:                 12,
    marginBottom:        16,
  }}
>

            {/* Desired SGPA */}
            <div style={{
              padding:      "14px",
              background:   c.accentLt,
              borderRadius: 12,
              border:       `1px solid ${c.accent}33`,
            }}>
              <p style={{
                margin:        "0 0 8px",
                fontSize:      10,
                color:         c.sub,
                fontWeight:    700,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}>
                Desired SGPA
              </p>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={predDesiredSGPA}
                onChange={e => setPredDesiredSGPA(e.target.value)}
                placeholder="e.g. 8.0"
                style={{
                  ...inp({
                    fontSize:   20,
                    fontWeight: 800,
                    textAlign:  "center",
                    padding:    "8px 10px",
                    background: "transparent",
                    border:     `1px solid ${c.accent}55`,
                    color:      c.text,
                  }),
                }}
              />
              {breakdown?.targetGrade && (
                <p style={{
                  margin:     "8px 0 0",
                  fontSize:   11,
                  color:      c.sub,
                  lineHeight: 1.4,
                }}>
                  Min grade needed:{" "}
                  <strong style={{
                    color: scoreClr(breakdown.targetGrade.points),
                  }}>
                    {breakdown.targetGrade.grade} ({breakdown.targetGrade.points} pts)
                  </strong>
                  <span style={{
                    color:     c.muted,
                    fontSize:  10,
                    display:   "block",
                    marginTop: 2,
                  }}>
                    not necessarily A+
                  </span>
                </p>
              )}
            </div>

            {/* SGPA range */}
            <div style={{
              padding:      "14px",
              background:   c.hover,
              borderRadius: 12,
              border:       `1px solid ${c.border}`,
            }}>
              <p style={{
                margin:        "0 0 8px",
                fontSize:      10,
                color:         c.sub,
                fontWeight:    700,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}>
                Your SGPA Range
              </p>
              {!anyIntFilled ? (
                <p style={{
                  margin:     0,
                  fontSize:   12,
                  color:      c.muted,
                  lineHeight: 1.5,
                }}>
                  Enter internal marks to see your best / worst case
                </p>
              ) : (
                <div style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        10,
                }}>
                  <div style={{ textAlign: "center", flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 9, color: c.muted }}>
                      WORST
                    </p>
                    <p style={{
                      margin:     0,
                      fontSize:   22,
                      fontWeight: 800,
                      color:      breakdown?.worstCaseSGPA
                        ? scoreClr(breakdown.worstCaseSGPA)
                        : c.muted,
                      letterSpacing: -0.5,
                    }}>
                      {breakdown?.worstCaseSGPA || "—"}
                    </p>
                    <p style={{ margin: 0, fontSize: 9, color: c.muted }}>
                      0 in external
                    </p>
                  </div>

                  <div style={{
                    display:       "flex",
                    flexDirection: "column",
                    alignItems:    "center",
                    gap:           2,
                  }}>
                    <div style={{
                      height:     1,
                      width:      20,
                      background: c.border,
                    }} />
                    <span style={{ fontSize: 10, color: c.muted }}>to</span>
                    <div style={{
                      height:     1,
                      width:      20,
                      background: c.border,
                    }} />
                  </div>

                  <div style={{ textAlign: "center", flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 9, color: c.muted }}>
                      BEST
                    </p>
                    <p style={{
                      margin:     0,
                      fontSize:   22,
                      fontWeight: 800,
                      color:      breakdown?.bestCaseSGPA
                        ? scoreClr(breakdown.bestCaseSGPA)
                        : c.muted,
                      letterSpacing: -0.5,
                    }}>
                      {breakdown?.bestCaseSGPA || "—"}
                    </p>
                    <p style={{ margin: 0, fontSize: 9, color: c.muted }}>
                      max external
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Marks scheme note */}
          <div style={{
            padding:      "8px 12px",
            background:   c.hover,
            border:       `1px solid ${c.border}`,
            borderRadius: 8,
            marginBottom: 14,
            fontSize:     11,
            color:        c.sub,
            display:      "flex",
            gap:          16,
            flexWrap:     "wrap",
          }}>
            <span>
              <strong style={{ color: c.text }}>Sem {predSem}</strong>
              {" · "}{subs.reduce((a, s) => a + s.credits, 0)} credits
            </span>
            <span>
              <strong style={{ color: c.accent }}>Theory:</strong>{" "}
              Int 40 + Ext 60
            </span>
            <span>
              <strong style={{ color: c.ok }}>Lab:</strong>{" "}
              Int 60 + Ext 40
            </span>
          </div>

          {/* Column headers */}
          <div
  className="predictor-col-headers"
  style={{
    display:             "grid",
    gridTemplateColumns: "1fr 36px 88px 1fr",
    gap:                 8,
    padding:             "6px 10px",
    borderBottom:        `2px solid ${c.border}`,
    marginBottom:        4,
  }}
>
            {["Subject", "", "Internal", "External needed per grade"].map((h, i) => (
              <p key={i} style={{
                margin:        0,
                fontSize:      10,
                color:         c.muted,
                fontWeight:    700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}>
                {h}
              </p>
            ))}
          </div>

          {/* Subject rows */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {subs.map((sub, idx) => {
              const mx      = getMaxMarks(sub.type);
              const isLab   = sub.type === "lab";
              const iRaw    = predInt[sub.code];
              const iV      = iRaw !== undefined && iRaw !== ""
                                ? Number(iRaw) : null;
              const result  = breakdown?.subResults?.find(
                r => r.sub.code === sub.code
              );
              const name    = getDisplayName(sub);

              return (
                <div
  key={sub.code}
  className="predictor-row-grid"
  style={{
    display:             "grid",
    gridTemplateColumns: "1fr 36px 88px 1fr",
    gap:                 8,
    padding:             "10px",
    borderRadius:        8,
    background:          idx % 2 === 0
      ? `${c.hover}88`
      : "transparent",
    alignItems:          "start",
  }}
>
                  {/* Subject name */}
                  <div className="pr-name">
                    <p style={{
                      margin:     0,
                      fontSize:   12,
                      color:      c.text,
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}>
                      {name}
                    </p>
                    <p style={{
                      margin:   0,
                      fontSize: 10,
                      color:    c.muted,
                    }}>
                      {sub.credits} cr
                    </p>
                  </div>

                  {/* Type badge */}
                  <div className="pr-type" style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    paddingTop:     3,
                  }}>
                    <span style={{
                      fontSize:     9,
                      fontWeight:   700,
                      borderRadius: 5,
                      padding:      "2px 5px",
                      background:   isLab
                        ? `${c.ok}15`
                        : `${c.accent}10`,
                      color:        isLab ? c.ok : c.accent,
                      letterSpacing: 0.3,
                    }}>
                      {isLab ? "LAB" : "TH"}
                    </span>
                  </div>

                  {/* Internal input */}
                  <div className="pr-int">
                    <input
                      type="number"
                      min="0"
                      max={mx.int}
                      value={predInt[sub.code] ?? ""}
                      onChange={e =>
                        setPredIntForSub(sub.code, e.target.value)
                      }
                      placeholder={`0–${mx.int}`}
                      style={{
                        ...inp({
                          textAlign:  "center",
                          fontSize:   13,
                          fontWeight: 600,
                          padding:    "6px 4px",
                        }),
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

                  {/* Grade chips */}
                 <div className="pr-chips" style={{ paddingTop: 2 }}>
                    {iV === null ? (
                      <p style={{
                        margin:   0,
                        fontSize: 11,
                        color:    c.muted,
                        paddingTop: 4,
                      }}>
                        ← enter marks
                      </p>
                    ) : (
                      <div style={{
                        display:  "flex",
                        flexWrap: "wrap",
                        gap:      4,
                      }}>
                        {result?.gradeNeeds
                          ?.filter(g => g.grade !== "F")
                          .map(g => (
                            <GradeChip
                              key={g.grade}
                              g={g}
                              isTarget={g.grade === result.highlightGrade}
                              mx={mx}
                              c={c}
                              scoreClr={scoreClr}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Grade chip ────────────────────────────────────────────────────────────────
function GradeChip({ g, isTarget, mx, c, scoreClr }) {
  return (
    <div style={{
      display:      "flex",
      alignItems:   "center",
      gap:          4,
      padding:      "3px 8px",
      borderRadius: 6,
      fontSize:     11,
      fontWeight:   isTarget ? 700 : 400,
      background:   !g.achievable
        ? `${c.bad}10`
        : isTarget
        ? `${c.ok}18`
        : c.hover,
      border: `1px solid ${
        !g.achievable
          ? `${c.bad}40`
          : isTarget
          ? `${c.ok}55`
          : c.border
      }`,
      color: !g.achievable
        ? c.bad
        : isTarget
        ? c.ok
        : c.sub,
    }}>
      <span style={{
        fontWeight: 700,
        color:      !g.achievable ? c.bad : scoreClr(g.points),
        minWidth:   18,
      }}>
        {g.grade}
      </span>
      <span style={{ color: c.muted }}>→</span>
      <span>
        {g.achievable
          ? g.minExt === 0
            ? "✓ done"
            : `≥${g.minExt}/${mx.ext}`
          : "not possible"}
      </span>
      {isTarget && (
        <span style={{ fontSize: 9, color: c.ok }}>★</span>
      )}
    </div>
  );
}