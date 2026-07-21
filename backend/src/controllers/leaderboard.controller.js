import {
  getLeaderboard,
  getUserRank,
  getBranchStats,
  getOverallStats,
} from "../services/leaderboard.service.js";
import { sendResponse } from "../utils/ApiResponse.js";

// ── GET /api/leaderboard ──────────────────────────────────────────────────────
// Query params: ?branch=CSE&limit=50
// branch defaults to ALL

export async function getLeaderboardHandler(req, res, next) {
  try {
    const selectedBranch = req.query.branch || "ALL";
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);

    const entries = await getLeaderboard(selectedBranch, limit);

    // Compute user's rank matching the current filter view if opted-in
    let myRank = null;
    if (req.user?.lbOptIn && req.user?._id) {
      myRank = await getUserRank(req.user._id, selectedBranch);
    }

    sendResponse(
      res,
      200,
      {
        entries,
        myRank,
        count: entries.length,
      },
      "Leaderboard fetched successfully"
    );
  } catch (err) {
    next(err);
  }
}

// ── GET /api/leaderboard/stats ────────────────────────────────────────────────
// Branch-wise and overall statistics — used for analytics dashboard

export async function getStatsHandler(req, res, next) {
  try {
    const [branchStats, overall] = await Promise.all([
      getBranchStats(),
      getOverallStats(),
    ]);

    sendResponse(
      res,
      200,
      { branchStats, overall },
      "Stats fetched successfully"
    );
  } catch (err) {
    next(err);
  }
}