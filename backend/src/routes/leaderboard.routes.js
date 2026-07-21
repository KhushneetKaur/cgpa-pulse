import { Router } from "express";
import {
  getLeaderboardHandler,
  getStatsHandler,
} from "../controllers/leaderboard.controller.js";
import {
  protect,
  optionalProtect,
  requireRole,
} from "../middleware/auth.middleware.js";
import { validateQuery } from "../middleware/validate.middleware.js";
import { readLimiter } from "../middleware/rateLimit.middleware.js";
import { leaderboardQuerySchema } from "../utils/validators.js";

const router = Router();

// ── GET /api/leaderboard ──────────────────────────────────────────────────────
// Public — anyone can view the leaderboard.
// If authenticated (JWT present), also attaches user's individual rank.
router.get(
  "/",
  readLimiter,
  optionalProtect,
  validateQuery(leaderboardQuerySchema),
  getLeaderboardHandler
);

// ── GET /api/leaderboard/stats ────────────────────────────────────────────────
// Protected (Admin only) — returns branch metrics and platform overview.
router.get(
  "/stats",
  readLimiter,
  protect,
  requireRole("admin"),
  getStatsHandler
);

export default router;