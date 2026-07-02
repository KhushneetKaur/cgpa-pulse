import { useAppData } from "../context/AppDataContext";
import { BRANCHES } from "../data/branches";
import { getGrade } from "../data/gradeTable";
import { cgpaToPercentage, getPerformanceLabel } from "../utils/calculations";
import SemesterCard from "../components/SemesterCard";
import SkeletonCard from "../components/SkeletonCard";

export default function HistoryPage() {
  const {
  branch,
  semKeys,
  bHist,
  bBacklogs,
  bElectiveNames,
  cgpa,
  doneSems,
  lbOptIn, toggleLbOptIn,
  openQuick,
  c, dark, cardSty, btn, scoreClr,
  authLoading,
} = useAppData();

if (authLoading) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* CGPA summary card skeleton */}
      <SkeletonCard dark={dark} rows={3} height={160} />
      {/* Semester cards skeleton */}
      {[1, 2, 3].map(i => (
        <SkeletonCard key={i} dark={dark} rows={4} height={120} />
      ))}
    </div>
  );
}
  const percentage  = cgpaToPercentage(cgpa);
  const performance = cgpa ? getPerformanceLabel(cgpa) : null;

  if (doneSems === 0) {
    return (
      <div style={cardSty()}>
        <div style={{
          textAlign:  "center",
          padding:    "2.5rem 0",
        }}>
          <p style={{ fontSize: 36, margin: "0 0 10px" }}>📭</p>
          <p style={{
            color:    c.sub,
            fontSize: 14,
            margin:   0,
          }}>
            No semesters saved yet.
          </p>
          <p style={{
            color:    c.muted,
            fontSize: 12,
            margin:   "6px 0 0",
          }}>
            Head to the Calculator tab and save a semester to see your history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      gap:           14,
    }}>

      {/* ── CGPA summary card ─────────────────────────────────────── */}
      <div style={cardSty()}>
        <div
  className="history-summary-row"
  style={{
    display:     "flex",
    alignItems:  "flex-end",
    gap:         20,
    flexWrap:    "wrap",
  }}
>

          {/* Left: CGPA number */}
          <div className="history-cgpa-block">
            <p style={{
              margin:   0,
              fontSize: 12,
              color:    c.sub,
              marginBottom: 4,
            }}>
              Cumulative CGPA — {BRANCHES[branch].name}
            </p>
            <p style={{
              margin:     0,
              fontSize:   52,
              fontWeight: 700,
              color:      scoreClr(cgpa),
              lineHeight: 1,
            }}>
              {cgpa}
            </p>
            <p style={{
              margin:     "4px 0 2px",
              fontSize:   13,
              color:      c.ok,
              fontWeight: 600,
            }}>
              ≈ {percentage}%
              <span style={{
                fontSize:   11,
                color:      c.muted,
                fontWeight: 400,
                marginLeft: 6,
              }}>
                (CGPA × 10)
              </span>
            </p>
            {performance && (
              <p style={{
                margin:   0,
                fontSize: 12,
                color:    c.sub,
              }}>
                {performance.label}
                <span style={{
                  fontSize:   11,
                  color:      c.muted,
                  marginLeft: 8,
                }}>
                  {doneSems}/8 semesters saved
                </span>
              </p>
            )}
          </div>

          {/* Right: SGPA bar chart */}
          <div
  className="history-bar-chart"
  style={{
            flex:        1,
            display:     "flex",
            alignItems:  "flex-end",
            gap:         4,
            height:      60,
            minWidth:    160,
          }}>
            {semKeys.map(s => {
              const v     = bHist[s]?.sgpa ? parseFloat(bHist[s].sgpa) : 0;
              const isQ   = bHist[s]?.mode === "quick";
              const color = v
                ? (isQ ? c.purple : scoreClr(v))
                : c.border;

              return (
                <div
                  key={s}
                  style={{
                    flex:          1,
                    display:       "flex",
                    flexDirection: "column",
                    alignItems:    "center",
                    gap:           3,
                  }}
                >
                  {/* SGPA value label */}
                  {v > 0 && (
                    <span style={{
                      fontSize: 8,
                      color:    color,
                      fontWeight: 600,
                    }}>
                      {v}
                    </span>
                  )}
                  {/* Bar */}
                  <div
                    title={`Sem ${s}: ${v || "not saved"}`}
                    style={{
                      width:        "100%",
                      minHeight:    2,
                      height:       v ? `${(v / 10) * 44}px` : "2px",
                      background:   color,
                      borderRadius: "3px 3px 0 0",
                      transition:   "height 0.3s ease",
                    }}
                  />
                  {/* Semester label */}
                  <span style={{
                    fontSize: 9,
                    color:    c.muted,
                  }}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard opt-in strip */}
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          gap:            10,
          marginTop:      16,
          paddingTop:     14,
          borderTop:      `1px solid ${c.border}`,
          flexWrap:       "wrap",
        }}>
          <div>
            <p style={{
              margin:     0,
              fontSize:   13,
              fontWeight: 600,
              color:      c.gold,
            }}>
              🏆 Leaderboard
            </p>
            <p style={{
              margin:   0,
              fontSize: 12,
              color:    c.sub,
            }}>
              {lbOptIn
                ? "Your CGPA is visible on the leaderboard"
                : "Share your CGPA anonymously on the leaderboard"}
            </p>
          </div>
          <button
            onClick={toggleLbOptIn}
            style={{
              ...btn("ghost"),
              fontSize:    12,
              borderColor: lbOptIn ? c.ok : c.border,
              color:       lbOptIn ? c.ok : c.sub,
              fontWeight:  lbOptIn ? 600 : 400,
              whiteSpace:  "nowrap",
            }}
          >
            {lbOptIn ? "✓ Opted in · Opt out" : "Opt in"}
          </button>
        </div>
      </div>

      {/* ── Semester cards ────────────────────────────────────────── */}
      <div style={{
        display:       "flex",
        flexDirection: "column",
        gap:           10,
      }}>
        {semKeys
          .filter(s => bHist[s]?.sgpa)
          .map(s => (
            <SemesterCard
              key={s}
              sem={s}
              h={bHist[s]}
              subs={BRANCHES[branch].semesters[s].subjects}
              semBLs={bBacklogs[s] || []}
              electiveNames={bElectiveNames}
              onEdit={() => openQuick(s)}
              c={c}
              btn={btn}
              scoreClr={scoreClr}
            />
          ))}
      </div>

    </div>
  );
}
