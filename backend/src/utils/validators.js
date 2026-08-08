import Joi from "joi";

// ── Shared constants ──────────────────────────────────────────────────────────
const VALID_BRANCHES = ["CSE", "AIML", "ECE", "EE", "ME", "CIVIL", "TE"];

// 4–15 chars, at least one letter, letters/numbers/underscores only
// Must match frontend isValidUsername() in OnboardingModal and UsernameSetupModal
const USERNAME_PATTERN = /^(?=.*[a-zA-Z])[a-zA-Z0-9_]{4,15}$/;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const googleAuthSchema = Joi.object({
  credential: Joi.string().required().messages({
    "string.empty": "Google credential is required",
    "any.required": "Google credential is required",
  }),
});

export const updateUsernameSchema = Joi.object({
  username: Joi.string()
    .pattern(USERNAME_PATTERN)
    .required()
    .messages({
      "string.pattern.base":
        "Username must be 4–15 characters, contain at least one letter, and only use letters, numbers, or underscores",
      "any.required": "Username is required",
    }),
});

// ── Semester ──────────────────────────────────────────────────────────────────
export const semesterSchema = Joi.object({
  branch:    Joi.string().valid(...VALID_BRANCHES).optional(),
  semNumber: Joi.number().integer().min(1).max(8).optional(),
  sgpa:      Joi.number().min(0).max(10).precision(2).allow(null),
  credits:   Joi.number().integer().min(0).max(40).required(),
  isPartial: Joi.boolean().default(false),
  mode:      Joi.string().valid("detailed", "quick").default("detailed"),

  marks: Joi.array().items(
    Joi.object({
      code: Joi.string().required(),
      int:  Joi.number().min(0).max(60).allow(null), 
      ext:  Joi.number().min(0).max(60).allow(null),
    })
  ).default([]),

  electiveNames: Joi.object().pattern(Joi.string(), Joi.string()).default({}),
  backlogs:      Joi.array().items(Joi.string()).default([]),
});

export const quickSgpaSchema = Joi.object({
  sgpa:    Joi.number().min(0).max(10).precision(2).required().messages({
    "number.min":  "SGPA cannot be less than 0",
    "number.max":  "SGPA cannot be more than 10",
    "any.required": "SGPA is required",
  }),
  credits: Joi.number().integer().min(0).max(40).required(),
});

// ── Profile ───────────────────────────────────────────────────────────────────
export const updateBranchSchema = Joi.object({
  branch: Joi.string()
    .uppercase()
    .valid(...VALID_BRANCHES)
    .allow(null)
    .required()
    .messages({ "any.only": "Invalid branch selected" }),
});

export const updateLbOptInSchema = Joi.object({
  optIn: Joi.boolean().required(),
});

// ── Leaderboard ───────────────────────────────────────────────────────────────
export const leaderboardQuerySchema = Joi.object({
  branch: Joi.string().uppercase().valid(...VALID_BRANCHES, "ALL").default("ALL"),
  limit:  Joi.number().integer().min(1).max(100).default(50),
});
export const toggleBacklogSchema = Joi.object({
  subjectCode: Joi.string().required(),
});

export const updateElectiveSchema = Joi.object({
  subjectCode: Joi.string().required(),
  name:        Joi.string().max(120).required(),
});

export const addCustomSubjectSchema = Joi.object({
  name:    Joi.string().max(120).required(),
  credits: Joi.number().integer().min(1).max(10).required(),
  type:    Joi.string().valid("theory", "lab").default("theory"),
});

export const toggleVisibilitySchema = Joi.object({
  hidden: Joi.boolean().required(),
});