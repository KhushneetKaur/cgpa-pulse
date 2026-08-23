import { getLeaderboard } from "../services/leaderboard.service.js";
import { sendResponse }   from "../utils/ApiResponse.js";

// GET /api/leaderboard?branch=CSE&faculty=pharmacy&limit=50
// branch defaults to ALL (global), faculty is optional filter
export async function getLeaderboardHandler(req, res, next) {
  try {
    const { branch = "ALL", faculty = null, limit = 50 } = req.query;
    const entries = await getLeaderboard(branch, faculty, Number(limit));
    sendResponse(res, 200, { entries, count: entries.length }, "Leaderboard fetched");
  } catch (err) { next(err); }
}