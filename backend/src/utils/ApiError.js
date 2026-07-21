// Custom error class carrying HTTP status codes for standardized API error handling.

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Static Factory Helpers
  static badRequest(msg = "Bad Request", errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = "Unauthorized - please log in") {
    return new ApiError(401, msg);
  }

  static forbidden(msg = "You do not have permission to do this") {
    return new ApiError(403, msg);
  }

  static notFound(msg = "Resource not found") {
    return new ApiError(404, msg);
  }

  static conflict(msg = "Resource already exists") {
    return new ApiError(409, msg);
  }

  static tooMany(msg = "Too many requests - please try again later") {
    return new ApiError(429, msg);
  }

  static internal(msg = "Internal server error") {
    return new ApiError(500, msg);
  }
}

export default ApiError;