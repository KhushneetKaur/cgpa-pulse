import ApiError from "../utils/ApiError.js";

// Pass a Joi schema and it validates req.body
// Throws 400 with field-level errors if validation fails

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly:   false,   // collect ALL errors not just the first
      stripUnknown: true,    // remove fields not in schema
    });

    if (error) {
      const errors = error.details.map(d => ({
        field:   d.path.join("."),
        message: d.message.replace(/['"]/g, ""),
      }));
      return next(ApiError.badRequest("Validation failed", errors));
    }

    // Replace req.body with the validated + sanitised value
    req.body = value;
    next();
  };
}

// Validate query params instead of body
export function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly:   false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(d => ({
        field:   d.path.join("."),
        message: d.message.replace(/['"]/g, ""),
      }));
      return next(ApiError.badRequest("Invalid query parameters", errors));
    }

    req.query = value;
    next();
  };
}