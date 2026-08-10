import ApiError from "../utils/ApiError.js";

// Shared error formatter — used by both validators
function formatErrors(details) {
  return details.map(d => ({
    field:   d.path.join("."),
    message: d.message.replace(/"/g, ""),
  }));
}

const JOI_OPTIONS = {
  abortEarly:   false, // collect all errors, not just first
  stripUnknown: true,  // remove fields not in schema
};

// Validate req.body against a Joi schema
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, JOI_OPTIONS);
    if (error) return next(ApiError.badRequest("Validation failed", formatErrors(error.details)));
    req.body = value;
    next();
  };
}

// Validate req.query against a Joi schema
export function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, JOI_OPTIONS);
    if (error) return next(ApiError.badRequest("Invalid query parameters", formatErrors(error.details)));
    req.query = value;
    next();
  };
}