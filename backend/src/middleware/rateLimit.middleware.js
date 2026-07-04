import rateLimit from "express-rate-limit";
import ApiError  from "../utils/ApiError.js";

// ── Reusable rate limiter factory ─────────────────────────────────────────────
// Pass options to customise per route

export function rateLimiter(options = {}) {
  return rateLimit({
    windowMs:         options.windowMs || 15 * 60 * 1000, // 15 min default
    max:              options.max      || 100,
    message:          options.message  || "Too many requests",
    standardHeaders:  true,   // Return rate limit info in RateLimit-* headers
    legacyHeaders:    false,
    // Use ApiError format for consistency
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: options.message || "Too many requests — please try again later",
      });
    },
  });
}

// Add this — max 3 OTP requests per hour per IP
export const otpLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max:      3,
  message:  "Too many OTP requests — please wait before trying again",
});

// ── Pre-configured limiters for specific routes ───────────────────────────────

// Strict: login and signup — 50 attempts per 15 min per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:      50,               
  message:  "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders:   false,
});

// Medium: save semester — 60 per 15 min
const authAttempts = new Map();
// Clean up expired entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of authAttempts) {
    if (record.resetAt <= now) authAttempts.delete(key);
  }
}, 15 * 60 * 1000);

export function authIdentifierLimiter(req, res, next) {
  const windowMs = 15 * 60 * 1000;
  const max = 50;
  const now = Date.now();
  const rawIdentifier =
    req.body?.identifier || req.body?.username || req.body?.email || "unknown";
  const identifier = String(rawIdentifier).trim().toLowerCase();
  const key = `${req.ip}:${identifier}`;
  const record = authAttempts.get(key);

  if (!record || record.resetAt <= now) {
    authAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  record.count += 1;

  if (record.count > max) {
    return res.status(429).json({
      success: false,
      message: "Too many attempts for this account - please try again in 15 minutes",
    });
  }

  if (authAttempts.size > 10000) {
    for (const [attemptKey, attempt] of authAttempts) {
      if (attempt.resetAt <= now) authAttempts.delete(attemptKey);
    }
  }

  next();
}

export const saveLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max:      60,
  message:  "Too many save requests — slow down",
});

// Loose: read requests — 200 per 15 min
export const readLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max:      200,
});
