import { getLeaderboard } from "../services/leaderboard.service.js";
import { sendResponse }   from "../utils/ApiResponse.js";

// GET /api/leaderboard?branch=CSE&limit=50
// branch and limit already validated + defaulted by validateQuery middleware
export async function getLeaderboardHandler(req, res, next) {
  try {
    const branch = req.query.branch || "ALL";
    const limit  = Number(req.query.limit) || 50;

    const entries = await getLeaderboard(branch, limit);

    const branchLabel = branch === "ALL" ? "all branches" : `${branch} branch`;

    sendResponse(
      res, 
      200, 
      { 
        entries: entries || [], 
        count: entries?.length || 0,
        notice: `Displaying top ${limit} rankings across ${branchLabel}`
      }, 
      "Leaderboard fetched successfully"
    );
  } catch (err) { next(err); }
}