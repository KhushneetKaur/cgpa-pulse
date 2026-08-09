import { Router } from "express";
import {
  getProfile,
  updateBranch,
  updateLbOptIn,
  updateUsername,
  updateCurrentSem,
  checkUsername,
  recordAppInstall,
} from "../controllers/user.controller.js";
import { protect }                   from "../middleware/auth.middleware.js";
import { validate }                  from "../middleware/validate.middleware.js";
import { readLimiter, saveLimiter }  from "../middleware/rateLimit.middleware.js";
import {
  updateBranchSchema,
  updateLbOptInSchema,
  updateUsernameSchema,
  updateCurrentSemSchema,
  appInstallSchema,
} from "../utils/validators.js";

const router = Router();

router.use(protect);

// ── Read ──────────────────────────────────────────────────────────────────────
router.get("/profile",        readLimiter,                                    getProfile);
router.get("/check-username", readLimiter,                                    checkUsername);

// ── Write ─────────────────────────────────────────────────────────────────────
router.put("/username",    saveLimiter, validate(updateUsernameSchema),    updateUsername);
router.put("/branch",      saveLimiter, validate(updateBranchSchema),      updateBranch);
router.put("/leaderboard", saveLimiter, validate(updateLbOptInSchema),     updateLbOptIn);
router.put("/current-sem", saveLimiter, validate(updateCurrentSemSchema),  updateCurrentSem);
router.post("/app-install", saveLimiter, validate(appInstallSchema),       recordAppInstall);

export default router;