import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("dark");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggleDark = useCallback(() => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem("dark", String(next));
      // Sync CSS vars immediately — before React re-renders
      const root = document.documentElement;
      if (next) {
        root.style.setProperty("--c-bg",     "#080c18");
        root.style.setProperty("--c-card",   "#0f1424");
        root.style.setProperty("--c-border", "#1e2540");
        root.style.setProperty("--c-text",   "#eceef8");
        root.style.setProperty("--c-sub",    "#9ba3c8");
        root.style.setProperty("--c-muted",  "#6b7299");
        root.style.setProperty("--c-accent", "#7c83f5");
        root.style.setProperty("--c-ok",     "#2dd4aa");
        root.style.setProperty("--c-bad",    "#e05c5c");
        root.style.setProperty("--c-hover",  "#131828");
      } else {
        root.style.setProperty("--c-bg",     "#f4f3ff");
        root.style.setProperty("--c-card",   "#ffffff");
        root.style.setProperty("--c-border", "#e4e2f0");
        root.style.setProperty("--c-text",   "#1e1b4b");
        root.style.setProperty("--c-sub",    "#4a4575");
        root.style.setProperty("--c-muted",  "#7b6fa0");
        root.style.setProperty("--c-accent", "#6d28d9");
        root.style.setProperty("--c-ok",     "#059669");
        root.style.setProperty("--c-bad",    "#dc2626");
        root.style.setProperty("--c-hover",  "#ede9fe");
      }
      root.classList.toggle("dark", next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (localStorage.getItem("dark") === null) setDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Color tokens live HERE — not in AppDataContext ──────────────
  const c = useMemo(() => dark ? {
    bg:          "#080c18",
    card:        "#0f1424",
    cardAlt:     "#151a2e",
    border:      "#1e2540",
    borderHover: "#3d4470",
    text:        "#eceef8",
    sub:         "#9ba3c8",
    muted:       "#6b7299",
    maroon:      "#6d6af0",
    gold:        "#7c83f5",
    accent:      "#7c83f5",
    accentAlt:   "#34d399",
    accentLt:    "#12163a",
    accentTxt:   "#a5aeff",
    ok:          "#2dd4aa",
    warn:        "#94a3b8",
    bad:         "#e05c5c",
    purple:      "#c084fc",
    hover:       "#131828",
    inBg:        "#0a0e1c",
    inBdr:       "#252a45",
    goldBg:      "#12100a",
  } : {
    bg:          "#f4f3ff",
    card:        "#ffffff",
    cardAlt:     "#f9f8ff",
    border:      "#e4e2f0",
    borderHover: "#a78bfa",
    text:        "#1e1b4b",
    sub:         "#4a4575",
    muted:       "#7b6fa0",
    maroon:      "#8B1A1A",
    gold:        "#c9a227",
    accent:      "#6d28d9",
    accentAlt:   "#059669",
    accentLt:    "#ede9fe",
    accentTxt:   "#6d28d9",
    ok:          "#059669",
    warn:        "#d97706",
    bad:         "#dc2626",
    purple:      "#7c3aed",
    hover:       "#ede9fe",
    inBg:        "#faf9ff",
    inBdr:       "#d4d0e8",
    goldBg:      "#fefce8",
  }, [dark]);

  const scoreClr = useCallback((score) => {
    const n = parseFloat(score);
    if (isNaN(n)) return c.muted;
    if (n >= 9)   return c.ok;
    if (n >= 7)   return c.accent;
    if (n >= 5)   return c.warn;
    return c.bad;
  }, [c]);

  const cardSty = useCallback((extra = {}) => ({
    background:   c.card,
    border:       `1px solid ${c.border}`,
    borderRadius: 16,
    padding:      "20px 22px",
    boxShadow:    dark
      ? "0 4px 24px rgba(0,0,0,0.4)"
      : "0 2px 16px rgba(109,40,217,0.06)",
    ...extra,
  }), [c, dark]);

  const inp = useCallback((extra = {}) => ({
    fontSize:     15,
    padding:      "10px 13px",
    border:       `1px solid ${c.inBdr}`,
    borderRadius: 10,
    background:   c.inBg,
    color:        c.text,
    outline:      "none",
    width:        "100%",
    boxSizing:    "border-box",
    fontFamily:   "inherit",
    transition:   "border-color 0.15s, box-shadow 0.15s",
    ...extra,
  }), [c]);

  const btn = useCallback((type = "ghost", extra = {}) => {
    const styles = {
      primary: {
        background: c.accent, color: "#fff", border: "none", fontWeight: 600,
        boxShadow: dark
          ? "0 4px 14px rgba(129,140,248,0.3)"
          : "0 4px 14px rgba(109,40,217,0.25)",
      },
      ghost:   { background: "transparent", color: c.sub, border: `1px solid ${c.border}`, fontWeight: 400 },
      soft:    { background: c.accentLt, color: c.accentTxt, border: `1px solid ${dark ? c.border : "#c4b5fd"}`, fontWeight: 500 },
      danger:  {
        background: dark ? "rgba(248,113,113,0.15)" : "rgba(220,38,38,0.08)",
        color: c.bad,
        border: `1px solid ${dark ? "rgba(248,113,113,0.3)" : "rgba(220,38,38,0.2)"}`,
        fontWeight: 500,
      },
      success: {
        background: dark ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.08)",
        color: c.ok,
        border: `1px solid ${dark ? "rgba(52,211,153,0.3)" : "rgba(5,150,105,0.2)"}`,
        fontWeight: 500,
      },
    };
    return {
      fontSize: 14, padding: "8px 16px", borderRadius: 10,
      cursor: "pointer", outline: "none", fontFamily: "inherit",
      lineHeight: 1.4, transition: "all 0.15s ease",
      display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
      ...(styles[type] || styles.ghost), ...extra,
    };
  }, [c, dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark, c, scoreClr, cardSty, inp, btn }}>
      {children}
    </ThemeContext.Provider>
  );
}