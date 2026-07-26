import { Router } from "express";
import {
  googleSignIn,
  logout,
  getMe,
  refresh,
  checkEmail,
  sendOTP,
  verifyOTP,
  forgotPassword,
  validateResetToken,
  resetPassword,
  login,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import {
  googleAuthSchema,
  checkEmailSchema,
  sendOTPSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  loginSchema,
} from "../utils/validators.js";
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

// ── Email/Password & OTP Routes ──────────────────────────────────────────────

router.post("/check-email", authLimiter, validate(checkEmailSchema), checkEmail);
router.post("/send-otp", authLimiter, validate(sendOTPSchema), sendOTP);
router.post("/verify-otp", authLimiter, validate(verifyOTPSchema), verifyOTP);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.get("/validate-reset-token", validateResetToken); // no validate middleware as it uses query
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
router.post("/login", authLimiter, validate(loginSchema), login);


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