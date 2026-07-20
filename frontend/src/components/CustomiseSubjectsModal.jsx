import { useState } from "react";
import { BRANCHES } from "../data/branches";
import toast from "react-hot-toast";

export default function CustomiseSubjectsModal({
  dark, c, inp, btn,
  branch, selSem,
  bCustomSubjects, bHiddenSubjects,
  addCustomSubject, removeCustomSubject, toggleHiddenSubject,
  onClose,
}) {
  const [name,    setName]    = useState("");
  const [credits, setCredits] = useState("");
  const [type,    setType]    = useState("theory");
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const hardcoded  = BRANCHES[branch].semesters[selSem].subjects;
  const custom     = bCustomSubjects[selSem] || [];
  const hiddenCodes = bHiddenSubjects[selSem] || [];

  async function handleAdd() {
    if (!name.trim())                    { setErr("Subject name required"); return; }
    if (!credits || isNaN(Number(credits))
        || Number(credits) < 1
        || Number(credits) > 10)         { setErr("Credits must be 1–10"); return; }
    setErr("");
    setLoading(true);
    try {
      await addCustomSubject(selSem, {
        name:    name.trim(),
        credits: Number(credits),
        type,
      });
      setName("");
      setCredits("");
      setType("theory");
    } catch {
      setErr("Failed to add subject");
    } finally {
      setLoading(false);
    }
  }

  const glassCard = {
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

  return (
    <div className="customise-modal-backdrop" style={glassCard} onClick={onClose}>
     <div
  className="customise-modal-card"
  onClick={e => e.stopPropagation()}
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
  <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        
        {/* Header */}
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          marginBottom:   20,
        }}>
          <div>
            <p style={{
              margin:     0,
              fontSize:   15,
              fontWeight: 700,
              color:      c.text,
            }}>
              ✏️ Customise Subjects
            </p>
            <p style={{
              margin:   0,
              fontSize: 12,
              color:    c.sub,
            }}>
              Semester {selSem} — hide removed subjects or add new ones
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border:     "none",
              fontSize:   20,
              color:      c.sub,
              cursor:     "pointer",
            }}
          >×</button>
        </div>

        {/* Existing subjects — toggle visibility */}
        <p style={{
          margin:        "0 0 8px",
          fontSize:      11,
          fontWeight:    700,
          color:         c.muted,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>
          Existing Subjects
        </p>

        <div style={{
          display:       "flex",
          flexDirection: "column",
          gap:           6,
          marginBottom:  20,
        }}>
          {hardcoded.map(sub => {
            const isHidden = hiddenCodes.includes(sub.code);
            return (
              <div key={sub.code} style={{
                display:        "flex",
                justifyContent: "space-between",
                alignItems:     "center",
                padding:        "9px 12px",
                borderRadius:   8,
                background:     isHidden
                  ? `${c.bad}08`
                  : c.hover,
                border:         `1px solid ${isHidden
                  ? `${c.bad}30`
                  : c.border}`,
                opacity:        isHidden ? 0.6 : 1,
                transition:     "all 0.15s",
              }}>
                <div>
                  <p style={{
                    margin:          0,
                    fontSize:        13,
                    color:           c.text,
                    textDecoration:  isHidden ? "line-through" : "none",
                  }}>
                    {sub.name}
                  </p>
                  <p style={{
                    margin:   0,
                    fontSize: 10,
                    color:    c.muted,
                  }}>
                     {sub.credits} cr · {sub.type}
                  </p>
                </div>
                <button
                 onClick={async () => {
                try {
                await toggleHiddenSubject(selSem, sub.code, !isHidden);
                } catch {
      // error handled in context
    }
  }}
  style={{
                    ...btn(isHidden ? "success" : "danger"),
                    fontSize: 11,
                    padding:  "4px 10px",
                  }}
                >
                  {isHidden ? "Restore" : "Hide"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Custom subjects */}
        {custom.length > 0 && (
          <>
            <p style={{
              margin:        "0 0 8px",
              fontSize:      11,
              fontWeight:    700,
              color:         c.muted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              Added Subjects
            </p>
            <div style={{
              display:       "flex",
              flexDirection: "column",
              gap:           6,
              marginBottom:  20,
            }}>
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
                    <p style={{
                      margin:   0,
                      fontSize: 13,
                      color:    c.text,
                    }}>
                      {sub.name}
                    </p>
                  </div>
                  <button
                    onClick={() => removeCustomSubject(selSem, sub.code)}
                    style={{
                      ...btn("danger"),
                      fontSize: 11,
                      padding:  "4px 10px",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add new subject form */}
        <p style={{
          margin:        "0 0 10px",
          fontSize:      11,
          fontWeight:    700,
          color:         c.muted,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>
          Add New Subject
        </p>

        <div style={{
          display:       "flex",
          flexDirection: "column",
          gap:           10,
        }}>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setErr(""); }}
            placeholder="Subject name e.g. Cloud Computing"
            style={{ ...inp(), width: "100%", boxSizing: "border-box" }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="number"
              value={credits}
              onChange={e => { setCredits(e.target.value); setErr(""); }}
              placeholder="Credits (1–10)"
              min="1"
              max="10"
              style={{ ...inp(), flex: 1 }}
            />
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ ...inp(), flex: 1 }}
            >
              <option value="theory">Theory</option>
              <option value="lab">Lab / Practical</option>
            </select>
          </div>

          {err && (
            <p style={{
              margin:     0,
              fontSize:   12,
              color:      c.bad,
              fontWeight: 500,
            }}>
              ⚠ {err}
            </p>
          )}

          <button
            onClick={handleAdd}
            disabled={loading}
            style={{
              ...btn("primary"),
              width:   "100%",
              padding: "10px",
              opacity: loading ? 0.7 : 1,
              cursor:  loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Adding..." : "+ Add Subject"}
          </button>
        </div>

        {/* Warning */}
        <div style={{
  marginTop:    16,
  padding:      "8px 12px",
 background: dark
  ? "rgba(148,163,184,0.08)"
  : "rgba(217,119,6,0.06)",
border: `1px solid ${dark
  ? "rgba(148,163,184,0.2)"
  : "rgba(217,119,6,0.15)"}`,
borderRadius: 8,
fontSize:     11,
color: dark ? "#94a3b8" : "#92400e",
  lineHeight:   1.6,
}}>
  ⚠ Hiding a subject removes it from SGPA calculation.
          Restoring it will include it again from the next save.
          Custom subjects persist across sessions.
        </div>
      </div>
    </div>
  );
}