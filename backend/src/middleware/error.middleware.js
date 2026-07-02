import { logger } from "../config/logger.js";
import ApiError   from "../utils/ApiError.js";

// Global error handler — must be the last app.use() in app.js
// Catches everything thrown with next(err) or throw inside async routes

export function errorMiddleware(err, req, res, next) {
  let error = err;

  // If it's not already an ApiError, convert it
  if (!(error instanceof ApiError)) {
    // Mongoose validation error
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => ({
        field:   e.path,
        message: e.message,
      }));
      error = ApiError.badRequest("Validation failed", errors);
    }

    // Mongoose duplicate key error (e.g. username already taken)
    else if (err.code === 11000) {
      const field   = Object.keys(err.keyValue)[0];
      const isSensitiveField = ["email", "username"].includes(field);
      error = ApiError.conflict(
        isSensitiveField
          ? "An account with these details already exists"
          : `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`
      );
    }

    // Mongoose bad ObjectId
    else if (err.name === "CastError") {
      error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
    }

    // JWT errors
    else if (err.name === "JsonWebTokenError") {
      error = ApiError.unauthorized("Invalid token — please log in again");
    }
    else if (err.name === "TokenExpiredError") {
      error = ApiError.unauthorized("Token expired — please log in again");
    }

    // Catch-all
    else {
      error = ApiError.internal(
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong"
      );
    }
  }

  // Log server errors (5xx) — don't log client errors (4xx) to keep logs clean
  if (error.statusCode >= 500) {
    logger.error(`${error.statusCode} — ${error.message}`, {
      stack:  err.stack,
      path:   req.path,
      method: req.method,
    });
  }

  res.status(error.statusCode).json({
    success:    false,
    message:    error.message,
    errors:     error.errors.length ? error.errors : undefined,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
