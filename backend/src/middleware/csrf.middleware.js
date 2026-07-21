import crypto from "crypto";
import ApiError from "../utils/ApiError.js";
import { sendResponse } from "../utils/ApiResponse.js";

/**
 * Issues a CSRF token stored in a readable cookie and returned in JSON payload.
 * Client frontend (Axios) reads this token and sends it in the X-CSRF-Token header.
 */
export function issueCsrfToken(req, res) {
  const token = crypto.randomBytes(32).toString("hex");

  res.cookie("csrfToken", token, {
    httpOnly: false, // Must be readable by client JavaScript
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 1000, // 1 hour validity
  });

  return sendResponse(res, 200, { csrfToken: token }, "CSRF token issued successfully");
}

/**
 * Validates the X-CSRF-Token header against the double-submit csrfToken cookie.
 */
export function csrfProtection(req, res, next) {
  // Safe HTTP methods do not alter state and are exempt from CSRF validation
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Exempt auth setup routes from CSRF checks
  const exemptPaths = ["/api/auth/csrf", "/api/auth/google"];
  if (exemptPaths.some((path) => req.originalUrl?.startsWith(path))) {
    return next();
  }

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(ApiError.forbidden("Invalid CSRF token"));
  }

  next();
}