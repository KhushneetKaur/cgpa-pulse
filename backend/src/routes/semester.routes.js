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
import { protect }      from "../middleware/auth.middleware.js";
import { validate }     from "../middleware/validate.middleware.js";
import {
  saveLimiter,
  readLimiter,
} from "../middleware/rateLimit.middleware.js";
import {
  semesterSchema,
  quickSgpaSchema,
} from "../utils/validators.js";

const router = Router();

// All semester routes require authentication
router.use(protect);

// ── GET /api/semesters/:branch ────────────────────────────────────────────────
router.get(
  "/:branch",
  readLimiter,
  getAllSemesters
);

// ── GET /api/semesters/:branch/:semNumber ─────────────────────────────────────
router.get(
  "/:branch/:semNumber",
  readLimiter,
  getOneSemesterHandler
);

// ── POST /api/semesters/:branch/:semNumber ────────────────────────────────────
// Save full detailed marks entry
router.post(
  "/:branch/:semNumber",
  saveLimiter,
  validate(semesterSchema),
  saveSemesterHandler
);

// ── POST /api/semesters/:branch/:semNumber/quick ──────────────────────────────
// Save SGPA directly without individual marks
router.post(
  "/:branch/:semNumber/quick",
  saveLimiter,
  validate(quickSgpaSchema),
  saveQuickSgpaHandler
);

// ── DELETE /api/semesters/:branch/:semNumber ──────────────────────────────────
router.delete(
  "/:branch/:semNumber",
  saveLimiter,
  deleteSemesterHandler
);

// ── PUT /api/semesters/:branch/:semNumber/backlog ─────────────────────────────
// Toggle a subject code as backlog
router.put(
  "/:branch/:semNumber/backlog",
  saveLimiter,
  toggleBacklogHandler
);

// ── PUT /api/semesters/:branch/:semNumber/elective ────────────────────────────
// Update elective subject name
router.put(
  "/:branch/:semNumber/elective",
  saveLimiter,
  updateElectiveHandler
);
router.post(
  "/:branch/:semNumber/custom-subjects",
  saveLimiter, addCustomSubject
);
router.delete(
  "/:branch/:semNumber/custom-subjects/:code",
  saveLimiter, removeCustomSubject
);
router.patch(
  "/:branch/:semNumber/subjects/:code/visibility",
  saveLimiter, toggleSubjectVisibility
);
export default router;