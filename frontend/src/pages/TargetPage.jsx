import { memo, useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme } from "../context/ThemeContext";

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

function StatCol({ label, value, sub, color, align = "left", size = 22 }) {
  const { c } = useTheme();
  return (
    <div style={{ textAlign: align }}>
      <p style={{ margin: "0 0 2px", fontSize: 10, color: c.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: size, fontWeight: 700, color }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: 11, color: c.muted }}>{sub}</p>
    </div>
  );
}

export default function TargetPage() {
  const {
    cgpa, doneSems,
    targetCGPA, setTargetCGPA,
    targetResult, setTargetResult,
    runCalcTarget,
  } = useAppData();

  // Remove dark + toggleDark — unused
  const { c, btn, inp, cardSty, scoreClr } = useTheme();

  const card = cardSty(); // call once — already memoized in ThemeContext

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Target CGPA calculator ─────────────────────────────── */}
      <div style={card}>
        <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: c.text }}>
          🎯 Target CGPA Calculator
        </p>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: c.sub }}>
          Find out what average SGPA you need in remaining semesters to reach your CGPA goal.
        </p>

        {doneSems === 0 && (
          <div style={{
            padding: "10px 14px", background: c.goldBg,
            border: `1px solid ${c.gold}33`, borderRadius: 8,
            marginBottom: 14, fontSize: 13, color: c.sub,
          }}>
            Save at least one semester first so we know your current standing.
          </div>
        )}

        <div
          className="target-input-row"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}
        >
          {/* Current CGPA — read only */}
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: c.sub, fontWeight: 500 }}>Current CGPA</p>
            <div style={{ ...inp(), padding: "10px 14px", fontSize: 20, fontWeight: 700, color: cgpa ? scoreClr(cgpa) : c.muted }}>
              {cgpa || "—"}
            </div>
          </div>

          {/* Target input */}
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: c.sub, fontWeight: 500 }}>Your Target CGPA</p>
            <input
              type="number"
              min="0" max="10" step="0.01"
              value={targetCGPA}
              onChange={e => { setTargetCGPA(e.target.value); setTargetResult(null); }}
              onKeyDown={e => e.key === "Enter" && runCalcTarget()}
              placeholder="e.g. 8.5"
              style={{ ...inp({ fontSize: 16, textAlign: "center", padding: "10px" }), width: "100%" }}
            />
          </div>
        </div>

        <div style={{
          padding: "10px 14px", background: c.hover,
          border: `1px solid ${c.border}`, borderRadius: 8,
          fontSize: 12, color: c.sub, lineHeight: 1.6, marginBottom: 14,
        }}>
          <strong style={{ color: c.text }}>Why does CGPA differ from the average of my SGPAs?</strong>
          <br />
          CGPA is <em>credit-weighted</em> — semesters with more credits carry proportionally more weight.
          Sem 5 has 27 credits vs Sem 1's 19 credits, so Sem 5 influences your CGPA ~1.4× more.
        </div>

        <button
          onClick={runCalcTarget}
          disabled={doneSems === 0}
          style={{ ...btn("primary"), padding: "10px 32px", opacity: doneSems === 0 ? 0.5 : 1, cursor: doneSems === 0 ? "default" : "pointer" }}
        >
          Calculate Required SGPA
        </button>

        {targetResult && (
          <div style={{ marginTop: 16 }}>
            <TargetResult result={targetResult} />
          </div>
        )}
      </div>

      {/* ── Percentage converter ──────────────────────────────────── */}
      <div style={card}>
        <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: c.text }}>
          📊 CGPA ↔ Percentage Converter
        </p>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: c.sub }}>
          MRSPTU formula: <strong style={{ color: c.text }}>Percentage = CGPA × 10</strong>
        </p>

        {cgpa && (
          <div
            className="target-cgpa-highlight"
            style={{
              padding: "12px 14px", background: c.accentLt,
              border: `1px solid ${c.accentTxt}44`, borderRadius: 8,
              marginBottom: 12, display: "flex", alignItems: "center", gap: 12,
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 11, color: c.sub }}>Your current CGPA</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: scoreClr(cgpa) }}>{cgpa}</p>
            </div>
            <div style={{ fontSize: 20, color: c.muted }}>→</div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: c.sub }}>Equivalent percentage</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: scoreClr(cgpa) }}>
                {(parseFloat(cgpa) * 10).toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        <div
          className="target-pct-table"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 6 }}
        >
          {CGPA_PERCENTAGE_REFS.map(({ cgpa: cg, pct }) => (
            <div
              key={cg}
              style={{
                padding: "8px 12px", background: c.hover,
                borderRadius: 8, border: `1px solid ${c.border}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: scoreClr(cg) }}>{cg}</span>
              <span style={{ fontSize: 12, color: c.muted }}>→</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: scoreClr(cg) }}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Target result — uses useTheme directly, no prop drilling ─────────────────
const TargetResult = memo(function TargetResult({ result }) {
  const { c, scoreClr } = useTheme();

  if (result.error) {
    return (
      <div style={{ padding: "14px 16px", background: `${c.bad}11`, border: `1px solid ${c.bad}44`, borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: 13, color: c.bad }}>{result.error}</p>
      </div>
    );
  }

  if (result.alreadyAchieved) {
    return (
      <div style={{ padding: "14px 16px", background: `${c.ok}11`, border: `1px solid ${c.ok}44`, borderRadius: 10 }}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: c.ok }}>🎉 Already achieved!</p>
        <p style={{ margin: 0, fontSize: 13, color: c.sub }}>
          Your current CGPA <strong style={{ color: c.text }}>{result.currentCGPA}</strong> already meets
          your target of <strong style={{ color: c.text }}>{result.target}</strong>. Set a higher goal!
        </p>
      </div>
    );
  }

  const isAchievable  = result.achievable;
  const needed        = parseFloat(result.needed);       // compute once
  const maxReachable  = parseFloat(result.maxReachable); // compute once
  const borderColor   = isAchievable ? c.accentTxt : c.bad;
  const isExtremely   = needed >= 9.5;
  const isChallenging = needed >= 8.5 && needed < 9.5;
  const canReach      = maxReachable >= parseFloat(result.target);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${borderColor}` }}>

      {/* 3-column header */}
      <div
        className="target-result-grid"
        style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          background: isAchievable ? c.accentLt : `${c.bad}11`,
          padding: "16px", gap: 12,
        }}
      >
        <StatCol
          label="Current CGPA"
          value={result.currentCGPA}
          sub={`${result.doneCr} credits locked`}
          color={scoreClr(result.currentCGPA)}
        />
        <StatCol
          label="Avg. SGPA needed"
          value={isAchievable ? result.needed : "—"}
          sub={`in ${result.futureCr} remaining credits`}
          color={isAchievable ? c.ok : c.bad}
          align="center"
          size={30}
        />
        <StatCol
          label="Target CGPA"
          value={result.target}
          sub={`${result.remainSems} sem${result.remainSems > 1 ? "s" : ""} left`}
          color={scoreClr(result.target)}
          align="right"
        />
      </div>

      {/* Detail section */}
      <div style={{ padding: "14px 16px", borderTop: `1px solid ${c.border}`, background: c.card }}>
        {isAchievable ? (
          <>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: c.sub }}>
              Maintain <strong style={{ color: c.text }}>{result.needed} SGPA on average</strong> in
              your {result.remainSems} remaining semester{result.remainSems > 1 ? "s" : ""}:
            </p>

            {result.remainSemDetails && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {result.remainSemDetails.map(d => (
                  <div key={d.sem} style={{
                    fontSize: 11, background: c.hover, border: `1px solid ${c.border}`,
                    borderRadius: 6, padding: "4px 10px", color: c.sub, textAlign: "center",
                  }}>
                    <div style={{ fontWeight: 600, color: c.text }}>Sem {d.sem}</div>
                    <div>{d.credits} cr</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              padding: "8px 12px", background: c.hover, borderRadius: 8,
              fontSize: 12, color: c.sub, lineHeight: 1.6, marginBottom: 10,
            }}>
              <strong style={{ color: c.text }}>Why does the required SGPA look high?</strong>{" "}
              You have {result.doneCr} credits already locked in. The more credits committed below
              your target, the harder it is to pull the weighted average up.
            </div>

            {isExtremely && (
              <div style={{
                padding: "8px 12px",
                background: canReach ? `${c.warn}11` : `${c.bad}11`,
                border: `1px solid ${canReach ? `${c.warn}33` : `${c.bad}33`}`,
                borderRadius: 8, fontSize: 12,
                color: canReach ? c.warn : c.bad,
              }}>
                {canReach ? (
                  <>⚡ Technically achievable but extremely demanding — you need <strong>{result.needed}</strong> average
                  SGPA. Your ceiling with perfect scores is <strong>{result.maxReachable}</strong>.</>
                ) : (
                  <>⚠ Not achievable from your current position. Even scoring a perfect 10 in all remaining
                  semesters gives a maximum CGPA of <strong>{result.maxReachable}</strong>.
                  Lower your target to {result.maxReachable} or below.</>
                )}
              </div>
            )}

            {isChallenging && (
              <div style={{
                padding: "8px 12px", background: `${c.warn}11`,
                border: `1px solid ${c.warn}33`, borderRadius: 8, fontSize: 12, color: c.warn,
              }}>
                ⚡ Challenging but achievable — requires consistent A and A+ grades in most subjects.
              </div>
            )}
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: c.bad }}>
              Even scoring 10.00 in all {result.remainSems} remaining semesters ({result.futureCr} credits)
              won't reach CGPA {result.target}.
            </p>
            <p style={{ margin: 0, fontSize: 13, color: c.sub }}>
              The maximum reachable CGPA from your current position is{" "}
              <strong style={{ color: c.text, fontSize: 15 }}>{result.maxReachable}</strong>.
              Try a target at or below that.
            </p>
          </>
        )}
      </div>
    </div>
  );
});