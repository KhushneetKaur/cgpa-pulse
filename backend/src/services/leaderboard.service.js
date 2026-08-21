import Leaderboard from "../models/Leaderboard.js";
import User        from "../models/User.js";

// ── Get leaderboard entries ───────────────────────────────────────────────────
// Uses cached Leaderboard entry if populated; falls back to dynamic SemesterData aggregation.
export async function getLeaderboard(branch = "ALL", limit = 50) {
  const parsedLimit = parseInt(limit, 10) || 50;

  const matchStage = {
    lbOptIn: true,
    isActive: true,
  };

  if (branch && branch !== "ALL") {
    matchStage.branch = branch;
  }

  const entries = await User.aggregate([
    { $match: matchStage },

    // 1. Join cached Leaderboard document
    {
      $lookup: {
        from: "leaderboards",
        localField: "_id",
        foreignField: "userId",
        as: "lbData"
      }
    },
    { $unwind: { path: "$lbData", preserveNullAndEmptyArrays: true } },

    // 2. Join SemesterData documents
    {
      $lookup: {
        from: "semesterdatas",
        localField: "_id",
        foreignField: "userId",
        as: "semData"
      }
    },

    // 3. Filter valid semester records (where sgpa > 0)
    {
      $addFields: {
        validSems: {
          $filter: {
            input: "$semData",
            as: "sem",
            cond: {
              $and: [
                { $ne: ["$$sem.sgpa", null] },
                { $gt: ["$$sem.sgpa", 0] }
              ]
            }
          }
        }
      }
    },

    // 4. Calculate weighted sum, total credits, AND find the latest semester edit date
    {
      $addFields: {
        calcSemCount: { $size: "$validSems" },
        calcTotalCredits: {
          $sum: {
            $map: {
              input: "$validSems",
              as: "s",
              in: { $cond: [{ $gt: ["$$s.credits", 0] }, "$$s.credits", 1] }
            }
          }
        },
        calcWeightedSum: {
          $reduce: {
            input: "$validSems",
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                {
                  $multiply: [
                    "$$this.sgpa",
                    { $cond: [{ $gt: ["$$this.credits", 0] }, "$$this.credits", 1] }
                  ]
                }
              ]
            }
          }
        },
        // Get the most recent update timestamp among semester records
        latestSemUpdatedAt: { $max: "$validSems.updatedAt" }
      }
    },

    // 5. Compute fallback dynamic CGPA
    {
      $addFields: {
        dynamicCgpa: {
          $cond: [
            { $gt: ["$calcTotalCredits", 0] },
            {
              $round: [
                { $divide: ["$calcWeightedSum", "$calcTotalCredits"] },
                2
              ]
            },
            0
          ]
        }
      }
    },

    // 6. Project result (Fixes stale date fallback issue)
    {
      $project: {
        _id: { $ifNull: ["$lbData._id", "$_id"] },
        userId: "$_id",
        username: 1,
        branch: 1,
        cgpa: {
          $cond: [
            { $gt: [{ $ifNull: ["$lbData.cgpa", 0] }, 0] },
            "$lbData.cgpa",
            "$dynamicCgpa"
          ]
        },
        semCount: {
          $cond: [
            { $gt: [{ $ifNull: ["$lbData.semCount", 0] }, 0] },
            "$lbData.semCount",
            "$calcSemCount"
          ]
        },
        // Prioritize Leaderboard updatedAt -> latest Semester update -> User model updatedAt
        updatedAt: {
          $ifNull: [
            "$lbData.updatedAt",
            { $ifNull: ["$latestSemUpdatedAt", "$updatedAt"] }
          ]
        }
      }
    },
    { $sort: { cgpa: -1, updatedAt: 1 } },
    { $limit: parsedLimit }
  ]);

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