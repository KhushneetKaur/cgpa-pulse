import Leaderboard from "../models/Leaderboard.js";
import ApiError    from "../utils/ApiError.js";

// ── Get leaderboard ───────────────────────────────────────────────────────────
// branch = "ALL" returns across all branches
// branch = "CSE" returns only CSE etc.

export async function getLeaderboard(branch = "ALL", limit = 50) {
  const filter = branch === "ALL" ? {} : { branch };

  const entries = await Leaderboard.find(filter)
    .sort({ cgpa: -1 })         // highest first
    .limit(Math.min(limit, 100))  // cap at 100
    .lean();

  return entries;
}

// ── Upsert a leaderboard entry ────────────────────────────────────────────────
// Called whenever a semester is saved and cgpa changes

export async function upsertLeaderboardEntry({
  userId,
  username,
  branch,
  cgpa,
  semCount,
}) {
  if (cgpa == null || cgpa < 0 || cgpa > 10) {
    throw ApiError.badRequest("Invalid CGPA value");
  }

  const entry = await Leaderboard.findOneAndUpdate(
    { userId, branch },
    {
      $set: {
        username,
        cgpa,
        semCount,
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  );

  return entry;
}

// ── Remove a leaderboard entry ────────────────────────────────────────────────
// Called when user opts out

export async function removeLeaderboardEntry(userId, branch) {
  const result = await Leaderboard.findOneAndDelete({ userId, branch });

  // Not throwing if not found — opt-out of non-existent entry is fine
  return { removed: !!result };
}

// ── Get user's own rank ───────────────────────────────────────────────────────

export async function getUserRank(userId, branch) {
  const entry = await Leaderboard.findOne({ userId, branch });
  if (!entry) return null;

  // Count how many entries have a higher CGPA
  const rank = await Leaderboard.countDocuments({
    branch,
    cgpa: { $gt: entry.cgpa },
  });

  return {
    rank:     rank + 1,   // 1-indexed
    cgpa:     entry.cgpa,
    username: entry.username,
    branch,
  };
}

// ── Get branch statistics — used by admin dashboard ──────────────────────────

export async function getBranchStats() {
  const stats = await Leaderboard.aggregate([
    {
      $group: {
        _id:     "$branch",
        avgCGPA: { $avg: "$cgpa" },
        maxCGPA: { $max: "$cgpa" },
        minCGPA: { $min: "$cgpa" },
        count:   { $sum: 1 },
      },
    },
    { $sort: { avgCGPA: -1 } },
  ]);

  return stats;
}

// ── Get overall platform statistics ──────────────────────────────────────────

export async function getOverallStats() {
  const [result] = await Leaderboard.aggregate([
    {
      $group: {
        _id:          null,
        totalStudents: { $sum: 1 },
        avgCGPA:      { $avg: "$cgpa" },
        maxCGPA:      { $max: "$cgpa" },
      },
    },
  ]);

  return result || { totalStudents: 0, avgCGPA: 0, maxCGPA: 0 };
}