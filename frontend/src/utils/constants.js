// Shared constants used across multiple pages.
// Centralised here so they're easy to update in one place.

// ── Percentage reference table (Target & Grade Table pages) ──────────────────
export const CGPA_PERCENTAGE_REFS = [
  { cgpa: 4.0,  pct: "40.0" },
  { cgpa: 4.5,  pct: "45.0" },
  { cgpa: 5.0,  pct: "50.0" },
  { cgpa: 5.5,  pct: "55.0" },
  { cgpa: 6.0,  pct: "60.0" },
  { cgpa: 6.5,  pct: "65.0" },
  { cgpa: 7.0,  pct: "70.0" },
  { cgpa: 7.5,  pct: "75.0" },
  { cgpa: 8.0,  pct: "80.0" },
  { cgpa: 8.5,  pct: "85.0" },
  { cgpa: 9.0,  pct: "90.0" },
  { cgpa: 9.5,  pct: "95.0" },
  { cgpa: 10.0, pct: "100.0" },
];

// ── Performance label map (History & Summary pages) ───────────────────────────
export const PERF_MAP = {
  10: "Outstanding",
  9:  "Excellent",
  8:  "Very Good",
  7:  "Good",
  6:  "Average",
  5:  "Pass",
  4:  "Marginal Pass",
  0:  "Fail — reappear required",
};

// ── Performance label + color key (used in HistoryPage, SummaryCards) ─────────
export function getPerformanceLabel(cgpa) {
  const n = parseFloat(cgpa);
  if (isNaN(n)) return null;
  if (n >= 9)  return { label: "🏆 Outstanding",       colorKey: "ok"     };
  if (n >= 8)  return { label: "⭐ Excellent",          colorKey: "ok"     };
  if (n >= 7)  return { label: "👍 Very Good",          colorKey: "accent" };
  if (n >= 6)  return { label: "✅ Good",               colorKey: "accent" };
  if (n >= 5)  return { label: "📘 Average",            colorKey: "warn"   };
  return             { label: " Needs Improvement",  colorKey: "bad"    };
}

// ── Tab definitions (NavBar + App routing) ────────────────────────────────────
export const TABS = [
  { key: "calculator",  label: "Calculator",  icon: "📝" },
  { key: "history",     label: "History",     icon: "📋" },
  { key: "target",      label: "Target",      icon: "🎯" },
  { key: "predictor",   label: "Predictor",   icon: "🔮" },
  { key: "backlogs",    label: "Backlogs",    icon: "⚠"  },
  { key: "leaderboard", label: "Leaderboard", icon: "🏆" },
  { key: "grade table", label: "Grade Table", icon: "📊" },
];