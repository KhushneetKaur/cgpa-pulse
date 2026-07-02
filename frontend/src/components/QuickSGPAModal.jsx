import { useAppData } from "../context/AppDataContext";
import { BRANCHES } from "../data/branches";

// Modal for entering a known SGPA directly without
// going through subject-by-subject mark entry.
// Triggered by the ⚡ button next to each semester.

export default function QuickSGPAModal() {
  const {
    qSem, qVal, setQVal, qErr,
    closeQuick, saveQuick, deleteQuick,
    branch, bHist,
    c, inp, btn,
  } = useAppData();

  if (!qSem || !branch) return null;

  const semName = BRANCHES[branch].semesters[qSem].name;
  const totalCr = BRANCHES[branch].semesters[qSem].subjects
    .reduce((s, sub) => s + sub.credits, 0);
    const hasSavedSGPA = !!bHist[qSem]?.sgpa;

  return (
    // Backdrop
    <div
      onClick={closeQuick}
      style={{
        position:       "fixed",
        inset:          0,
        background:     "rgba(0,0,0,0.6)",
        zIndex:         300,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "1rem",
      }}
    >
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:   c.card,
          border:       `1px solid ${c.border}`,
          borderRadius: 12,
          padding:      "1.25rem",
          maxWidth:     380,
          width:        "100%",
        }}
      >
        {/* Header */}
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "flex-start",
          marginBottom:   14,
        }}>
          <div>
            <p style={{
              margin:     0,
              fontSize:   15,
              fontWeight: 600,
              color:      c.text,
            }}>
              ⚡ Quick SGPA Entry
            </p>
            <p style={{
              margin:    0,
              fontSize:  12,
              color:     c.sub,
              marginTop: 2,
            }}>
              Sem {qSem} · {semName}
            </p>
          </div>

          <button
            onClick={closeQuick}
            style={{
              background: "transparent",
              border:     "none",
              fontSize:   22,
              color:      c.sub,
              cursor:     "pointer",
              lineHeight: 1,
              padding:    "0 4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Description */}
        <p style={{
          fontSize:     13,
          color:        c.sub,
          margin:       "0 0 16px",
          lineHeight:   1.6,
        }}>
          Already have your official result? Enter your SGPA directly —
          no need to re-enter individual subject marks.
        </p>

        {/* SGPA input */}
        <label style={{
          fontSize:     12,
          color:        c.sub,
          display:      "block",
          marginBottom: 6,
          fontWeight:   500,
        }}>
          Your SGPA (0.00 – 10.00)
        </label>

        <input
          type="number"
          min="0"
          max="10"
          step="0.01"
          value={qVal}
          onChange={e => {
            setQVal(e.target.value);
          }}
          onKeyDown={e => e.key === "Enter" && saveQuick()}
          placeholder="e.g. 8.45"
          autoFocus
          style={{
            ...inp({
              fontSize:  18,
              textAlign: "center",
              padding:   "10px",
              width:     "100%",
            }),
            marginBottom: 6,
          }}
        />

        {/* Inline error */}
        {qErr && (
          <p style={{
            fontSize:     12,
            color:        c.bad,
            margin:       "0 0 10px",
            fontWeight:   500,
          }}>
            {qErr}
          </p>
        )}

        {/* Credit info */}
        <p style={{
          fontSize:     11,
          color:        c.muted,
          margin:       "0 0 16px",
        }}>
          Total credits this semester: <strong style={{ color: c.text }}>
            {totalCr} cr
          </strong>
          {" "}— used as weight in CGPA calculation
        </p>

        {/* Info strip */}
        <div style={{
          padding:      "8px 12px",
          background:   c.goldBg,
          border:       `1px solid ${c.gold}33`,
          borderRadius: 8,
          marginBottom: 16,
          fontSize:     12,
          color:        c.sub,
          lineHeight:   1.5,
        }}>
          <strong style={{ color: c.gold }}>Note:</strong> This saves your
          known SGPA directly. You can still go back and enter subject-wise
          marks later — they won't affect this saved SGPA unless you
          explicitly hit <em>Save Semester</em> again.
        </div>

        {/* Action buttons */}
        <div className="qsgpa-actions" style={{ display: "flex", gap: 8 }}>
  {hasSavedSGPA && (
    <button
      type="button"
      onClick={deleteQuick}
      style={{
        ...btn("danger"),
        flex: 1,
      }}
    >
      Delete
    </button>
  )}

  <button
    type="button"
    onClick={closeQuick}
    style={{
      ...btn("ghost"),
      flex: 1,
    }}
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={saveQuick}
    style={{
      ...btn("primary"),
      flex: 2,
      padding: "9px 16px",
      borderRadius: 8,
    }}
  >
    Save SGPA
  </button>
</div>
      </div>
    </div>
  );
}