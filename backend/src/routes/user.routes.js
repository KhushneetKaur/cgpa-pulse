import { Router } from "express";
import {
  getProfile,
  updateBranch,
  updateLbOptIn,
  updateUsername,
  updateCurrentSem,
} from "../controllers/user.controller.js";
import { protect }      from "../middleware/auth.middleware.js";
import { validate }     from "../middleware/validate.middleware.js";
import { readLimiter, saveLimiter } from "../middleware/rateLimit.middleware.js";
import {
  updateBranchSchema,
  updateLbOptInSchema,
  updateUsernameSchema,
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

router.put("/current-sem", saveLimiter, updateCurrentSem);

// PUT /api/user/leaderboard
router.put(
  "/leaderboard",
  saveLimiter,
  validate(updateLbOptInSchema),
  updateLbOptIn
);
// PUT /api/user/username
router.put(
  "/username",
  saveLimiter,
  validate(updateUsernameSchema),
  updateUsername
);

export default router;