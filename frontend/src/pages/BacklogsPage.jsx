import { memo, useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme } from "../context/ThemeContext";
import { BRANCHES } from "../data/branches";

// ── Individual backlog subject row — memoized ─────────────────────────────────
const BacklogRow = memo(function BacklogRow({ sub, semKey, bElectiveNames, toggleBacklog }) {
  const { c } = useTheme();

  const displayName = useMemo(() => {
    const custom = bElectiveNames[sub.code];
    return custom && custom !== "__other__" ? custom : sub.name;
  }, [bElectiveNames, sub.code, sub.name]);

  return (
    <div
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
      <div>
        <p style={{ margin: 0, fontSize: 13, color: c.text, fontWeight: 500 }}>
          {displayName}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: c.muted }}>
          {sub.code} · {sub.credits} cr · {sub.type === "lab" ? "Lab / Practical" : "Theory"}
        </p>
      </div>
      <button
        onClick={() => toggleBacklog(semKey, sub.code)}
        aria-label={`Mark ${displayName} as cleared`}
        className="backlog-clear-btn"
        style={{
          padding:     "5px 14px",
          background:  `${c.ok}18`,
          border:      `1px solid ${c.ok}`,
          borderRadius: 8,
          color:       c.ok,
          fontSize:    12,
          fontWeight:  600,
          cursor:      "pointer",
          whiteSpace:  "nowrap",
        }}
      >
        ✓ Mark Cleared
      </button>
    </div>
  );
});

// ── Semester backlog group — memoized ─────────────────────────────────────────
const SemBacklogGroup = memo(function SemBacklogGroup({ s, semBLs, semesterData, bElectiveNames, toggleBacklog }) {
  const { c } = useTheme();

  const backlogSubs = useMemo(
    () => (semesterData?.subjects || []).filter(sub => semBLs.includes(sub.code)),
    [semesterData, semBLs]
  );

  if (!backlogSubs.length) return null;

  return (
    <div style={{
      border:       `1px solid ${c.bad}44`,
      borderRadius: 10,
      padding:      "12px 14px",
      background:   `${c.bad}06`,
    }}>
      <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600, color: c.bad }}>
        ⚠ {semesterData?.name || `Semester ${s}`} —{" "}
        {semBLs.length} backlog{semBLs.length > 1 ? "s" : ""}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {backlogSubs.map(sub => (
          <BacklogRow
            key={sub.code}
            sub={sub}
            semKey={s}
            bElectiveNames={bElectiveNames}
            toggleBacklog={toggleBacklog}
          />
        ))}
      </div>
    </div>
  );
});

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BacklogsPage() {
  const {
    branch, semKeys, bBacklogs,
    bElectiveNames, toggleBacklog,
    totalBacklogs,  // ← already computed in AppDataContext
  } = useAppData();

  const { c, cardSty } = useTheme();

  // Memoize branch data lookup
  const branchSemesters = useMemo(
    () => BRANCHES[branch]?.semesters || {},
    [branch]
  );

  const card = cardSty();

  return (
    <div style={card}>
      <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: c.text }}>
        ⚠ Backlog Tracker
      </p>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: c.sub }}>
        Subjects marked as backlog across all semesters.
        Mark them cleared once you pass the reappear exam.
      </p>

      {totalBacklogs === 0 ? (
        <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
          <p style={{ fontSize: 40, margin: "0 0 10px" }}>🎉</p>
          <p style={{ color: c.ok, fontSize: 15, fontWeight: 600, margin: 0 }}>
            No active backlogs!
          </p>
          <p style={{ color: c.muted, fontSize: 12, margin: "6px 0 0" }}>
            Keep it up.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {semKeys.map(s => (
            <SemBacklogGroup
              key={s}
              s={s}
              semBLs={bBacklogs[s] || []}
              semesterData={branchSemesters[s]}
              bElectiveNames={bElectiveNames}
              toggleBacklog={toggleBacklog}
            />
          ))}
        </div>
      )}

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
        {" "}→ select the semester → click the{" "}
        <strong style={{ color: c.bad }}>!</strong> button on the right side of any subject row.
      </div>
    </div>
  );
}