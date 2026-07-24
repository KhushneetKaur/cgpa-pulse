import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }) {
  // Lazy state initializer — runs once on initial mount
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("dark");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggleDark = useCallback(() => {
  setDark((prev) => {
    const next = !prev;
    localStorage.setItem("dark", String(next));
    // Fire before React re-renders so CSS transitions start immediately
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    return next;
  });
  }, []);

   
useEffect(() => {
  const root = document.documentElement;

  if (dark) {
    root.style.setProperty("--bg",           "#080c18");
    root.style.setProperty("--card",         "#0f1424");
    root.style.setProperty("--border",       "#1e2540");
    root.style.setProperty("--text",         "#eceef8");
    root.style.setProperty("--sub",          "#8b90b8");
    root.style.setProperty("--muted",        "#4a5070");
    root.style.setProperty("--hover",        "#131828");
    root.style.setProperty("--accent",       "#7c83f5");
    root.style.setProperty("--ok",           "#2dd4aa");
    root.style.setProperty("--bad",          "#e05c5c");
  } else {
    root.style.setProperty("--bg",           "#f4f3ff");
    root.style.setProperty("--card",         "#ffffff");
    root.style.setProperty("--border",       "#e4e2f0");
    root.style.setProperty("--text",         "#1e1b4b");
    root.style.setProperty("--sub",          "#5b5687");
    root.style.setProperty("--muted",        "#a09bbf");
    root.style.setProperty("--hover",        "#ede9fe");
    root.style.setProperty("--accent",       "#6d28d9");
    root.style.setProperty("--ok",           "#059669");
    root.style.setProperty("--bad",          "#dc2626");
  }

  document.documentElement.classList.toggle("dark", dark);
}, [dark]);

  // Sync class on document root
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Listen for system preference changes when no explicit local storage setting exists
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (localStorage.getItem("dark") === null) {
        setDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const value = {
    dark,
    toggleDark,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}