import { logger } from "../config/logger.js";
import ApiError   from "../utils/ApiError.js";

// Global error handler — must be the last app.use() in app.js
// Catches everything thrown with next(err) or throw inside async routes

export function errorMiddleware(err, req, res, next) {
  let error = err;

  // If it's not already an ApiError, convert it
  if (!(error instanceof ApiError)) {

    // 1. Joi Validation Error (from Request Body/Query Validation)
    if (err.isJoi || err.details) {
      const errors = err.details?.map(d => ({
        field:   d.path.join("."),
        message: d.message.replace(/"/g, ""), // clean quotes for user-friendly UI alerts
      }));
      error = ApiError.badRequest(err.message || "Validation failed", errors);
    }

    // 2. Mongoose Schema Validation Error
    else if (err.name === "ValidationError") {
      const errors = Object.values(err.errors || {}).map(e => ({
        field:   e.path,
        message: e.message,
      }));
      error = ApiError.badRequest("Database validation failed", errors);
    }

    // 3. Mongoose Duplicate Key Error (e.g., username or email already taken)
    else if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "Field";
      const label = field.charAt(0).toUpperCase() + field.slice(1);
      error = ApiError.conflict(`${label} is already taken`);
    }

    // 4. Mongoose Bad ObjectId
    else if (err.name === "CastError") {
      error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
    }

    // 5. JWT Errors
    else if (err.name === "JsonWebTokenError") {
      error = ApiError.unauthorized("Invalid token — please log in again");
    }
    else if (err.name === "TokenExpiredError") {
      error = ApiError.unauthorized("Token expired — please log in again");
    }

    // 6. Catch-all for unexpected internal crashes
    else {
      error = ApiError.internal(
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong"
      );
    }
  }

  // Log server errors (5xx) — don't clutter logs with expected client errors (4xx)
  if (error.statusCode >= 500) {
    logger.error(`${error.statusCode} — ${error.message}`, {
      stack:  err.stack,
      path:   req.path,
      method: req.method,
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors:  error.errors?.length ? error.errors : undefined,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}