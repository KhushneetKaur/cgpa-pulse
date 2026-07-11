import { Router } from "express";
import {
  signup,
  login,
  logout,
  getMe, 
  refresh,
} from "../controllers/auth.controller.js";
import { protect }          from "../middleware/auth.middleware.js";
import { validate }         from "../middleware/validate.middleware.js";
import {
  authLimiter,
  authIdentifierLimiter, 
} from "../middleware/rateLimit.middleware.js";
import {
  signupSchema,
  loginSchema,
} from "../utils/validators.js";
import { issueCsrfToken } from "../middleware/csrf.middleware.js";
import { googleSignIn } from "../controllers/auth.controller.js";

const router = Router();

router.get("/csrf", issueCsrfToken);

// ── Public routes — no auth needed ───────────────────────────────────────────

// POST /api/auth/signup
router.post(
  "/signup",
  authLimiter,              // max 10 attempts per 15 min per IP
  authIdentifierLimiter,
  validate(signupSchema),   // validate body before hitting controller
  signup
);

// POST /api/auth/login
router.post(
  "/login",
  authLimiter,
  authIdentifierLimiter,
  validate(loginSchema),
  login
);

// POST /api/auth/logout
router.post("/logout", logout);

// ── Protected routes — must be logged in ─────────────────────────────────────

// GET /api/auth/me
// Called on every app load to restore session from cookie
router.get("/me", protect, getMe);
router.post("/refresh",         refresh);
router.post("/google", authLimiter, googleSignIn);

export default router;
