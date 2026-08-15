import jwt      from "jsonwebtoken";
import User     from "../models/User.js";
import ApiError from "../utils/ApiError.js";

// ── Verify JWT and attach user to request ─────────────────────────────────────
// Reads from httpOnly cookie (accessToken or token) first, Authorization header as fallback
export async function protect(req, res, next) {
  try {
    let token;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next(ApiError.unauthorized("Authentication required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user)          return next(ApiError.unauthorized("User no longer exists"));
    if (!user.isActive) return next(ApiError.unauthorized("Your account has been deactivated"));

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(ApiError.unauthorized("Session expired — please log in again"));
    }
    next(err);
  }
}