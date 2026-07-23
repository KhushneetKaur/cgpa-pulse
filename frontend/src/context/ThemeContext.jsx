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