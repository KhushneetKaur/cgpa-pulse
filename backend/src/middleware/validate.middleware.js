import ApiError from "../utils/ApiError.js";

// Pass a Joi schema to validate req.body
// Throws 400 with field-level errors if validation fails

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // Collect ALL errors, not just the first
      stripUnknown: true,  // Remove fields not explicitly defined in schema
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message.replace(/"/g, ""),
      }));
      return next(ApiError.badRequest("Validation failed", errors));
    }

    // Replace req.body with the sanitized and validated value
    req.body = value;
    next();
  };
}

// Validate req.query parameters
export function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message.replace(/"/g, ""),
      }));
      return next(ApiError.badRequest("Invalid query parameters", errors));
    }

    // Safely update req.query properties
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
    Object.assign(req.query, value);

    next();
  };
}