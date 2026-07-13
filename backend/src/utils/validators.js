import Joi from "joi";

// ── Reusable Joi schemas ──────────────────────────────────────────────────────
// Import these in validate.middleware.js and in controllers directly

// ── Auth ──────────────────────────────────────────────────────────────────────

export const signupSchema = Joi.object({
    username: Joi.string()
  .min(3)
  .max(30)
  .pattern(/^[a-zA-Z0-9_]+$/)
  .pattern(/[a-zA-Z]/, "must contain at least one letter")
  .required()
  .messages({
    "string.pattern.base":
      "Username must contain at least one letter",
    "string.min":   "Username must be at least 3 characters",
    "string.max":   "Username cannot exceed 30 characters",
    "any.required": "Username is required",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email":   "Enter a valid email address",
      "any.required":   "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(64)
    .required()
    .messages({
      "string.min":   "Password must be at least 8 characters",
      "string.max":   "Password cannot exceed 64 characters",
      "any.required": "Password is required",
    }),
});

export const loginSchema = Joi.object({
  // Allow login with either username or email
  identifier: Joi.string()
    .required()
    .messages({ "any.required": "Username or email is required" }),

  password: Joi.string()
    .required()
    .messages({ "any.required": "Password is required" }),
});

export const updateUsernameSchema = Joi.object({
  username: Joi.string()
    .min(4).max(15)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .pattern(/[a-zA-Z]/, "must contain at least one letter")
    .required()
    .messages({
      "string.pattern.base": "Username must contain at least one letter and only use letters, numbers, underscores",
      "string.min":          "Username must be at least 4 characters",
      "string.max":          "Username cannot exceed 15 characters",
      "any.required":        "Username is required",
    }),
});
// ── Semester data ─────────────────────────────────────────────────────────────

export const semesterSchema = Joi.object({
  branch: Joi.string()
    .valid("CSE","AIML", "ECE", "EE", "ME", "CIVIL", "TE")
    .optional()
    .messages({
      "any.only":   "Invalid branch",
      "any.required": "Branch is required",
    }),

  semNumber: Joi.number()
    .integer()
    .min(1)
    .max(8)
    .optional()
    .messages({
      "number.min":   "Semester number must be between 1 and 8",
      "number.max":   "Semester number must be between 1 and 8",
      "any.required": "Semester number is required",
    }),

  sgpa: Joi.number()
    .min(0)
    .max(10)
    .precision(2)
    .allow(null)
    .messages({
      "number.min": "SGPA cannot be less than 0",
      "number.max": "SGPA cannot be more than 10",
    }),

  credits: Joi.number()
    .integer()
    .min(0)
    .max(40)
    .required(),

  isPartial: Joi.boolean().default(false),

  mode: Joi.string()
    .valid("detailed", "quick")
    .default("detailed"),

  marks: Joi.array()
    .items(
      Joi.object({
        code: Joi.string().required(),
        int:  Joi.number().min(0).max(60).allow(null),
        ext:  Joi.number().min(0).max(60).allow(null),
      })
    )
    .default([]),

  electiveNames: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .default({}),

  backlogs: Joi.array()
    .items(Joi.string())
    .default([]),
});

// ── Quick SGPA entry ──────────────────────────────────────────────────────────

export const quickSgpaSchema = Joi.object({
  sgpa: Joi.number()
    .min(0)
    .max(10)
    .precision(2)
    .required()
    .messages({
      "number.min":   "SGPA cannot be less than 0",
      "number.max":   "SGPA cannot be more than 10",
      "any.required": "SGPA is required",
    }),

  credits: Joi.number()
    .integer()
    .min(0)
    .max(40)
    .required(),
});

// ── User profile update ───────────────────────────────────────────────────────

export const updateBranchSchema = Joi.object({
  branch: Joi.string()
    .valid("CSE", "AIML","ECE", "EE", "ME", "CIVIL", "TE", null)
    .required(),
});

export const updateLbOptInSchema = Joi.object({
  optIn: Joi.boolean().required(),
});

// ── Leaderboard ───────────────────────────────────────────────────────────────

export const leaderboardQuerySchema = Joi.object({
  branch: Joi.string()
    .valid("CSE", "ECE", "EE", "ME", "CIVIL", "TE", "ALL")
    .default("ALL"),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50),
});
