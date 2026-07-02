import crypto from "crypto";
import ApiError from "../utils/ApiError.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const CSRF_EXEMPT = new Set([
  "/api/auth/csrf",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/auth/verify-otp",
  "/api/auth/resend-otp",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/refresh",
]);

function allowedOrigins() {
  const configured = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== "production") {
    configured.push(
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174"
    );
  }

  return [...new Set(configured)];
}

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = process.env.COOKIE_SAMESITE || (isProduction ? "strict" : "lax");
  return {
    httpOnly: false,
    secure: isProduction,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function issueCsrfToken(req, res) {
  const csrfToken = crypto.randomBytes(32).toString("hex");
  res.cookie("csrfToken", csrfToken, cookieOptions());
  res.status(200).json({
    success: true,
    message: "CSRF token issued",
    data: { csrfToken },
  });
}

export function csrfProtection(req, res, next) {
  // Skip safe HTTP methods
  if (SAFE_METHODS.has(req.method)) return next();

  // Skip exempted auth routes
  if (CSRF_EXEMPT.has(req.path)) return next();

  const origin  = req.get("origin");
  const referer = req.get("referer");
  const origins = allowedOrigins();

  if (origin && !origins.includes(origin)) {
    return next(ApiError.forbidden("Invalid request origin"));
  }

  if (!origin && referer) {
    const validReferer = origins.some((allowed) => referer.startsWith(allowed));
    if (!validReferer) {
      return next(ApiError.forbidden("Invalid request origin"));
    }
  }

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.get("x-csrf-token");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(ApiError.forbidden("Invalid CSRF token"));
  }

  next();
}