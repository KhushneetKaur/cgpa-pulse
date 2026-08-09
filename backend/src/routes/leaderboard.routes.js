import { Router } from "express";
import { getLeaderboardHandler } from "../controllers/leaderboard.controller.js";
import { protect }               from "../middleware/auth.middleware.js";
import { validateQuery }         from "../middleware/validate.middleware.js";
import { readLimiter }           from "../middleware/rateLimit.middleware.js";
import { leaderboardQuerySchema } from "../utils/validators.js";

const router = Router();

// GET /api/leaderboard — all logged-in users can view
router.get(
  "/",
  readLimiter,
  protect,
  validateQuery(leaderboardQuerySchema),
  getLeaderboardHandler
);

export default router;