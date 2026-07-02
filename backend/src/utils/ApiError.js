// Custom error class that carries an HTTP status code so the global error
// middleware can respond consistently without if/else chains everywhere.

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.message = message;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

ApiError.badRequest = (msg, errors = []) =>
  new ApiError(400, msg, errors);
ApiError.unauthorized = (msg = "Unauthorized - please log in") =>
  new ApiError(401, msg);
ApiError.forbidden = (msg = "You do not have permission to do this") =>
  new ApiError(403, msg);
ApiError.notFound = (msg = "Resource not found") =>
  new ApiError(404, msg);
ApiError.conflict = (msg = "Resource already exists") =>
  new ApiError(409, msg);
ApiError.tooMany = (msg = "Too many requests") =>
  new ApiError(429, msg);
ApiError.internal = (msg = "Internal server error") =>
  new ApiError(500, msg);

export default ApiError;
