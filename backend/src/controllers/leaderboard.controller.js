import { getLeaderboard } from "../services/leaderboard.service.js";
import { sendResponse }   from "../utils/ApiResponse.js";

// GET /api/leaderboard?branch=CSE&faculty=pharmacy&limit=all
export async function getLeaderboardHandler(req, res, next) {
  try {
    let { branch = "ALL", faculty = null, limit = 500 } = req.query;

    // Parse limit gracefully: if limit is "all" or invalid, set to 0 (unlimited)
    let parsedLimit = parseInt(limit, 10);
    if (limit === "all" || isNaN(parsedLimit)) {
      parsedLimit = 0; // 0 in MongoDB .limit(0) means return ALL records
    }

    const entries = await getLeaderboard(branch, faculty, parsedLimit);
    sendResponse(res, 200, { entries, count: entries.length }, "Leaderboard fetched");
  } catch (err) { 
    next(err); 
  }
}