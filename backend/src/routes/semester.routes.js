import { Router } from "express";
import {
  getAllSemesters,
  getOneSemesterHandler,
  saveSemesterHandler,
  saveQuickSgpaHandler,
  deleteSemesterHandler,
  toggleBacklogHandler,
  updateElectiveHandler,
  addCustomSubject,
  removeCustomSubject,
  toggleSubjectVisibility,
} from "../controllers/semester.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  saveLimiter,
  readLimiter,
} from "../middleware/rateLimit.middleware.js";
import {
  semesterSchema,
  quickSgpaSchema,
} from "../utils/validators.js";

const router = Router();

// Apply authentication middleware across all semester operations
router.use(protect);

// ── Read Routes ──────────────────────────────────────────────────────────────

// GET /api/semesters/:branch — Get all semesters for a specific branch
router.get(
  "/:branch",
  readLimiter,
  getAllSemesters
);

// GET /api/semesters/:branch/:semNumber — Get details for a single semester
router.get(
  "/:branch/:semNumber",
  readLimiter,
  getOneSemesterHandler
);

// ── Write & Update Routes ────────────────────────────────────────────────────

// POST /api/semesters/:branch/:semNumber — Save full detailed marks entry
router.post(
  "/:branch/:semNumber",
  saveLimiter,
  validate(semesterSchema),
  saveSemesterHandler
);

// POST /api/semesters/:branch/:semNumber/quick — Save quick SGPA without full marks
router.post(
  "/:branch/:semNumber/quick",
  saveLimiter,
  validate(quickSgpaSchema),
  saveQuickSgpaHandler
);

// DELETE /api/semesters/:branch/:semNumber — Delete a semester entry
router.delete(
  "/:branch/:semNumber",
  saveLimiter,
  deleteSemesterHandler
);

// ── Backlog & Elective Management ────────────────────────────────────────────

// PUT /api/semesters/:branch/:semNumber/backlog — Toggle subject backlog state
router.put(
  "/:branch/:semNumber/backlog",
  saveLimiter,
  toggleBacklogHandler
);

// PUT /api/semesters/:branch/:semNumber/elective — Update elective mapping
router.put(
  "/:branch/:semNumber/elective",
  saveLimiter,
  updateElectiveHandler
);

// ── Custom Subjects & Visibility Modifications ───────────────────────────────

// POST /api/semesters/:branch/:semNumber/custom-subjects — Add custom subject
router.post(
  "/:branch/:semNumber/custom-subjects",
  saveLimiter,
  addCustomSubject
);

// DELETE /api/semesters/:branch/:semNumber/custom-subjects/:code — Remove custom subject
router.delete(
  "/:branch/:semNumber/custom-subjects/:code",
  saveLimiter,
  removeCustomSubject
);

// PATCH /api/semesters/:branch/:semNumber/subjects/:code/visibility — Toggle subject visibility
router.patch(
  "/:branch/:semNumber/subjects/:code/visibility",
  saveLimiter,
  toggleSubjectVisibility
);

export default router;