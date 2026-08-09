import { Router } from "express";
import {
  getAllSemesters,
  saveSemesterHandler,
  saveQuickSgpaHandler,
  deleteSemesterHandler,
  toggleBacklogHandler,
  updateElectiveHandler,
  addCustomSubject,
  removeCustomSubject,
  toggleSubjectVisibility,
} from "../controllers/semester.controller.js";
import { protect }                from "../middleware/auth.middleware.js";
import { validate }               from "../middleware/validate.middleware.js";
import { saveLimiter, readLimiter } from "../middleware/rateLimit.middleware.js";
import {
  semesterSchema,
  quickSgpaSchema,
  toggleBacklogSchema,
  updateElectiveSchema,
  addCustomSubjectSchema,
  toggleVisibilitySchema,
} from "../utils/validators.js";

const router = Router();

router.use(protect);

// ── Read ──────────────────────────────────────────────────────────────────────
router.get("/:branch", readLimiter, getAllSemesters);

// ── Write ─────────────────────────────────────────────────────────────────────
router.post("/:branch/:semNumber",       saveLimiter, validate(semesterSchema),   saveSemesterHandler);
router.post("/:branch/:semNumber/quick", saveLimiter, validate(quickSgpaSchema),  saveQuickSgpaHandler);
router.delete("/:branch/:semNumber",     saveLimiter,                             deleteSemesterHandler);

// ── Backlogs & Electives ──────────────────────────────────────────────────────
router.put("/:branch/:semNumber/backlog",  saveLimiter, validate(toggleBacklogSchema),  toggleBacklogHandler);
router.put("/:branch/:semNumber/elective", saveLimiter, validate(updateElectiveSchema), updateElectiveHandler);

// ── Custom Subjects & Visibility ──────────────────────────────────────────────
router.post("/:branch/:semNumber/custom-subjects",                   saveLimiter, validate(addCustomSubjectSchema),  addCustomSubject);
router.delete("/:branch/:semNumber/custom-subjects/:code",           saveLimiter,                                    removeCustomSubject);
router.patch("/:branch/:semNumber/subjects/:code/visibility",        saveLimiter, validate(toggleVisibilitySchema),  toggleSubjectVisibility);

export default router;