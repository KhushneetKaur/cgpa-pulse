import Leaderboard from "../models/Leaderboard.js";

// ── Get leaderboard entries ───────────────────────────────────────────────────
// branch = "ALL" returns global, otherwise filters by branch
export async function getLeaderboard(branch = "ALL", limit = 50) {
  const filter = branch === "ALL" ? {} : { branch };
  return await Leaderboard.find(filter)
    .sort({ cgpa: -1, updatedAt: 1 }) 
    .limit(limit)
    .lean();
}

// ── Upsert a leaderboard entry ────────────────────────────────────────────────
export async function upsertLeaderboardEntry({ userId, username, branch, cgpa, semCount }) {
  if (cgpa == null || cgpa < 0 || cgpa > 10) return null;

  return await Leaderboard.findOneAndUpdate(
    { userId },
    { $set: { username, branch, cgpa, semCount } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

// ── Remove a leaderboard entry ────────────────────────────────────────────────
export async function removeLeaderboardEntry(userId) {
  const result = await Leaderboard.findOneAndDelete({ userId });
  return { removed: !!result };
}