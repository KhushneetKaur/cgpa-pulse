import { logger } from "../config/logger.js";
import ApiError   from "../utils/ApiError.js";

export function errorMiddleware(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {

    // Joi validation error
    if (err.isJoi || err.details) {
      const errors = err.details?.map(d => ({
        field:   d.path.join("."),
        message: d.message.replace(/"/g, ""),
      }));
      error = ApiError.badRequest(err.message || "Validation failed", errors);
    }

    // Mongoose schema validation
    else if (err.name === "ValidationError") {
      const errors = Object.values(err.errors || {}).map(e => ({
        field:   e.path,
        message: e.message,
      }));
      error = ApiError.badRequest("Database validation failed", errors);
    }

    // Mongoose duplicate key
    else if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "Field";
      const label = field.charAt(0).toUpperCase() + field.slice(1);
      error = ApiError.conflict(`${label} is already taken`);
    }

    // Mongoose bad ObjectId
    else if (err.name === "CastError") {
      error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
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
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}