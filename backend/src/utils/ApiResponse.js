// Standard response wrapper used in every controller
// Keeps all API responses consistent

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.success    = statusCode < 400;
    this.message    = message;
    this.data       = data;
  }
}

// ── Helper function used in controllers ───────────────────────────────────────
// res.status(200).json(new ApiResponse(200, data, "Fetched"))
// or use the shorthand:
// sendResponse(res, 200, data, "Fetched")

export function sendResponse(res, statusCode, data, message) {
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, data, message));
}

export default ApiResponse;