// Standard response wrapper used across controllers to guarantee uniform response contracts

class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

/**
 Shorthand helper for sending standardized JSON responses in controllers
 * 
 * @example
 * sendResponse(res, 200, { user }, "User profile updated");
 */
export function sendResponse(res, statusCode, data = null, message = "Success") {
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, data, message));
}

export default ApiResponse;