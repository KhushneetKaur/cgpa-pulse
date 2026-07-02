// All localStorage read/write operations in one place.
// Nothing here imports React — pure JS utility functions only.

const SESSION_KEY = "mrsptu_session3";
const USERS_KEY   = "mrsptu_users3";
const DATA_PREFIX = "mrsptu3_";
const LB_KEY      = "mrsptu_leaderboard";
const THEME_KEY   = "mrsptu_theme";

// ─── Theme ────────────────────────────────────────────────────────────────────

export function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark";
  } catch {
    return false;
  }
}

export function saveTheme(isDark) {
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getSession() {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ─── User data ────────────────────────────────────────────────────────────────
// Stores everything for a user: semester history, backlogs,
// elective name overrides, leaderboard opt-in, chosen branch

export function loadUserData(username) {
  try {
    const raw = localStorage.getItem(DATA_PREFIX + username);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      hist:          parsed.hist          || {},
      backlogs:      parsed.backlogs      || {},
      electiveNames: parsed.electiveNames || {},
      lbOptIn:       parsed.lbOptIn       || false,
      branch:        parsed.branch        || null,
    };
  } catch {
    return null;
  }
}

export function persistUserData(username, data) {
  // data = { hist, backlogs, electiveNames, lbOptIn, branch }
  try {
    localStorage.setItem(DATA_PREFIX + username, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save user data:", e);
  }
}

// ─── Login / Signup ───────────────────────────────────────────────────────────
// Returns { success, user, error }

export function attemptLogin(username, password) {
  if (!username.trim() || !password.trim()) {
    return { success: false, error: "Please fill in all fields." };
  }

  const users = getUsers();

  if (!users[username]) {
    return { success: false, error: "Invalid username or password." };
  }

  if (users[username].pwd !== password) {
    return { success: false, error: "Invalid username or password." };
  }

  const user = { username };
  saveSession(user);
  return { success: true, user };
}

export function attemptSignup(username, password) {
  if (!username.trim() || !password.trim()) {
    return { success: false, error: "Please fill in all fields." };
  }

  if (username.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }

  if (password.length < 4) {
    return { success: false, error: "Password must be at least 4 characters." };
  }

  const users = getUsers();

  if (users[username]) {
    return { success: false, error: "Username already taken. Try another." };
  }

  users[username] = { pwd: password };
  saveUsers(users);

  const user = { username };
  saveSession(user);
  return { success: true, user };
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function updateLeaderboard(username, branchKey, cgpa, optedIn) {
  if (!optedIn || !cgpa) return;

  try {
    const lb = loadLeaderboard();
    const idx = lb.findIndex(
      e => e.username === username && e.branch === branchKey
    );

    const entry = {
      username,
      branch: branchKey,
      cgpa,
      updatedAt: new Date().toLocaleDateString("en-IN"),
    };

    if (idx >= 0) {
      lb[idx] = entry;
    } else {
      lb.push(entry);
    }

    // Sort by CGPA descending, keep top 50
    lb.sort((a, b) => parseFloat(b.cgpa) - parseFloat(a.cgpa));
    const trimmed = lb.slice(0, 50);

    localStorage.setItem(LB_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch (e) {
    console.error("Failed to update leaderboard:", e);
    return loadLeaderboard();
  }
}

export function removeFromLeaderboard(username, branchKey) {
  try {
    const lb = loadLeaderboard();
    const filtered = lb.filter(
      e => !(e.username === username && e.branch === branchKey)
    );
    localStorage.setItem(LB_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return loadLeaderboard();
  }
}