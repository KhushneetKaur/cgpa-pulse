import jwt      from "jsonwebtoken";
import User     from "../models/User.js";
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
      return next(ApiError.unauthorized());
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user — confirm they still exist and are active
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return next(ApiError.unauthorized("User no longer exists"));
    }

    if (!user.isActive) {
      return next(ApiError.unauthorized("Your account has been deactivated"));
    }

    // Attach to request — available in all downstream middleware and controllers
    req.user = user;
    next();

  } catch (err) {
    next(err);  // JWT errors caught by error.middleware
  }
}

// ── Restrict to specific roles ────────────────────────────────────────────────
// Usage: router.delete("/users/:id", protect, requireRole("admin"), controller)

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

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}
