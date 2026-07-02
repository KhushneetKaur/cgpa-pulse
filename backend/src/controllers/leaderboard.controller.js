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
    const { branch, limit } = req.query;

    const entries = await getLeaderboard(
      branch || "ALL",
      Number(limit)  || 50
    );

    // Find where the current user ranks if they are opted in
    let myRank = null;
    if (req.user?.lbOptIn && req.user?.branch) {
      myRank = await getUserRank(req.user._id, req.user.branch);
    }

    sendResponse(
      res, 200,
      { entries, myRank, total: entries.length },
      "Leaderboard fetched"
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
      res, 200,
      { branchStats, overall },
      "Stats fetched"
    );
  } catch (err) {
    next(err);
  }
}