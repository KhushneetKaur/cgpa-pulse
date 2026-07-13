import { Router } from "express";
import {
  getProfile,
  updateBranch,
  updateLbOptIn,
} from "../controllers/user.controller.js";
import { protect }      from "../middleware/auth.middleware.js";
import { validate }     from "../middleware/validate.middleware.js";
import { readLimiter, saveLimiter } from "../middleware/rateLimit.middleware.js";
import {
  updateBranchSchema,
  updateLbOptInSchema,
} from "../utils/validators.js";

const router = Router();

// All user routes require authentication
router.use(protect);

// GET /api/user/profile
router.get(
  "/profile",
  readLimiter,
  getProfile
);

// PUT /api/user/branch
router.put(
  "/branch",
  saveLimiter,
  validate(updateBranchSchema),
  updateBranch
);

// PUT /api/user/leaderboard
router.put(
  "/leaderboard",
  saveLimiter,
  validate(updateLbOptInSchema),
  updateLbOptIn
);
router.put("/username", saveLimiter, validate(updateUsernameSchema), updateUsername);

export default router;