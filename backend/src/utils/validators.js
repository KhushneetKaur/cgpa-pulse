import Joi from "joi";

// ── Common Reusable Patterns ─────────────────────────────────────────────────

// Must contain at least one letter, allows numbers and underscores, 3-30 chars
const usernamePattern = /^(?=.*[a-zA-Z])[a-zA-Z0-9_]{3,30}$/;

const validBranches = ["CSE", "AIML", "ECE", "EE", "ME", "CIVIL", "TE"];

// ── Auth Schemas ─────────────────────────────────────────────────────────────

export const googleAuthSchema = Joi.object({
  credential: Joi.string().required().messages({
    "string.empty": "Google ID token credential is required",
    "any.required": "Google ID token credential is required",
  }),
});

export const updateUsernameSchema = Joi.object({
  username: Joi.string()
    .pattern(usernamePattern)
    .required()
    .messages({
      "string.pattern.base":
        "Username must be 3-30 characters, contain at least one letter, and only use letters, numbers, or underscores",
      "any.required": "Username is required",
    }),
});

// ── Semester Data Schemas ─────────────────────────────────────────────────────

export const semesterSchema = Joi.object({
  branch: Joi.string()
    .valid(...validBranches)
    .optional()
    .messages({
      "any.only": "Invalid academic branch selected",
    }),

  semNumber: Joi.number()
    .integer()
    .min(1)
    .max(8)
    .optional()
    .messages({
      "number.min": "Semester number must be between 1 and 8",
      "number.max": "Semester number must be between 1 and 8",
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

  credits: Joi.number().integer().min(0).max(40).required(),

  isPartial: Joi.boolean().default(false),

  mode: Joi.string().valid("detailed", "quick").default("detailed"),

  marks: Joi.array()
    .items(
      Joi.object({
        code: Joi.string().required(),
        int: Joi.number().min(0).max(60).allow(null),
        ext: Joi.number().min(0).max(60).allow(null),
      })
    )
    .default([]),

  electiveNames: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .default({}),

  backlogs: Joi.array().items(Joi.string()).default([]),
});

export const quickSgpaSchema = Joi.object({
  sgpa: Joi.number()
    .min(0)
    .max(10)
    .precision(2)
    .required()
    .messages({
      "number.min": "SGPA cannot be less than 0",
      "number.max": "SGPA cannot be more than 10",
      "any.required": "SGPA is required",
    }),

  credits: Joi.number().integer().min(0).max(40).required(),
});

// ── Profile Update Schemas ────────────────────────────────────────────────────

export const updateBranchSchema = Joi.object({
  branch: Joi.string()
    .valid(...validBranches, null)
    .required()
    .messages({
      "any.only": "Invalid branch selected",
    }),
});

export const updateLbOptInSchema = Joi.object({
  optIn: Joi.boolean().required(),
});

// ── Leaderboard Schemas ───────────────────────────────────────────────────────

export const leaderboardQuerySchema = Joi.object({
  branch: Joi.string()
    .valid(...validBranches, "ALL")
    .default("ALL"),

  limit: Joi.number().integer().min(1).max(100).default(50),
});