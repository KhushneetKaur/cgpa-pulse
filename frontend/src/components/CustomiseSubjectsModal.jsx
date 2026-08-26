import { useState, useMemo, useCallback } from "react";
import { useTheme }   from "../context/ThemeContext";
import { useAppData } from "../context/AppDataContext";
import { BRANCHES }          from "../data/branches";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";
import toast from "react-hot-toast";

const GLASS_CARD_STYLE = {
  position:             "fixed",
  inset:                0,
  zIndex:               400,
  background:           "rgba(0,0,0,0.6)",
  backdropFilter:       "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  display:              "flex",
  alignItems:           "center",
  justifyContent:       "center",
  padding:              "1rem",
};

const SECTION_LABEL_STYLE = {
  margin:        "0 0 8px",
  fontSize:      11,
  fontWeight:    700,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

// ── Branch-aware subject lookup ───────────────────────────────────────────────
function getBranchSubjects(branch, faculty, selSem) {
  if (!branch || !selSem) return [];
  const branchData = faculty === "pharmacy"
    ? PHARMACY_BRANCHES[branch]
    : BRANCHES[branch];
  return branchData?.semesters?.[selSem]?.subjects || [];
}

export default function CustomiseSubjectsModal({
  branch, selSem,
  bCustomSubjects, bHiddenSubjects,
  addCustomSubject, removeCustomSubject, toggleHiddenSubject,
  onClose,
}) {
  const { dark, c, inp, btn } = useTheme();
  const { faculty } = useAppData(); // ← faculty from context

  const [name,          setName]          = useState("");
  const [credits,       setCredits]       = useState("");
  const [type,          setType]          = useState("theory");
  const [err,           setErr]           = useState("");
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { hardcoded, custom, hiddenCodes } = useMemo(() => ({
    // Uses faculty-aware helper — pharmacy branches now resolve correctly
    hardcoded:   getBranchSubjects(branch, faculty, selSem),
    custom:      bCustomSubjects?.[selSem] || [],
    hiddenCodes: bHiddenSubjects?.[selSem] || [],
  }), [branch, faculty, selSem, bCustomSubjects, bHiddenSubjects]);

  const stopProp = useCallback((e) => e.stopPropagation(), []);

  const handleAdd = useCallback(async (e) => {
    if (e) e.preventDefault();
    const trimmedName   = name.trim();
    const parsedCredits = Number(credits);
    if (!trimmedName) { setErr("Subject name required"); return; }
    if (!credits || isNaN(parsedCredits) || parsedCredits < 1 || parsedCredits > 30) {
      setErr("Credits must be 1–30"); return;
    }
    setErr("");
    setLoading(true);
    try {
      await addCustomSubject(selSem, { name: trimmedName, credits: parsedCredits, type });
      toast.success("Subject added");
      setName(""); setCredits(""); setType("theory");
    } catch {
      setErr("Failed to add subject");
      toast.error("Could not add subject");
    } finally {
      setLoading(false);
    }
  }, [name, credits, type, selSem, addCustomSubject]);

  const handleToggleHide = useCallback(async (subCode, isHidden) => {
    try {
      setActionLoading(true);
      await toggleHiddenSubject(selSem, subCode, !isHidden);
      toast.success(isHidden ? "Subject restored" : "Subject hidden");
    } catch {
      toast.error("Failed to update visibility");
    } finally {
      setActionLoading(false);
    }
  }, [selSem, toggleHiddenSubject]);

  const handleRemoveCustom = useCallback(async (subCode) => {
    try {
      setActionLoading(true);
      await removeCustomSubject(selSem, subCode);
      toast.success("Subject removed");
    } catch {
      toast.error("Failed to remove subject");
    } finally {
      setActionLoading(false);
    }
  }, [selSem, removeCustomSubject]);

  const handleNameChange    = useCallback((e) => { setName(e.target.value);    setErr(""); }, []);
  const handleCreditsChange = useCallback((e) => { setCredits(e.target.value); setErr(""); }, []);
  const handleTypeChange    = useCallback((e) => setType(e.target.value), []);

  // Subject type options — pharmacy gets richer set, engineering keeps simple set
  const typeOptions = faculty === "pharmacy"
    ? [
        { value: "theory",       label: "Theory (25 int + 75 ext)" },
        { value: "lab",          label: "Practical / Lab (15 int + 35 ext)" },
        { value: "theory-small", label: "NUE Theory (15 int + 35 ext)" },
        { value: "theory-75",    label: "NUE Theory-75 (25 int + 50 ext)" },
        { value: "lab-small",    label: "NUE Practical (10 int + 15 ext)" },
        { value: "project",      label: "Project / Thesis" },
      ]
    : [
        { value: "theory",  label: "Theory (40 int + 60 ext)" },
        { value: "lab",     label: "Lab / Practical (60 int + 40 ext)" },
        { value: "project", label: "Project / Thesis" },
      ];

  return (
    <div className="customise-modal-backdrop" style={GLASS_CARD_STYLE} onClick={onClose}>
      <div
        className="customise-modal-card"
        onClick={stopProp}
        style={{
          background:      c.card,
          border:          `1px solid ${c.border}`,
          borderRadius:    16,
          padding:         "24px",
          maxWidth:        480,
          width:           "100%",
          maxHeight:       "85vh",
          overflowY:       "auto",
          scrollbarWidth:  "none",
          msOverflowStyle: "none",
          boxShadow:       dark
            ? "0 20px 60px rgba(0,0,0,0.6)"
            : "0 20px 60px rgba(109,40,217,0.15)",
        }}
      >
        <style>{`.customise-modal-card::-webkit-scrollbar { display: none; }`}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.text }}>
              ✏️ Customise Subjects
            </p>
            <p style={{ margin: 0, fontSize: 12, color: c.sub }}>
              {faculty === "pharmacy" ? "Pharm" : "Sem"} {selSem} — hide or add subjects
            </p>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ background: "transparent", border: "none", fontSize: 20, color: c.sub, cursor: "pointer" }}>
            ×
          </button>
        </div>

        {/* Existing subjects */}
        {hardcoded.length > 0 && (
          <>
            <p style={{ ...SECTION_LABEL_STYLE, color: c.muted }}>Existing Subjects</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {hardcoded.map(sub => {
                const isHidden = hiddenCodes.includes(sub.code);
                return (
                  <div key={sub.code} style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    padding:        "9px 12px",
                    borderRadius:   8,
                    background:     isHidden ? `${c.bad}08` : c.hover,
                    border:         `1px solid ${isHidden ? `${c.bad}30` : c.border}`,
                    opacity:        isHidden ? 0.65 : 1,
                    transition:     "all 0.15s",
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, color: c.text, textDecoration: isHidden ? "line-through" : "none" }}>
                        {sub.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: c.muted }}>
                        {sub.credits} cr · {sub.type}
                      </p>
                    </div>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleToggleHide(sub.code, isHidden)}
                      style={{ ...btn(isHidden ? "success" : "danger"), fontSize: 11, padding: "4px 10px", opacity: actionLoading ? 0.6 : 1 }}
                    >
                      {isHidden ? "Restore" : "Hide"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Custom subjects */}
        {custom.length > 0 && (
          <>
            <p style={{ ...SECTION_LABEL_STYLE, color: c.muted }}>Added Subjects</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {custom.map(sub => (
                <div key={sub.code} style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                  padding:        "9px 12px",
                  borderRadius:   8,
                  background:     `${c.ok}08`,
                  border:         `1px solid ${c.ok}30`,
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: c.text }}>{sub.name}</p>
                    <p style={{ margin: 0, fontSize: 10, color: c.muted }}>{sub.credits} cr · {sub.type}</p>
                  </div>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleRemoveCustom(sub.code)}
                    style={{ ...btn("danger"), fontSize: 11, padding: "4px 10px", opacity: actionLoading ? 0.6 : 1 }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add new subject */}
        <p style={{ ...SECTION_LABEL_STYLE, color: c.muted }}>Add New Subject</p>
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="text" autoFocus
            value={name} onChange={handleNameChange}
            placeholder="Subject name"
            style={{ ...inp(), width: "100%", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="number"
              value={credits} onChange={handleCreditsChange}
              placeholder="Credits (1–30)"
              min="1" max="30"
              style={{ ...inp(), flex: 1 }}
            />
            <select value={type} onChange={handleTypeChange} style={{ ...inp(), flex: 1 }}>
              {typeOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {err && <p style={{ margin: 0, fontSize: 12, color: c.bad, fontWeight: 500 }}>⚠ {err}</p>}

          <button type="submit" disabled={loading}
            style={{ ...btn("primary"), width: "100%", padding: "10px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Adding..." : "+ Add Subject"}
          </button>
        </form>

        {/* Info note */}
        <div style={{
          marginTop:    16,
          padding:      "8px 12px",
          background:   dark ? "rgba(148,163,184,0.08)" : "rgba(217,119,6,0.06)",
          border:       `1px solid ${dark ? "rgba(148,163,184,0.2)" : "rgba(217,119,6,0.15)"}`,
          borderRadius: 8,
          fontSize:     11,
          color:        dark ? "#94a3b8" : "#92400e",
          lineHeight:   1.6,
        }}>
          Hiding a subject removes it from SGPA calculation.
          Restoring includes it again from the next save.
          Custom subjects persist across sessions.
          {faculty === "pharmacy" && (
            <span> For pharmacy subjects, select the correct type to ensure proper internal/external mark limits.</span>
          )}
        </div>
      </div>
    </div>
  );
}