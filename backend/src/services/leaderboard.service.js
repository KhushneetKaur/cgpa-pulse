import Leaderboard from "../models/Leaderboard.js";
import ApiError from "../utils/ApiError.js";

// ── Get leaderboard ───────────────────────────────────────────────────────────
// branch = "ALL" returns across all branches
// branch = "CSE" returns only CSE etc.

export async function getLeaderboard(branch = "ALL", limit = 50) {
  const filter = branch === "ALL" ? {} : { branch };

  // Secondary tie-breaker on updatedAt ensures stable, deterministic ranking
  const entries = await Leaderboard.find(filter)
    .sort({ cgpa: -1, updatedAt: 1 })
    .limit(Math.min(limit, 100))
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

  // Lookup strictly by userId so branch switches update the row rather than duplicating it
  const entry = await Leaderboard.findOneAndUpdate(
    { userId },
    {
      $set: {
        username,
        branch,
        cgpa,
        semCount,
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return entry;
}

// ── Remove a leaderboard entry ────────────────────────────────────────────────
// Called when user opts out

export async function removeLeaderboardEntry(userId) {
  // Querying by userId guarantees complete removal across branch switches
  const result = await Leaderboard.findOneAndDelete({ userId });

  return { removed: !!result };
}

// ── Get user's own rank ───────────────────────────────────────────────────────

export async function getUserRank(userId, branch = "ALL") {
  const entry = await Leaderboard.findOne({ userId }).lean();
  if (!entry) return null;

  // Handle global vs branch-specific rank queries accurately
  const filter = {
    cgpa: { $gt: entry.cgpa },
  };

  if (branch !== "ALL") {
    filter.branch = branch;
  }

  const rank = await Leaderboard.countDocuments(filter);

  return {
    rank: rank + 1, // 1-indexed
    cgpa: entry.cgpa,
    username: entry.username,
    branch: entry.branch,
  };
}

// ── Get branch statistics — used by admin dashboard ──────────────────────────

export async function getBranchStats() {
  const stats = await Leaderboard.aggregate([
    {
      $group: {
        _id: "$branch",
        avgCGPA: { $avg: "$cgpa" },
        maxCGPA: { $max: "$cgpa" },
        minCGPA: { $min: "$cgpa" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        avgCGPA: { $round: ["$avgCGPA", 2] },
        maxCGPA: 1,
        minCGPA: 1,
        count: 1,
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
        _id: null,
        totalStudents: { $sum: 1 },
        avgCGPA: { $avg: "$cgpa" },
        maxCGPA: { $max: "$cgpa" },
      },
    },
    {
      $project: {
        _id: 0,
        totalStudents: 1,
        avgCGPA: { $round: ["$avgCGPA", 2] },
        maxCGPA: 1,
      },
    },
  ]);

  return result || { totalStudents: 0, avgCGPA: 0, maxCGPA: 0 };
}