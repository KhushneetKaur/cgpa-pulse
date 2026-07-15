import { useAppData } from "../context/AppDataContext";

export default function MobileSemesterPills() {
  const {
    semKeys, selSem, selectSem,
    bHist, bBacklogs,
    openQuick,
    c, dark, scoreClr,
  } = useAppData();

  return (
    <div style={{
      marginBottom: 12,
    }}>
      {/* Semester pills */}
      <div style={{
        display:        "flex",
        gap:            8,
        overflowX:      "auto",
        paddingBottom:  6,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        {semKeys.map(s => {
          const saved      = bHist[s]?.sgpa;
          const isSelected = selSem === s;
          const blCount    = (bBacklogs[s] || []).length;

          return (
            <button
              key={s}
              onClick={() => selectSem(s)}
              style={{
                flexShrink:   0,
                padding:      "7px 14px",
                borderRadius: 99,
                border:       isSelected
                  ? `2px solid ${c.accent}`
                  : `1px solid ${c.border}`,
                background:   isSelected
                  ? `${c.accent}18`
                  : c.card,
                cursor:       "pointer",
                fontFamily:   "inherit",
                display:      "flex",
                alignItems:   "center",
                gap:          6,
                transition:   "all 0.15s",
              }}
            >
              <span style={{
                fontSize:   13,
                fontWeight: isSelected ? 700 : 400,
                color:      isSelected ? c.accent : c.text,
                whiteSpace: "nowrap",
              }}>
                Sem {s}
              </span>

              {saved && (
                <span style={{
                  fontSize:   11,
                  fontWeight: 700,
                  color:      scoreClr(saved),
                }}>
                  {saved}
                </span>
              )}

              {blCount > 0 && (
                <span style={{
                  fontSize:     9,
                  color:        c.bad,
                  fontWeight:   700,
                  background:   `${c.bad}18`,
                  borderRadius: 4,
                  padding:      "1px 4px",
                }}>
                  ⚠{blCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick SGPA row */}
      <div style={{
        display:    "flex",
        gap:        6,
        marginTop:  6,
        flexWrap:   "wrap",
      }}>
        {selSem && (
          <button
            onClick={() => openQuick(selSem)}
            style={{
              fontSize:     11,
              padding:      "5px 10px",
              borderRadius: 8,
              border:       `1px solid ${c.border}`,
              background:   "transparent",
              color:        c.sub,
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            ⚡ Quick SGPA
          </button>
        )}
        <span style={{
          fontSize:   10,
          color:      c.muted,
          alignSelf:  "center",
          lineHeight: 1.5,
        }}>
          ⚠ = backlog · ⚡ = save SGPA directly
        </span>
      </div>
    </div>
  );
}