// Lightweight client-side browser storage helpers for UI preferences.
// All user state, authentication, and academic records are managed via API/MongoDB.

const THEME_KEY = "mrsptu_theme";

// ─── Theme Utilities ─────────────────────────────────────────────────────────

/**
 * Reads saved theme preference from local storage.
 * @returns {boolean} True if dark mode is explicitly enabled.
 */
export function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark";
  } catch {
    return false;
  }
}

/**
 * Persists theme preference.
 * @param {boolean} isDark 
 */
export function saveTheme(isDark) {
  try {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  } catch (err) {
    console.error("Failed to persist theme preference:", err);
  }
}

// ─── Storage Reset Utility ───────────────────────────────────────────────────

/**
 * Clears legacy local storage items created during pre-OAuth development.
 */
export function purgeLegacyStorage() {
  try {
    const legacyKeys = [
      "mrsptu_session3",
      "mrsptu_users3",
      "mrsptu_leaderboard",
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
    
    // Purge legacy data prefix items
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("mrsptu3_")) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.error("Failed to purge legacy storage:", err);
  }
}