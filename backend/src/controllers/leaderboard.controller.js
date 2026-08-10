import {
  getLeaderboard
} from "../services/leaderboard.service.js";
import { sendResponse } from "../utils/ApiResponse.js";

// ── GET /api/leaderboard ──────────────────────────────────────────────────────
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
