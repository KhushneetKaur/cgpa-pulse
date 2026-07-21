import rateLimit from "express-rate-limit";
import ApiError from "../utils/ApiError.js";

// Helper function for consistent 429 response structure
const createRateLimitHandler = (customMessage) => (req, res) => {
  const message = customMessage || "Too many requests — please try again later";
  return res.status(429).json({
    success: false,
    message,
  });
};

// ── Reusable rate limiter factory ─────────────────────────────────────────────

export function rateLimiter(options = {}) {
  const message = options.message || "Too many requests — please try again later";

  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 min default
    max: options.max || 100,
    standardHeaders: true, // Return standard RateLimit-* headers
    legacyHeaders: false,
    handler: createRateLimitHandler(message),
    ...options,
  });
}

// ── Pre-configured limiters ───────────────────────────────────────────────────

// Strict: Auth routes by IP — 50 attempts per 15 min per IP
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many authentication attempts — please try again in 15 minutes",
});

// Medium: Save semester — 60 per 15 min
export const saveLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many save requests — slow down",
});

// Loose: Read requests — 200 per 15 min
export const readLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests — please slow down",
});

// ── Account / Identifier Rate Limiter ─────────────────────────────────────────
// Protects against distributed credential stuffing targeting a single username/email

const MAX_MAP_SIZE = 10000;
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_MAX_ATTEMPTS = 50;

const authAttempts = new Map();

// Periodic cleanup timer (unref'd so it doesn't block process exit during tests)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of authAttempts.entries()) {
    if (record.resetAt <= now) {
      authAttempts.delete(key);
    }
  }
}, AUTH_WINDOW_MS);

if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

export function authIdentifierLimiter(req, res, next) {
  const now = Date.now();

  const rawIdentifier =
    req.body?.identifier || req.body?.username || req.body?.email || "unknown";
  const identifier = String(rawIdentifier).trim().toLowerCase();

  const clientIp = req.ip || req.socket?.remoteAddress || "unknown";
  const key = `${clientIp}:${identifier}`;

  const record = authAttempts.get(key);

  if (!record || record.resetAt <= now) {
    // Hard cap size eviction to prevent memory growth under high traffic
    if (authAttempts.size >= MAX_MAP_SIZE) {
      const firstKey = authAttempts.keys().next().value;
      authAttempts.delete(firstKey);
    }

    authAttempts.set(key, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return next();
  }

  record.count += 1;

  if (record.count > AUTH_MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: "Too many attempts for this account — please try again in 15 minutes",
    });
  }

  next();
}