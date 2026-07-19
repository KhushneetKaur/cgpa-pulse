import React, { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";

// CGPA reference table for the converter
const CGPA_PERCENTAGE_REFS = [
  { cgpa: 5.0,  pct: "50.0" },
  { cgpa: 5.5,  pct: "55.0" },
  { cgpa: 6.0,  pct: "60.0" },
  { cgpa: 6.5,  pct: "65.0" },
  { cgpa: 7.0,  pct: "70.0" },
  { cgpa: 7.5,  pct: "75.0" },
  { cgpa: 8.0,  pct: "80.0" },
  { cgpa: 8.5,  pct: "85.0" },
  { cgpa: 9.0,  pct: "90.0" },
  { cgpa: 9.5,  pct: "95.0" },
  { cgpa: 10.0, pct: "100.0" },
];

export default function TargetPage() {
  const {
    cgpa, doneSems,
    targetCGPA, setTargetCGPA,
    targetResult, setTargetResult,
    runCalcTarget,
    c, inp, btn, cardSty, scoreClr,
  } = useAppData();

  // Cache static card style function valuations to prevent computational re-evaluations
  const computedCardStyle = useMemo(() => cardSty(), [cardSty]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Target CGPA calculator ────────────────────────────────── */}
      <div style={computedCardStyle}>
        <p style={{
          margin:     "0 0 4px",
          fontSize:   15,
          fontWeight: 600,
          color:      c.text,
        }}>
          🎯 Target CGPA Calculator
        </p>
        <p style={{
          margin:   "0 0 16px",
          fontSize: 13,
          color:    c.sub,
        }}>
          Find out what average SGPA you need in remaining semesters
          to reach your CGPA goal.
        </p>

        {/* No semesters saved warning */}
        {doneSems === 0 && (
          <div style={{
            padding:      "10px 14px",
            background:   c.goldBg,
            border:       `1px solid ${c.gold}33`,
            borderRadius: 8,
            marginBottom: 14,
            fontSize:     13,
            color:        c.sub,
          }}>
            Save at least one semester first so we know your
            current standing.
          </div>
        )}

        {/* Input row */}
        <div
          className="target-input-row"
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1fr",
            gap:                 12,
            marginBottom:        14,
          }}
        >
          {/* Current CGPA — read only */}
          <div>
            <p style={{
              margin:       "0 0 6px",
              fontSize:     12,
              color:        c.sub,
              fontWeight:   500,
            }}>
              Current CGPA
            </p>
            <div style={{
              ...inp(),
              padding:    "10px 14px",
              fontSize:   20,
              fontWeight: 700,
              color:      cgpa ? scoreClr(cgpa) : c.muted,
            }}>
              {cgpa || "—"}
            </div>
          </div>

          {/* Target CGPA input */}
          <div>
            <p style={{
              margin:       "0 0 6px",
              fontSize:     12,
              color:        c.sub,
              fontWeight:   500,
            }}>
              Your Target CGPA
            </p>
            <input
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={targetCGPA}
              onChange={e => {
                setTargetCGPA(e.target.value);
                setTargetResult(null);
              }}
              onKeyDown={e => e.key === "Enter" && runCalcTarget()}
              placeholder="e.g. 8.5"
              style={{
                ...inp({
                  fontSize:  16,
                  textAlign: "center",
                  padding:   "10px",
                }),
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* Credit weighting explanation */}
        <div style={{
          padding:      "10px 14px",
          background:   c.hover,
          border:       `1px solid ${c.border}`,
          borderRadius: 8,
          fontSize:     12,
          color:        c.sub,
          lineHeight:   1.6,
          marginBottom: 14,
        }}>
          <strong style={{ color: c.text }}>
            Why does CGPA differ from the average of my SGPAs?
          </strong>
          <br />
          CGPA is <em>credit-weighted</em> — semesters with more credits
          carry proportionally more weight. Sem 5 has 27 credits vs
          Sem 1's 19 credits, so Sem 5 influences your CGPA ~1.4× more.
          This also means the required SGPA can look high when most
          of your credits are already locked in at a lower average.
        </div>

        {/* Calculate button */}
        <button
          onClick={runCalcTarget}
          disabled={doneSems === 0}
          style={{
            ...btn("primary"),
            padding:  "10px 32px",
            opacity:  doneSems === 0 ? 0.5 : 1,
            cursor:   doneSems === 0 ? "default" : "pointer",
          }}
        >
          Calculate Required SGPA
        </button>

        {/* Result */}
        {targetResult && (
          <div style={{ marginTop: 16 }}>
            <TargetResult result={targetResult} c={c} scoreClr={scoreClr} />
          </div>
        )}
      </div>

      {/* ── Percentage converter ──────────────────────────────────── */}
      <div style={computedCardStyle}>
        <p style={{
          margin:     "0 0 4px",
          fontSize:   15,
          fontWeight: 600,
          color:      c.text,
        }}>
          📊 CGPA ↔ Percentage Converter
        </p>
        <p style={{
          margin:   "0 0 14px",
          fontSize: 13,
          color:    c.sub,
        }}>
          MRSPTU formula:{" "}
          <strong style={{ color: c.text }}>Percentage = CGPA × 10</strong>
        </p>

        {/* Your CGPA highlight */}
        {cgpa && (
          <div
            className="target-cgpa-highlight"
            style={{
              padding:      "12px 14px",
              background:   c.accentLt,
              border:       `1px solid ${c.accentTxt}44`,
              borderRadius: 8,
              marginBottom: 12,
              display:      "flex",
              alignItems:   "center",
              gap:          12,
            }}
          >
            <div>
              <p style={{
                margin:   0,
                fontSize: 11,
                color:    c.sub,
              }}>
                Your current CGPA
              </p>
              <p style={{
                margin:     0,
                fontSize:   22,
                fontWeight: 700,
                color:      scoreClr(cgpa),
              }}>
                {cgpa}
              </p>
            </div>
            <div style={{
              fontSize:   20,
              color:      c.muted,
            }}>
              →
            </div>
            <div>
              <p style={{
                margin:   0,
                fontSize: 11,
                color:    c.sub,
              }}>
                Equivalent percentage
              </p>
              <p style={{
                margin:     0,
                fontSize:   22,
                fontWeight: 700,
                color:      scoreClr(cgpa),
              }}>
                {(parseFloat(cgpa) * 10).toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Reference table */}
        <div
          className="target-pct-table"
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap:                 6,
          }}
        >
          {CGPA_PERCENTAGE_REFS.map(({ cgpa: cg, pct }) => (
            <div
              key={cg}
              style={{
                padding:        "8px 12px",
                background:     c.hover,
                borderRadius:   8,
                border:         `1px solid ${c.border}`,
                display:        "flex",
                justifyContent: "space-between",
                alignItems:     "center",
              }}
            >
              <span style={{
                fontSize:   13,
                fontWeight: 600,
                color:      scoreClr(cg),
              }}>
                {cg}
              </span>
              <span style={{ fontSize: 12, color: c.muted }}>→</span>
              <span style={{
                fontSize:   13,
                fontWeight: 600,
                color:      scoreClr(cg),
              }}>
                {pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Target result display (Memoized to isolate calculator recalculation effects) ───
const TargetResult = React.memo(function TargetResult({ result, c, scoreClr }) {

  // Error state
  if (result.error) {
    return (
      <div style={{
        padding:      "14px 16px",
        background:   `${c.bad}11`,
        border:       `1px solid ${c.bad}44`,
        borderRadius: 10,
      }}>
        <p style={{ margin: 0, fontSize: 13, color: c.bad }}>
          {result.error}
        </p>
      </div>
    );
  }

  // Already achieved
  if (result.alreadyAchieved) {
    return (
      <div style={{
        padding:      "14px 16px",
        background:   `${c.ok}11`,
        border:       `1px solid ${c.ok}44`,
        borderRadius: 10,
      }}>
        <p style={{
          margin:     "0 0 4px",
          fontSize:   14,
          fontWeight: 600,
          color:      c.ok,
        }}>
          🎉 Already achieved!
        </p>
        <p style={{ margin: 0, fontSize: 13, color: c.sub }}>
          Your current CGPA{" "}
          <strong style={{ color: c.text }}>{result.currentCGPA}</strong>{" "}
          already meets your target of{" "}
          <strong style={{ color: c.text }}>{result.target}</strong>.
          Set a higher goal!
        </p>
      </div>
    );
  }

  const isAchievable = result.achievable;
  const borderColor  = isAchievable ? c.accentTxt : c.bad;

  return (
    <div style={{
      borderRadius: 10,
      overflow:     "hidden",
      border:       `1px solid ${borderColor}`,
    }}>

      {/* ── 3-column summary header ───────────────────────────────── */}
      <div
        className="target-result-grid"
        style={{
          display:    "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          background: isAchievable
                      ? (c.accentLt)
                      : `${c.bad}11`,
          padding:    "16px",
          gap:        12,
        }}
      >
        {/* Current */}
        <div>
          <p style={{
            margin:        "0 0 2px",
            fontSize:      10,
            color:         c.sub,
            fontWeight:    600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            Current CGPA
          </p>
          <p style={{
            margin:     0,
            fontSize:   22,
            fontWeight: 700,
            color:      scoreClr(result.currentCGPA),
          }}>
            {result.currentCGPA}
          </p>
          <p style={{
            margin:   0,
            fontSize: 11,
            color:    c.muted,
          }}>
            {result.doneCr} credits locked
          </p>
        </div>

        {/* Required SGPA */}
        <div style={{ textAlign: "center" }}>
          <p style={{
            margin:        "0 0 2px",
            fontSize:      10,
            color:         c.sub,
            fontWeight:    600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            Avg. SGPA needed
          </p>
          <p style={{
            margin:     0,
            fontSize:   30,
            fontWeight: 700,
            color:      isAchievable ? c.ok : c.bad,
          }}>
            {isAchievable ? result.needed : "—"}
          </p>
          <p style={{
            margin:   0,
            fontSize: 11,
            color:    c.muted,
          }}>
            in {result.futureCr} remaining credits
          </p>
        </div>

        {/* Target */}
        <div style={{ textAlign: "right" }}>
          <p style={{
            margin:        "0 0 2px",
            fontSize:      10,
            color:         c.sub,
            fontWeight:    600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            Target CGPA
          </p>
          <p style={{
            margin:     0,
            fontSize:   22,
            fontWeight: 700,
            color:      scoreClr(result.target),
          }}>
            {result.target}
          </p>
          <p style={{
            margin:   0,
            fontSize: 11,
            color:    c.muted,
          }}>
            {result.remainSems} sem{result.remainSems > 1 ? "s" : ""} left
          </p>
        </div>
      </div>

      {/* ── Detail section ────────────────────────────────────────── */}
      <div style={{
        padding:    "14px 16px",
        borderTop:  `1px solid ${c.border}`,
        background: c.card,
      }}>
        {isAchievable ? (
          <>
            {/* Remaining semester breakdown */}
            <p style={{
              margin:   "0 0 10px",
              fontSize: 13,
              color:    c.sub,
            }}>
              Maintain{" "}
              <strong style={{ color: c.text }}>
                {result.needed} SGPA on average
              </strong>{" "}
              in your {result.remainSems} remaining
              semester{result.remainSems > 1 ? "s" : ""}:
            </p>

            {result.remainSemDetails && (
              <div style={{
                display:  "flex",
                flexWrap: "wrap",
                gap:      6,
                marginBottom: 12,
              }}>
                {result.remainSemDetails.map(d => (
                  <div
                    key={d.sem}
                    style={{
                      fontSize:     11,
                      background:   c.hover,
                      border:       `1px solid ${c.border}`,
                      borderRadius: 6,
                      padding:      "4px 10px",
                      color:        c.sub,
                      textAlign:    "center",
                    }}
                  >
                    <div style={{
                      fontWeight: 600,
                      color:      c.text,
                    }}>
                      Sem {d.sem}
                    </div>
                    <div>{d.credits} cr</div>
                  </div>
                ))}
              </div>
            )}

            {/* Credit lock-in explanation */}
            <div style={{
              padding:      "8px 12px",
              background:   c.hover,
              borderRadius: 8,
              fontSize:     12,
              color:        c.sub,
              lineHeight:   1.6,
              marginBottom: 10,
            }}>
              <strong style={{ color: c.text }}>
                Why does the required SGPA look high?
              </strong>{" "}
              You have {result.doneCr} credits already locked in.
              The more credits committed below your target,
              the harder it is to pull the weighted average up —
              similar to how a low score early in a course
              requires a very high score later to compensate.
            </div>

            {/* Difficulty warnings */}
            {parseFloat(result.needed) >= 9.5 && (
              <div style={{
                padding:      "8px 12px",
                background:   parseFloat(result.maxReachable) >= parseFloat(result.target)
                  ? `${c.warn}11`
                  : `${c.bad}11`,
                border:       `1px solid ${
                  parseFloat(result.maxReachable) >= parseFloat(result.target)
                    ? `${c.warn}33`
                    : `${c.bad}33`
                }`,
                borderRadius: 8,
                fontSize:     12,
                color:        parseFloat(result.maxReachable) >= parseFloat(result.target)
                  ? c.warn
                  : c.bad,
              }}>
                {parseFloat(result.maxReachable) >= parseFloat(result.target) ? (
                  <>
                    ⚡ Technically achievable but extremely demanding — you need{" "}
                    <strong>{result.needed}</strong> average SGPA, meaning near-perfect
                    scores in every remaining semester. Your ceiling with perfect scores
                    is <strong>{result.maxReachable}</strong> — just above your target.
                  </>
                ) : (
                  <>
                    ⚠ Not achievable from your current position. Even scoring a perfect
                    10 in all remaining semesters gives a maximum CGPA of{" "}
                    <strong>{result.maxReachable}</strong>.
                    Lower your target to {result.maxReachable} or below.
                  </>
                )}
              </div>
            )}

            {parseFloat(result.needed) >= 8.5
              && parseFloat(result.needed) < 9.5 && (
              <div style={{
                padding:      "8px 12px",
                background:   `${c.warn}11`,
                border:       `1px solid ${c.warn}33`,
                borderRadius: 8,
                fontSize:     12,
                color:        c.warn,
              }}>
                ⚡ Challenging but achievable — requires consistent
                A and A+ grades in most subjects.
              </div>
            )}
          </>
        ) : (
          <>
            <p style={{
              margin:   "0 0 8px",
              fontSize: 13,
              color:    c.bad,
            }}>
              Even scoring 10.00 in all {result.remainSems} remaining
              semesters ({result.futureCr} credits) won't reach
              CGPA {result.target}.
            </p>
            <p style={{
              margin:   0,
              fontSize: 13,
              color:    c.sub,
            }}>
              The maximum reachable CGPA from your current position
              is{" "}
              <strong style={{ color: c.text, fontSize: 15 }}>
                {result.maxReachable}
              </strong>.
              Try a target at or below that.
            </p>
          </>
        )}
      </div>
    </div>
  );
});