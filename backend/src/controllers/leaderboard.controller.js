import { getLeaderboard } from "../services/leaderboard.service.js";
import { sendResponse }   from "../utils/ApiResponse.js";

// GET /api/leaderboard?branch=CSE&limit=50
// branch and limit already validated + defaulted by validateQuery middleware
export async function getLeaderboardHandler(req, res, next) {
  try {
    const entries = await getLeaderboard(req.query.branch, req.query.limit);
    sendResponse(
      res, 
      200, 
      { 
        entries, 
        count: entries.length,
        notice: "Displaying top 50 rankings across engineering branches"
      }, 
      "Leaderboard fetched successfully"
    );
  } catch (err) { next(err); }
}