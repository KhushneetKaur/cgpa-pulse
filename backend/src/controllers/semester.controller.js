import {
  getUserSemesters,
  getOneSemester,
  saveSemester,
  saveQuickSgpa,
  deleteSemester,
  toggleBacklog,
  updateElectiveName,
  calculateCGPA,
} from "../services/semester.service.js";
import {
  upsertLeaderboardEntry,
} from "../services/leaderboard.service.js";
import { sendResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import SemesterData from "../models/SemesterData.js";

// Helper to reliably parse semester numbers
const parseSem = (semNumber) => {
  const parsed = parseInt(semNumber, 10);
  if (isNaN(parsed) || parsed < 1) {
    throw ApiError.badRequest("Invalid semester number");
  }
  return parsed;
};

// ── GET /api/semesters/:branch ────────────────────────────────────────────────
export async function getAllSemesters(req, res, next) {
  try {
    const { branch } = req.params;
    const userId = req.user._id.toString();

    const semesters = await getUserSemesters(userId, branch);
    const cgpa = calculateCGPA(semesters);

    sendResponse(res, 200, { semesters, cgpa }, "Semesters fetched");
  } catch (err) {
    next(err);
  }
}

// ── GET /api/semesters/:branch/:semNumber ─────────────────────────────────────
export async function getOneSemesterHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const userId = req.user._id.toString();

    const sem = await getOneSemester(userId, branch, parseSem(semNumber));
    sendResponse(res, 200, { semester: sem }, "Semester fetched");
  } catch (err) {
    next(err);
  }
}

// ── POST /api/semesters/:branch/:semNumber ────────────────────────────────────
export async function saveSemesterHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const userId = req.user._id.toString();
    const semNum = parseSem(semNumber);

    const saved = await saveSemester(userId, {
      ...req.body,
      branch,
      semNumber: semNum,
    });

    const allSems = await getUserSemesters(userId, branch);
    const cgpa = calculateCGPA(allSems);

    // Sync leaderboard entry if user is opted in
    if (req.user.lbOptIn) {
      await upsertLeaderboardEntry({
        userId,
        username: req.user.username,
        branch,
        cgpa,
        semCount: allSems.filter((s) => s.sgpa).length,
      });
    }

    sendResponse(
      res,
      200,
      { semester: saved, cgpa },
      "Semester saved"
    );
  } catch (err) {
    next(err);
  }
}

// ── POST /api/semesters/:branch/:semNumber/quick ──────────────────────────────
export async function saveQuickSgpaHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const { sgpa, credits } = req.body;
    const userId = req.user._id.toString();
    const semNum = parseSem(semNumber);

    const saved = await saveQuickSgpa(
      userId,
      branch,
      semNum,
      sgpa,
      credits
    );

    // Single DB query to get updated list for both CGPA and Leaderboard sync
    const allSems = await getUserSemesters(userId, branch);
    const cgpa = calculateCGPA(allSems);

    if (req.user.lbOptIn && cgpa != null) {
      await upsertLeaderboardEntry({
        userId,
        username: req.user.username,
        branch,
        cgpa,
        semCount: allSems.filter((s) => s.sgpa).length,
      });
    }

    sendResponse(
      res,
      200,
      { semester: saved, cgpa },
      "SGPA saved"
    );
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/semesters/:branch/:semNumber ──────────────────────────────────
export async function deleteSemesterHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const userId = req.user._id.toString();
    const semNum = parseSem(semNumber);

    const result = await deleteSemester(userId, branch, semNum);

    // Recalculate CGPA and update leaderboard after deletion
    const allSems = await getUserSemesters(userId, branch);
    const cgpa = calculateCGPA(allSems);

    if (req.user.lbOptIn) {
      await upsertLeaderboardEntry({
        userId,
        username: req.user.username,
        branch,
        cgpa: cgpa || 0,
        semCount: allSems.filter((s) => s.sgpa).length,
      });
    }

    sendResponse(res, 200, { ...result, cgpa }, "Semester deleted");
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/semesters/:branch/:semNumber/backlog ─────────────────────────────
export async function toggleBacklogHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const { subjectCode } = req.body;
    const userId = req.user._id.toString();

    if (!subjectCode) {
      throw ApiError.badRequest("subjectCode is required");
    }

    const updated = await toggleBacklog(
      userId,
      branch,
      parseSem(semNumber),
      subjectCode
    );

    sendResponse(res, 200, { backlogs: updated.backlogs }, "Backlog updated");
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/semesters/:branch/:semNumber/elective ────────────────────────────
export async function updateElectiveHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const { subjectCode, name } = req.body;
    const userId = req.user._id.toString();

    if (!subjectCode || !name) {
      throw ApiError.badRequest("subjectCode and name are required");
    }

    const updated = await updateElectiveName(
      userId,
      branch,
      parseSem(semNumber),
      subjectCode,
      name
    );

    sendResponse(
      res,
      200,
      { electiveNames: Object.fromEntries(updated.electiveNames || new Map()) },
      "Elective name updated"
    );
  } catch (err) {
    next(err);
  }
}

// ── Custom Subject Management ─────────────────────────────────────────────────
export async function addCustomSubject(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const { name, credits, type } = req.body;
    const userId = req.user._id.toString();

    if (!name || !credits) {
      throw ApiError.badRequest("Name and credits are required");
    }

    const code = `CUSTOM_${Date.now()}`;

    const sem = await SemesterData.findOneAndUpdate(
      { userId, branch, semNumber: parseSem(semNumber) },
      {
        $push: { customSubjects: { code, name, credits: Number(credits), type } },
        $setOnInsert: { userId, branch, semNumber: parseSem(semNumber) },
      },
      { upsert: true, new: true }
    );

    sendResponse(res, 200, { customSubjects: sem.customSubjects }, "Subject added");
  } catch (err) {
    next(err);
  }
}

export async function removeCustomSubject(req, res, next) {
  try {
    const { branch, semNumber, code } = req.params;
    const userId = req.user._id.toString();

    const sem = await SemesterData.findOneAndUpdate(
      { userId, branch, semNumber: parseSem(semNumber) },
      { $pull: { customSubjects: { code } } },
      { new: true }
    );

    sendResponse(res, 200, { customSubjects: sem?.customSubjects || [] }, "Subject removed");
  } catch (err) {
    next(err);
  }
}

export async function toggleSubjectVisibility(req, res, next) {
  try {
    const { branch, semNumber, code } = req.params;
    const { hidden } = req.body;
    const userId = req.user._id.toString();

    const update = hidden
      ? { $addToSet: { hiddenSubjects: code } }
      : { $pull: { hiddenSubjects: code } };

    const sem = await SemesterData.findOneAndUpdate(
      { userId, branch, semNumber: parseSem(semNumber) },
      { ...update, $setOnInsert: { userId, branch, semNumber: parseSem(semNumber) } },
      { upsert: true, new: true }
    );

    sendResponse(res, 200, { hiddenSubjects: sem?.hiddenSubjects || [] }, "Visibility updated");
  } catch (err) {
    next(err);
  }
}