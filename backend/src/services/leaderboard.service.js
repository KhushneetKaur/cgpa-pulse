import Leaderboard from "../models/Leaderboard.js";

// ── Get leaderboard entries ───────────────────────────────────────────────────
// branch: "ALL" = global, anything else = branch-filtered
// faculty: null = all faculties, "engineering"/"pharmacy" = filtered
export async function getLeaderboard(branch = "ALL", faculty = null, limit = 50) {
  const filter = {};
  if (branch !== "ALL") filter.branch  = branch;
  if (faculty)          filter.faculty = faculty;

  return await Leaderboard.find(filter)
    .sort({ cgpa: -1, updatedAt: 1 }) 
    .limit(limit)
    .lean();
}

// ── Upsert leaderboard entry ──────────────────────────────────────────────────
// Called automatically after every semester save — no opt-in gate
export async function upsertLeaderboardEntry({ userId, username, branch, faculty, cgpa, semCount }) {
  if (cgpa == null || cgpa < 0 || cgpa > 10) return null;

  return await Leaderboard.findOneAndUpdate(
    { userId },
    { $set: { username, branch, faculty: faculty || null, cgpa, semCount } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

// ── Remove leaderboard entry ──────────────────────────────────────────────────
// Only called when user deletes their account — no longer called on opt-out
export async function removeLeaderboardEntry(userId) {
  const result = await Leaderboard.findOneAndDelete({ userId });
  return { removed: !!result };
}