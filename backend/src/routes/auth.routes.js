import { Router } from "express";
import { googleSignIn, logout, getMe, refresh } from "../controllers/auth.controller.js";
import { protect }     from "../middleware/auth.middleware.js";
import { validate }    from "../middleware/validate.middleware.js";
import { authLimiter, readLimiter } from "../middleware/rateLimit.middleware.js";
import { googleAuthSchema } from "../utils/validators.js";

const router = Router();

// POST /api/auth/google — Google OAuth login/signup
router.post("/google", authLimiter, validate(googleAuthSchema), googleSignIn);

// POST /api/auth/refresh — rotate tokens using httpOnly refresh cookie
router.post("/refresh", authLimiter, refresh);

// POST /api/auth/logout — clear session cookies
router.post("/logout", logout);

// GET /api/auth/me — restore session on app launch
router.get("/me", protect, readLimiter, getMe);

export default router;