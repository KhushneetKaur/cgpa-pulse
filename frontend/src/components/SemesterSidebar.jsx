import { memo, useMemo, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme } from "../context/ThemeContext";

const TIPS = [
  "Consistency beats cramming — save each sem as you go 📅",
  "A 9+ SGPA requires scoring A in most subjects 🎯",
  "Labs are easier to ace — don't ignore the 60 internal marks ⚗️",
  "One backlog can drag your CGPA for years — clear it fast ⚡",
  "Target CGPA after Sem 6 becomes very hard to recover 📉",
  "Internal marks are your safety net — take them seriously 🛡️",
  "SGPA above 8.5 qualifies for most campus placements 🏢",
  "Each credit you miss in SGPA costs you in the final CGPA 🧮",
];

// Static legend content 
const LEGEND = (
  <>
    ⚡ Save a known SGPA directly
    <br />
    ⚠ Subjects marked as backlog
  </>
);

// ── Tip card  ──────────────────────────────────────────
const TipCard = memo(function TipCard() {
  const { c, dark } = useTheme();

  const tip = useMemo(
    () => TIPS[Math.floor(Math.random() * TIPS.length)],
    [] 
  );

  return (
    <div style={{
      marginTop:    10,
      padding:      "10px 12px",
      borderRadius: 10,
      background:   dark ? "rgba(124,131,245,0.07)" : "rgba(109,40,217,0.05)",
      border:       `1px solid ${dark ? "rgba(124,131,245,0.15)" : "rgba(109,40,217,0.1)"}`,
    }}>
      <p style={{ margin: "0 0 5px", fontSize: 9, fontWeight: 700, color: c.accent, textTransform: "uppercase", letterSpacing: 1 }}>
        💡 Study Tip
      </p>
      <p style={{ margin: 0, fontSize: 11, color: c.sub, lineHeight: 1.6 }}>
        {tip}
      </p>
    </div>
  );
});

// ── Semester row  ───────────────────────────────
const SemRow = memo(function SemRow({
  sem, saved, isQuick, isSelected,
  semBLCount, onSelect, onQuick,
}) {
  const { c, scoreClr } = useTheme();

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button
        onClick={onSelect}
        style={{
          flex:           1,
          textAlign:      "left",
          padding:        "9px 10px",
          borderRadius:   8,
          cursor:         "pointer",
          border:         isSelected ? `2px solid ${c.maroon}` : `1px solid ${c.border}`,
          background:     isSelected ? `${c.maroon}18` : c.card,
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          transition:     "border-color 0.15s, background 0.15s",
        }}
      >
        <span style={{ fontSize: 13, color: isSelected ? c.maroon : c.text, fontWeight: isSelected ? 600 : 400, display: "flex", alignItems: "center", gap: 5 }}>
          Sem {sem}
          {semBLCount > 0 && (
            <span style={{ fontSize: 9, color: c.bad, fontWeight: 700, background: `${c.bad}18`, borderRadius: 4, padding: "1px 4px" }}>
              ⚠{semBLCount}
            </span>
          )}
        </span>

        {saved && (
          <span style={{ fontSize: 11, color: scoreClr(saved), fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
            {saved}
            {isQuick && <span style={{ fontSize: 9, color: c.muted }}>⚡</span>}
          </span>
        )}
      </button>

      <button
        onClick={onQuick}
        title={`Quick SGPA entry for Semester ${sem}`}
        style={{
          padding:      "6px 8px",
          borderRadius: 8,
          border:       `1px solid ${c.border}`,
          background:   "transparent",
          color:        c.muted,
          fontSize:     13,
          cursor:       "pointer",
          flexShrink:   0,
          transition:   "color 0.15s, border-color 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = c.gold; e.currentTarget.style.borderColor = c.gold; }}
        onMouseLeave={e => { e.currentTarget.style.color = c.muted; e.currentTarget.style.borderColor = c.border; }}
      >
        ⚡
      </button>
    </div>
  );
});

// ── Main sidebar ──────────────────────────────────────────────────────────────
export default function SemesterSidebar() {
  const {
    semKeys, selSem, selectSem,
    bHist, bBacklogs, openQuick,
  } = useAppData();

  const { c, dark } = useTheme();

  // Stable handlers 
  const handleSelect = useCallback((sem) => selectSem(sem), [selectSem]);
  const handleQuick  = useCallback((sem) => openQuick(sem),  [openQuick]);

  return (
    <div style={{
      background:    c.card,
      border:        `1px solid ${c.border}`,
      borderRadius:  16,
      padding:       "16px 12px",
      boxShadow:     dark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 16px rgba(109,40,217,0.06)",
      display:       "flex",
      flexDirection: "column",
    }}>
      <p style={{ fontSize: 11, color: c.sub, margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Semester
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {semKeys.map(s => (
          <SemRow
            key={s}
            sem={s}
            saved={bHist[s]?.sgpa}
            isQuick={bHist[s]?.mode === "quick"}
            isSelected={selSem === s}
            semBLCount={(bBacklogs[s] || []).length}
            onSelect={() => handleSelect(s)}
            onQuick={() => handleQuick(s)}
          />
        ))}
      </div>

      <div style={{ marginTop: 12, padding: "8px 10px", background: c.hover, borderRadius: 8, border: `1px solid ${c.border}` }}>
        <p style={{ margin: 0, fontSize: 10, color: dark ? "rgba(255,255,255,0.5)" : "#4a4570", lineHeight: 1.6 }}>
          {LEGEND}
        </p>
      </div>

      <TipCard />
    </div>
  );
}