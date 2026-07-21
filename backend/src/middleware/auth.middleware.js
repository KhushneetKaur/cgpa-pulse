import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

// ── Verify JWT and attach user to request ─────────────────────────────────────
// Reads token from httpOnly cookie first, then Authorization header as fallback

export async function protect(req, res, next) {
  try {
    let token;

    // 1. Try cookie first (most secure)
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // 2. Fall back to Authorization header
    else if (
      req.headers.authorization?.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full Mongoose document (Do NOT use .lean() here, or user methods like toPublicJSON() fail)
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return next(ApiError.unauthorized("User no longer exists"));
    }

    if (!user.isActive) {
      return next(ApiError.unauthorized("Your account has been deactivated"));
    }

    // Attach to request
    req.user = user;
    next();

  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(ApiError.unauthorized("Session expired or invalid token"));
    }
    next(err);
  }
}

// ── Optional Authentication ────────────────────────────────────────────────---
export async function optionalProtect(req, res, next) {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (user?.isActive) {
      req.user = user;
    }

    next();
  } catch {
    next();
  }
}

// ── Restrict to specific roles ────────────────────────────────────────────────
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }
    
    // Default fallback if role isn't explicitly set on user object
    const userRole = req.user.role || "user";

    if (!roles.includes(userRole)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    
    next();
  };
}