import { useEffect, useRef } from "react";
import { useAppData } from "../context/AppDataContext";

export default function MobileSemesterPills() {
  const {
    semKeys,
    selSem,
    selectSem,
    bHist,
    bBacklogs,
    openQuick,
    c,
    scoreClr,
  } = useAppData();

  // Reference container map for dynamic scrolling
  const pillRefs = useRef({});

  useEffect(() => {
    if (selSem && pillRefs.current[selSem]) {
      pillRefs.current[selSem].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selSem]);

  return (
    <div style={{ marginBottom: 12 }}>
      {/* ── Semester pills row ─────────────────────────────────── */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 6,
          WebkitOverflowScrolling: "touch", // Smooth iOS scrolling
        }}
      >
        {semKeys.map((s) => {
          const saved = bHist[s]?.sgpa;
          const isSelected = selSem === s;
          const blCount = (bBacklogs[s] || []).length;

          return (
            <button
              key={s}
              ref={(el) => {
                if (el) pillRefs.current[s] = el;
                else delete pillRefs.current[s];
              }}
              onClick={() => selectSem(s)}
              style={{
                flexShrink: 0,
                padding: "7px 14px",
                borderRadius: 99,
                border: isSelected
                  ? `2px solid ${c.accent}`
                  : `1px solid ${c.border}`,
                background: isSelected ? `${c.accent}18` : c.card,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? c.accent : c.text,
                  whiteSpace: "nowrap",
                }}
              >
                Sem {s}
              </span>

              {saved && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: scoreClr(saved),
                  }}
                >
                  {saved}
                </span>
              )}

              {blCount > 0 && (
                <span
                  style={{
                    fontSize: 9,
                    color: c.bad,
                    fontWeight: 700,
                    background: `${c.bad}18`,
                    borderRadius: 4,
                    padding: "1px 4px",
                  }}
                >
                  ⚠{blCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Sub-actions footer ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 6,
          alignItems: "center",
          flexWrap: "nowrap",
        }}
      >
        {selSem && (
          <button
            onClick={() => openQuick(selSem)}
            style={{
              fontSize: 11,
              padding: "5px 10px",
              borderRadius: 8,
              border: `1px solid ${c.border}`,
              background: "transparent",
              color: c.sub,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            ⚡ Quick SGPA
          </button>
        )}
        <span
          style={{
            fontSize: 10,
            color: c.muted,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          ⚠ = backlog · ⚡ = click to save SGPA directly
        </span>
      </div>
    </div>
  );
}