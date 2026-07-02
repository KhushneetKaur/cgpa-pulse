import { Router } from "express";
import {
  getLeaderboardHandler,
  getStatsHandler,
} from "../controllers/leaderboard.controller.js";
import { protect, optionalProtect } from "../middleware/auth.middleware.js";
import { requireRole }      from "../middleware/auth.middleware.js";
import { validateQuery }    from "../middleware/validate.middleware.js";
import { readLimiter }      from "../middleware/rateLimit.middleware.js";
import { leaderboardQuerySchema } from "../utils/validators.js";

const router = Router();

// ── GET /api/leaderboard ──────────────────────────────────────────────────────
// Public — anyone can see the leaderboard
// But if logged in, also returns user's own rank
router.get(
  "/",
  readLimiter,
  optionalProtect,
  validateQuery(leaderboardQuerySchema),
  getLeaderboardHandler
);

// ── GET /api/leaderboard/stats ────────────────────────────────────────────────
// Admin only — branch stats and platform overview
router.get(
  "/stats",
  readLimiter,
  protect,
  requireRole("admin"),
  getStatsHandler
);

export default router;
