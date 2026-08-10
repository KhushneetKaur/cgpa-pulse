import rateLimit from "express-rate-limit";

// Shared handler — routes 429 through global errorMiddleware for consistent shape
const createRateLimitHandler = (message) => (req, res, next) => {
  const err = new Error(message || "Too many requests — please try again later");
  err.statusCode = 429;
  next(err);
};

// ── Rate limiter factory ──────────────────────────────────────────────────────
function rateLimiter(options = {}) {
  return rateLimit({
    windowMs:        options.windowMs || 15 * 60 * 1000,
    max:             options.max      || 100,
    standardHeaders: true,
    legacyHeaders:   false,
    handler:         createRateLimitHandler(options.message),
    ...options,
  });
}

// ── Pre-configured limiters ───────────────────────────────────────────────────

// Auth routes — 50 attempts per 15 min per IP
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max:      50,
  message:  "Too many authentication attempts — please try again in 15 minutes",
});

// Write/save routes — 60 per 15 min
export const saveLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max:      60,
  message:  "Too many save requests — slow down",
});

// Read routes — 200 per 15 min
export const readLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max:      200,
  message:  "Too many requests — please slow down",
});