import mongoose from "mongoose";
import Leaderboard from "../models/Leaderboard.js";

// ── Get leaderboard entries ───────────────────────────────────────────────────
export async function getLeaderboard(branch = "ALL", faculty = null, limit = 0) {
  const filter = {};

  if (branch && branch.toUpperCase() !== "ALL") {
    filter.branch = branch;
  }

  if (faculty && faculty.toUpperCase() !== "ALL") {
    filter.faculty = faculty;
  }

  let query = Leaderboard.find(filter).sort({ cgpa: -1, updatedAt: 1 });

  const parsedLimit = Number(limit);
  if (!isNaN(parsedLimit) && parsedLimit > 0) {
    query = query.limit(parsedLimit);
  }

  return await query.lean();
}

// ── Upsert leaderboard entry ──────────────────────────────────────────────────
export async function upsertLeaderboardEntry({ userId, username, branch, faculty, cgpa, semCount }) {
  if (cgpa == null || isNaN(cgpa) || cgpa < 0 || cgpa > 10 || !semCount || semCount < 1) {
    return null;
  }

  // Ensure userId is a valid Mongoose ObjectId
  const objectUserId = new mongoose.Types.ObjectId(userId);

  return await Leaderboard.findOneAndUpdate(
    { userId: objectUserId },
    {
      $set: {
        username: username || "Student",
        branch: branch || "OTHER",
        faculty: faculty || null,
        cgpa: Number(cgpa.toFixed(2)),
        semCount: Number(semCount),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

// ── Remove leaderboard entry ──────────────────────────────────────────────────
export async function removeLeaderboardEntry(userId) {
  const objectUserId = new mongoose.Types.ObjectId(userId);
  const result = await Leaderboard.findOneAndDelete({ userId: objectUserId });
  return { removed: !!result };
}