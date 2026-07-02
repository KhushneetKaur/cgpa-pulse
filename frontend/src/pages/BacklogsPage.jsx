import { useAppData } from "../context/AppDataContext";
import { BRANCHES } from "../data/branches";

export default function BacklogsPage() {
  const {
    branch,
    semKeys,
    bBacklogs,
    bElectiveNames,
    toggleBacklog,
    c, cardSty,
  } = useAppData();

  const totalBacklogs = Object.values(bBacklogs)
    .reduce((a, arr) => a + (arr?.length || 0), 0);

  return (
    <div style={cardSty()}>

      {/* Header */}
      <p style={{
        margin:     "0 0 4px",
        fontSize:   15,
        fontWeight: 600,
        color:      c.text,
      }}>
        ⚠ Backlog Tracker
      </p>
      <p style={{
        margin:   "0 0 16px",
        fontSize: 13,
        color:    c.sub,
      }}>
        Subjects marked as backlog across all semesters.
        Mark them cleared once you pass the reappear exam.
      </p>

      {/* No backlogs */}
      {totalBacklogs === 0 ? (
        <div style={{
          textAlign: "center",
          padding:   "2.5rem 0",
        }}>
          <p style={{ fontSize: 40, margin: "0 0 10px" }}>🎉</p>
          <p style={{
            color:      c.ok,
            fontSize:   15,
            fontWeight: 600,
            margin:     0,
          }}>
            No active backlogs!
          </p>
          <p style={{
            color:   c.muted,
            fontSize: 12,
            margin:  "6px 0 0",
          }}>
            Keep it up.
          </p>
        </div>
      ) : (
        <div style={{
          display:       "flex",
          flexDirection: "column",
          gap:           12,
        }}>
          {semKeys.map(s => {
            const semBLs = bBacklogs[s] || [];
            if (!semBLs.length) return null;

            const subs = BRANCHES[branch].semesters[s].subjects;

            return (
              <div
                key={s}
                style={{
                  border:       `1px solid ${c.bad}44`,
                  borderRadius: 10,
                  padding:      "12px 14px",
                  background:   `${c.bad}06`,
                }}
              >
                {/* Semester heading */}
                <p style={{
                  margin:     "0 0 10px",
                  fontSize:   14,
                  fontWeight: 600,
                  color:      c.bad,
                }}>
                  ⚠ {BRANCHES[branch].semesters[s].name} —{" "}
                  {semBLs.length} backlog
                  {semBLs.length > 1 ? "s" : ""}
                </p>

                {/* Backlog subjects */}
                <div style={{
                  display:       "flex",
                  flexDirection: "column",
                  gap:           8,
                }}>
                  {subs
                    .filter(sub => semBLs.includes(sub.code))
                    .map(sub => {
                      const displayName =
                        bElectiveNames[sub.code] &&
                        bElectiveNames[sub.code] !== "__other__"
                          ? bElectiveNames[sub.code]
                          : sub.name;

                      return (
                        <div
                          key={sub.code}
                          className="backlog-subject-row"
                          style={{
                          display:        "flex",
                          justifyContent: "space-between",
                          alignItems:     "center",
                          padding:        "10px 12px",
                          background:     c.card,
                          borderRadius:   8,
                          border:         `1px solid ${c.bad}22`,
                          }}
                          >
                          {/* Subject info */}
                          <div>
                            <p style={{
                              margin:     0,
                              fontSize:   13,
                              color:      c.text,
                              fontWeight: 500,
                            }}>
                              {displayName}
                            </p>
                            <p style={{
                              margin:   0,
                              fontSize: 11,
                              color:    c.muted,
                            }}>
                              {sub.code} · {sub.credits} cr ·{" "}
                              {sub.type === "lab" ? "Lab / Practical" : "Theory"}
                            </p>
                          </div>

                          {/* Clear button */}
                          <button
  onClick={() => toggleBacklog(s, sub.code)}
  className="backlog-clear-btn"
  style={{
    padding:      "5px 14px",
    background:   `${c.ok}18`,
    border:       `1px solid ${c.ok}`,
    borderRadius: 8,
    color:        c.ok,
    fontSize:     12,
    fontWeight:   600,
    cursor:       "pointer",
    whiteSpace:   "nowrap",
  }}
>
  ✓ Mark Cleared
</button>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How to add backlogs tip */}
      <div style={{
        marginTop:    16,
        padding:      "10px 14px",
        background:   c.hover,
        borderRadius: 8,
        border:       `1px solid ${c.border}`,
        fontSize:     13,
        color:        c.sub,
        lineHeight:   1.6,
      }}>
        <strong style={{ color: c.text }}>How to mark a backlog:</strong>{" "}
        Go to the <strong style={{ color: c.text }}>Calculator</strong> tab
        → select the semester → click the{" "}
        <strong style={{ color: c.bad }}>!</strong> button
        on the right side of any subject row.
      </div>
    </div>
  );
}