import { Router } from "express";
import {
  googleSignIn,
  logout,
  getMe,
  refresh,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import { googleAuthSchema } from "../utils/validators.js";
import { issueCsrfToken } from "../middleware/csrf.middleware.js";

const router = Router();

// CSRF Token endpoint (if applicable for your cross-origin setup)
router.get("/csrf", issueCsrfToken);

// ── Public Authentication Routes ─────────────────────────────────────────────

// POST /api/auth/google
// Primary login/signup mechanism via Google OAuth ID tokens
router.post(
  "/google",
  authLimiter,
  validate(googleAuthSchema),
  googleSignIn
);

// POST /api/auth/refresh
// Issues a fresh access token using the httpOnly refresh token cookie
router.post("/refresh", refresh);

// POST /api/auth/logout
// Clears session cookies
router.post("/logout", logout);

// ── Protected Routes ─────────────────────────────────────────────────────────

// GET /api/auth/me
// Restores user session on app launch
router.get("/me", protect, getMe);

export default router;