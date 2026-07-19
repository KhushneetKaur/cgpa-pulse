import { useState, useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { BRANCHES } from "../data/branches";
import SemesterSidebar from "../components/SemesterSidebar";
import SubjectRow from "../components/SubjectRow";
import CustomiseSubjectsModal from "../components/CustomiseSubjectsModal";
import MobileSemesterPills from "../components/MobileSemesterPills";
import MobileMarksPanel from "../components/MobileMarksPanel";

export default function CalculatorPage() {
  const {
    branch,
    selSem,
    c, cardSty,
  } = useAppData();

  // Memoize empty state styling object so it retains reference consistency
  const emptyCardStyle = useMemo(() => ({
    ...cardSty(),
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    minHeight:      220,
    gap:            8,
    userSelect:     "none",
    cursor:         "default",
    textAlign:      "center",
  }), [cardSty]);

  return (
    <div>
      {/* Mobile semester pills */}
      <div className="mobile-sem-pills" style={{ display: "none" }}>
        <MobileSemesterPills />
      </div>

      {/* Mobile marks layout */}
      <div className="mobile-marks-layout" style={{ display: "none" }}>
        {selSem ? (
          <MobileMarksPanel branch={branch} selSem={selSem} />
        ) : (
          <div style={emptyCardStyle}>
            <p style={{ fontSize: 28, margin: 0, lineHeight: 1 }}>📝</p>
            <p style={{ color: c.muted, fontSize: 14, margin: 0, fontWeight: 500 }}>
              Select a semester above
            </p>
            <p style={{ color: c.muted, fontSize: 12, margin: 0 }}>
              or tap ⚡ to save a known SGPA
            </p>
          </div>
        )}
      </div>

      {/* Desktop grid */}
      <div
        className="desktop-marks-layout calc-grid"
        style={{
          display:             "grid",
          gridTemplateColumns: "196px 1fr",
          gap:                 14,
          alignItems:          "start",
        }}
      >
        <div
          className="calc-sidebar-wrap"
          style={{
            position:  "sticky",
            top:       14,
            maxHeight: "calc(100vh - 28px)",
            overflowY: "auto",
          }}
        >
          <SemesterSidebar />
        </div>

        {!selSem ? (
          <EmptyState c={c} cardSty={cardSty} />
        ) : (
          <MarksPanel />
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ c, cardSty }) {
  const emptyDesktopStyle = useMemo(() => ({
    ...cardSty(),
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    minHeight:      550,
    gap:            10,
    userSelect:     "none",
    cursor:         "default",
  }), [cardSty]);

  return (
    <div style={emptyDesktopStyle}>
      <p style={{ color: c.muted, fontSize: 14, margin: 0, cursor: "default", userSelect: "none" }}>
        ← Select a semester to enter marks
      </p>
      <p style={{ color: c.muted, fontSize: 12, margin: 0, cursor: "default", userSelect: "none" }}>
        or click ⚡ to save a known SGPA directly
      </p>
    </div>
  );
}

// ─── Marks entry panel (Isolated to restrict user input re-renders) ────────────
function MarksPanel() {
  const {
    branch, selSem,
    marks, changeMark,
    saving, saveSem,
    liveRes,
    bElectiveNames, setElectiveName,
    bBacklogs, toggleBacklog,
    openQuick, deleteSemRecord,
    bHist,
    subDisplayName,
    bCustomSubjects, bHiddenSubjects,
    addCustomSubject, removeCustomSubject, toggleHiddenSubject,
    c, dark, inp, btn, cardSty, scoreClr,
  } = useAppData();

  const [showCustomise, setShowCustomise] = useState(false);

  // Extract variables with useMemo to isolate key calculations from core component cycles
  const { subs, totalCr } = useMemo(() => {
    if (!branch || !selSem) return { subs: [], totalCr: 0 };
    
    const hiddenCodes = (bHiddenSubjects || {})[selSem] || [];
    const hardcodedSubs = (BRANCHES[branch]?.semesters?.[selSem]?.subjects || [])
      .filter(s => !hiddenCodes.includes(s.code));
      
    const customSubs = ((bCustomSubjects || {})[selSem] || []).map(s => ({
      ...s,
      isCustom: true,
    }));
    
    const combinedSubs = [...hardcodedSubs, ...customSubs];
    const creditsCount = combinedSubs.reduce((s, sub) => s + sub.credits, 0);
    
    return { subs: combinedSubs, totalCr: creditsCount };
  }, [branch, selSem, bHiddenSubjects, bCustomSubjects]);

  const panelCardStyle = useMemo(() => cardSty(), [cardSty]);

  return (
    <>
      <div style={panelCardStyle}>

        {/* ── Panel header ───────────────────────────────────────────── */}
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "flex-start",
          marginBottom:   10,
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: c.text }}>
              {BRANCHES[branch].semesters[selSem].name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: c.sub }}>
              Total:{" "}
              <strong style={{ color: c.text }}>{totalCr} credits</strong>
              {" "}across {subs.length} subjects — SGPA divides by all {totalCr} credits
            </p>
          </div>

          {/* Live SGPA preview */}
          {liveRes && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: c.sub }}>
                {liveRes.isPartial ? `Estimate (${liveRes.filled}/${liveRes.total} filled)` : "SGPA"}
              </p>
              <p style={{
                margin:     0,
                fontSize:   24,
                fontWeight: 700,
                color:      liveRes.isPartial ? c.purple : scoreClr(liveRes.sgpa),
              }}>
                {liveRes.isPartial ? "~" : ""}{liveRes.sgpa}
              </p>
              {liveRes.isPartial && (
                <p style={{ margin: 0, fontSize: 10, color: c.purple }}>
                  fill all subjects for final value
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Marks scheme reminder ──────────────────────────────────── */}
        <div className="marks-scheme-grid" style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr",
          gap:                 8,
          marginBottom:        14,
        }}>
          <div style={{ padding: "10px 14px", background: c.goldBg, borderRadius: 8, border: `1px solid ${c.gold}33` }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: c.gold, letterSpacing: 0.3, textTransform: "uppercase" }}>
              Theory
            </p>
            <p style={{ margin: 0, fontSize: 12, color: c.sub }}>
              Internal <strong style={{ color: c.text }}>40</strong> + External <strong style={{ color: c.text }}>60</strong> = 100
            </p>
          </div>

          <div style={{ padding: "10px 14px", background: c.goldBg, borderRadius: 8, border: `1px solid ${c.gold}33` }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: c.gold, letterSpacing: 0.3, textTransform: "uppercase" }}>
              Lab / Practical / Training
            </p>
            <p style={{ margin: 0, fontSize: 12, color: c.sub }}>
              Internal <strong style={{ color: c.text }}>60</strong> + External <strong style={{ color: c.text }}>40</strong> = 100
            </p>
          </div>
        </div>

        {/* ── Column headers ─────────────────────────────────────────── */}
        <div className="calc-column-headers" style={{
          display:             "grid",
          gridTemplateColumns: "1fr 34px 80px 80px 90px 50px 34px 34px",
          gap:                 6,
          padding:             "0 0 8px",
          borderBottom:        `2px solid ${c.border}`,
          marginBottom:        10,
        }}>
          {["Subject", "", "Internal", "External", "Total", "Grade", "GP", "BL"].map(h => (
            <p key={h} style={{ margin: 0, fontSize: 10, color: c.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>
              {h}
            </p>
          ))}
        </div>

        {/* ── Subject rows ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {subs.map(sub => (
            <SubjectRow key={sub.code} sub={sub} selSem={selSem} branch={branch} />
          ))}
        </div>

        {/* ── SGPA formula note ──────────────────────────────────────── */}
        <div style={{ marginTop: 14, padding: "9px 12px", background: c.hover, borderRadius: 8, fontSize: 12, color: c.sub, lineHeight: 1.6 }}>
          <strong style={{ color: c.text }}>SGPA</strong> = Σ(Grade Points × Credits) ÷ <strong style={{ color: c.text }}>{totalCr} total semester credits</strong>
          {liveRes?.isPartial && (
            <span style={{ color: c.purple }}> — unfilled subjects add 0 GP but credits still count</span>
          )}
        </div>

        {/* ── Action row ─────────────────────────────────────────────── */}
        <div className="calc-action-row" style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div className="calc-action-buttons" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => openQuick(selSem)} style={{ ...btn("ghost"), fontSize: 12 }}>
              ⚡ Already have my SGPA
            </button>

            <button type="button" onClick={() => setShowCustomise(true)} style={{ ...btn("ghost"), fontSize: 12 }}>
              ✏️ Customise Subjects
            </button>

            {bHist[selSem] && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete entered records for this semester?")) {
                    deleteSemRecord(selSem);
                  }
                }}
                style={{ ...btn("danger"), fontSize: 12 }}
              >
                Delete entered records
              </button>
            )}
          </div>

          <button
            className="calc-save-btn"
            type="button"
            onClick={saveSem}
            disabled={saving}
            style={{
              ...btn("primary"),
              padding: "9px 28px",
              opacity: saving ? 0.7 : 1,
              cursor:  saving ? "default" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Save Semester"}
          </button>
        </div>

      </div>

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
    </>
  );
}