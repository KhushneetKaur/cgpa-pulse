import Leaderboard from "../models/Leaderboard.js";
import User        from "../models/User.js";

// ── Get leaderboard entries ───────────────────────────────────────────────────
// branch = "ALL" returns global, otherwise filters by branch
export async function getLeaderboard(branch = "ALL", limit = 50) {
  const filter = branch === "ALL" ? {} : { branch };
  
  // 1. Fetch directly from Leaderboard collection first
  let entries = await Leaderboard.find(filter)
    .sort({ cgpa: -1, updatedAt: 1 })
    .limit(limit)
    .lean();

  // 2. Fallback: If Leaderboard collection is empty, aggregate opted-in users directly
  if (!entries || entries.length === 0) {
    const userMatch = { 
      lbOptIn: true, 
      isActive: true,
      ...(branch !== "ALL" && { branch }) 
    };

    entries = await User.aggregate([
      { $match: userMatch },
      {
        $lookup: {
          from: "leaderboards",
          localField: "_id",
          foreignField: "userId",
          as: "lbData"
        }
      },
      { $unwind: "$lbData" },
      {
        $project: {
          _id: "$lbData._id",
          userId: "$_id",
          username: 1,
          branch: 1,
          cgpa: "$lbData.cgpa",
          semCount: "$lbData.semCount",
          updatedAt: "$lbData.updatedAt"
        }
      },
      { $sort: { cgpa: -1, updatedAt: 1 } },
      { $limit: limit }
    ]);
  }

  return entries;
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