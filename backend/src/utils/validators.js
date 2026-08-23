import Joi from "joi";

// ── Branch registries — add new programmes here only ─────────────────────────
// Frontend pharmacyBranches.js and backend models must also be updated when adding.

const ENGINEERING_BRANCHES = ["CSE", "AIML", "ECE", "EE", "ME", "CIVIL", "TE"];

const PHARMACY_BRANCHES    = ["BPHARM", "PHARMD", "MPHARM"];

// Future — uncomment and populate when ready:
// const SCIENCE_BRANCHES  = ["BSC_PCM", "BSC_CBZ"];
// const BCA_BRANCHES      = ["BCA"];

export const VALID_BRANCHES = [
  ...ENGINEERING_BRANCHES,
  ...PHARMACY_BRANCHES,
  // ...SCIENCE_BRANCHES,
  // ...BCA_BRANCHES,
];

export const VALID_FACULTIES = ["engineering", "pharmacy"];
// Future: add "science", "bca" etc. here

// ── Subject type registry — add new types here when new programmes arrive ─────
const VALID_SUBJECT_TYPES = [
  // Engineering
  "theory", "lab", "project",
  // Pharmacy (NUE = Non-University Examination)
  "theory-small",     // NUE theory out of 50  (15 int + 35 ext)
  "theory-75",        // NUE theory out of 75  (25 int + 50 ext)
  "lab-small",        // NUE practical out of 25 (10 int + 15 ext)
  "practice-school",  // Sem 7 Practice School (25 int + 125 ext = 150)
  // Future programmes — add their types here
];

// ── Username pattern ──────────────────────────────────────────────────────────
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
  // branch is optional — comes from route param too, included for body completeness
  branch:    Joi.string().valid(...VALID_BRANCHES).optional(),

  // max 12 — covers 8-sem B.Tech, 5-year Pharm.D, future 6-year programmes
  semNumber: Joi.number().integer().min(1).max(12).optional(),

  sgpa:      Joi.number().min(0).max(10).precision(2).allow(null),

  // max 300 — semester credit totals vary widely (B.Pharm Sem 1 = 28, M.Pharm Sem 3 = 24 dissertation)
  credits:   Joi.number().integer().min(0).max(300).required(),

  isPartial: Joi.boolean().default(false),
  mode:      Joi.string().valid("detailed", "quick").default("detailed"),

  marks: Joi.array().items(
    Joi.object({
      code: Joi.string().required(),
      // max 150 — covers Practice School (125 ext) and future programmes
      int:  Joi.number().min(0).max(150).allow(null),
      ext:  Joi.number().min(0).max(150).allow(null),
    })
  ).default([]),

  electiveNames: Joi.object().pattern(Joi.string(), Joi.string()).default({}),
  backlogs:      Joi.array().items(Joi.string()).default([]),
});

export const quickSgpaSchema = Joi.object({
  sgpa:    Joi.number().min(0).max(10).precision(2).required().messages({
    "number.min":   "SGPA cannot be less than 0",
    "number.max":   "SGPA cannot be more than 10",
    "any.required": "SGPA is required",
  }),
  // max 300 — same reasoning as semesterSchema.credits
  credits: Joi.number().integer().min(0).max(300).required(),
});

// ── Profile ───────────────────────────────────────────────────────────────────
export const updateBranchSchema = Joi.object({
  branch: Joi.string()
    .uppercase()
    .valid(...VALID_BRANCHES)
    .allow(null)
    .required()
    .messages({ "any.only": `Invalid branch. Valid values: ${VALID_BRANCHES.join(", ")}` }),
});

export const updateFacultySchema = Joi.object({
  faculty: Joi.string()
    .valid(...VALID_FACULTIES)
    .required()
    .messages({ "any.only": `Invalid faculty. Valid values: ${VALID_FACULTIES.join(", ")}` }),
});

export const updateLbOptInSchema = Joi.object({
  optIn: Joi.boolean().required(),
});

export const updateCurrentSemSchema = Joi.object({
  // max 12 — same reasoning as semesterSchema.semNumber
  semNumber: Joi.number().integer().min(1).max(12).required(),
});

export const appInstallSchema = Joi.object({
  platform: Joi.string().valid("android", "ios", "desktop").default("unknown"),
});

export const updateJoiningYearSchema = Joi.object({
  joiningYear: Joi.number().integer().min(2018).max(2035).required(),
});

// ── Semester sub-operations ───────────────────────────────────────────────────
export const toggleBacklogSchema = Joi.object({
  subjectCode: Joi.string().required(),
});

export const updateElectiveSchema = Joi.object({
  subjectCode: Joi.string().required(),
  name:        Joi.string().max(120).required(),
});

export const addCustomSubjectSchema = Joi.object({
  name:    Joi.string().max(120).required(),
  // max 30 — M.Pharm dissertation is 24 credits
  credits: Joi.number().integer().min(1).max(30).required(),
  // Uses VALID_SUBJECT_TYPES so adding a new programme type here just works
  type:    Joi.string().valid(...VALID_SUBJECT_TYPES).default("theory"),
});

export const toggleVisibilitySchema = Joi.object({
  hidden: Joi.boolean().required(),
});

// ── Leaderboard ───────────────────────────────────────────────────────────────
export const leaderboardQuerySchema = Joi.object({
  branch:  Joi.string().uppercase().valid(...VALID_BRANCHES, "ALL").default("ALL"),
  faculty: Joi.string().valid(...VALID_FACULTIES).optional(),
  limit:   Joi.number().integer().min(1).max(100).default(50),
});