import { useAppData } from "../context/AppDataContext";
import { TABS } from "../utils/constants";

export default function BottomTabBar() {
  const { tab, setTab, totalBacklogs, screen, branch, c, dark } = useAppData();

  if (screen !== "app" || !branch) return null;

  return (
    <nav className="bottom-tab-bar" style={{
      position:        "fixed",
      bottom:          0,
      left:            0,
      right:           0,
      zIndex:          150,
      display:         "flex",
      alignItems:      "stretch",
      background:      dark
        ? "rgba(8,12,24,0.97)"
        : "rgba(255,255,255,0.97)",
      backdropFilter:  "blur(20px)",
      borderTop:       `1px solid ${dark
        ? "rgba(129,140,248,0.15)"
        : "rgba(109,40,217,0.1)"}`,
      paddingBottom:   "env(safe-area-inset-bottom)",
    }}>
      {TABS.map(t => {
        const isActive  = tab === t.key;
        const showBadge = t.key === "backlogs" && totalBacklogs > 0;

        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex:           1,
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              gap:            2,
              padding:        "8px 0 6px",
              border:         "none",
              background:     "transparent",
              cursor:         "pointer",
              fontFamily:     "inherit",
              position:       "relative",
              transition:     "all 0.15s",
              borderTop:      isActive
                ? `2px solid ${c.accent}`
                : "2px solid transparent",
            }}
          >
            {/* Icon */}
            <span style={{
              fontSize:   isActive ? 20 : 18,
              lineHeight: 1,
              filter:     isActive ? "none" : "grayscale(0.3)",
              transition: "all 0.15s",
            }}>
              {t.icon}
            </span>

            {/* Label */}
            <span style={{
              fontSize:   9,
              fontWeight: isActive ? 700 : 400,
              color:      isActive ? c.accent : c.muted,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              transition: "all 0.15s",
            }}>
              {t.label}
            </span>

            {/* Backlog badge */}
            {showBadge && (
              <span style={{
                position:     "absolute",
                top:          4,
                right:        "calc(50% - 14px)",
                background:   c.bad,
                color:        "#fff",
                fontSize:     8,
                fontWeight:   700,
                borderRadius: 99,
                padding:      "1px 4px",
                lineHeight:   1.5,
                minWidth:     14,
                textAlign:    "center",
              }}>
                {totalBacklogs}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}