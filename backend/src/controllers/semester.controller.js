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
import ApiError         from "../utils/ApiError.js";
import SemesterData from "../models/SemesterData.js";

// ── GET /api/semesters/:branch ────────────────────────────────────────────────
// Returns all saved semesters for a branch

export async function getAllSemesters(req, res, next) {
  try {
    const { branch }  = req.params;
    const userId      = req.user._id;

    const semesters = await getUserSemesters(userId, branch);
    const cgpa      = calculateCGPA(semesters);

    sendResponse(res, 200, { semesters, cgpa }, "Semesters fetched");
  } catch (err) {
    next(err);
  }
}

// ── GET /api/semesters/:branch/:semNumber ─────────────────────────────────────

export async function getOneSemesterHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const userId                = req.user._id;

    const sem = await getOneSemester(userId, branch, Number(semNumber));
    sendResponse(res, 200, { semester: sem }, "Semester fetched");
  } catch (err) {
    next(err);
  }
}

// ── POST /api/semesters/:branch/:semNumber ────────────────────────────────────
// Save or update a semester with full marks detail

export async function saveSemesterHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const userId                = req.user._id;

    const saved = await saveSemester(userId, {
      ...req.body,
      branch,
      semNumber: Number(semNumber),
    });

    const allSems = await getUserSemesters(userId, branch);
    const cgpa    = calculateCGPA(allSems);

    // Recalculate CGPA and update leaderboard if opted in
    if (req.user.lbOptIn) {
        await upsertLeaderboardEntry({
          userId,
          username: req.user.username,
          branch,
          cgpa,
          semCount: allSems.filter(s => s.sgpa).length,
        });
      }

    sendResponse(
      res, 200,
      { semester: saved, cgpa },
      "Semester saved"
    );
  } catch (err) {
    next(err);
  }
}

// ── POST /api/semesters/:branch/:semNumber/quick ──────────────────────────────
// Save just SGPA directly without individual marks

export async function saveQuickSgpaHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const { sgpa, credits }     = req.body;
    const userId                = req.user._id;

    const saved = await saveQuickSgpa(
      userId,
      branch,
      Number(semNumber),
      sgpa,
      credits
    );

    // Update leaderboard if opted in
    if (req.user.lbOptIn) {
      const allSems = await getUserSemesters(userId, branch);
      const cgpa    = calculateCGPA(allSems);
      if (cgpa) {
        await upsertLeaderboardEntry({
          userId,
          username: req.user.username,
          branch,
          cgpa,
          semCount: allSems.filter(s => s.sgpa).length,
        });
      }
    }

    const allSems = await getUserSemesters(userId, branch);
    const cgpa    = calculateCGPA(allSems);

    sendResponse(
      res, 200,
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
    const userId                = req.user._id;

    const result = await deleteSemester(userId, branch, Number(semNumber));

    sendResponse(res, 200, result, "Semester deleted");
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/semesters/:branch/:semNumber/backlog ─────────────────────────────
// Toggle a subject as backlog

export async function toggleBacklogHandler(req, res, next) {
  try {
    const { branch, semNumber }  = req.params;
    const { subjectCode }        = req.body;
    const userId                 = req.user._id;

    if (!subjectCode) {
      return next(ApiError.badRequest("subjectCode is required"));
    }

    const updated = await toggleBacklog(
      userId,
      branch,
      Number(semNumber),
      subjectCode
    );

    sendResponse(res, 200, { backlogs: updated.backlogs }, "Backlog updated");
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/semesters/:branch/:semNumber/elective ────────────────────────────
// Update elective subject name

export async function updateElectiveHandler(req, res, next) {
  try {
    const { branch, semNumber }   = req.params;
    const { subjectCode, name }   = req.body;
    const userId                  = req.user._id;

    if (!subjectCode || !name) {
      return next(ApiError.badRequest("subjectCode and name are required"));
    }

    const updated = await updateElectiveName(
      userId,
      branch,
      Number(semNumber),
      subjectCode,
      name
    );

    sendResponse(
      res, 200,
      { electiveNames: Object.fromEntries(updated.electiveNames) },
      "Elective name updated"
    );
  } catch (err) {
    next(err);
  }
}

export async function addCustomSubject(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const { name, credits, type } = req.body;
    const userId = req.user._id;

    // Generate a unique code for the custom subject
    const code = `CUSTOM_${Date.now()}`;

    const sem = await SemesterData.findOneAndUpdate(
      { userId, branch, semNumber: Number(semNumber) },
      {
        $push: { customSubjects: { code, name, credits, type } },
        $setOnInsert: { userId, branch, semNumber: Number(semNumber) },
      },
      { upsert: true, new: true }
    );

    sendResponse(res, 200, { customSubjects: sem.customSubjects }, "Subject added");
  } catch (err) { next(err); }
}

export async function removeCustomSubject(req, res, next) {
  try {
    const { branch, semNumber, code } = req.params;
    const userId = req.user._id;

    const sem = await SemesterData.findOneAndUpdate(
      { userId, branch, semNumber: Number(semNumber) },
      { $pull: { customSubjects: { code } } },
      { new: true }
    );

    sendResponse(res, 200, { customSubjects: sem?.customSubjects || [] }, "Subject removed");
  } catch (err) { next(err); }
}

export async function toggleSubjectVisibility(req, res, next) {
  try {
    const { branch, semNumber, code } = req.params;
    const { hidden } = req.body;
    const userId = req.user._id;

    const update = hidden
      ? { $addToSet: { hiddenSubjects: code } }
      : { $pull:     { hiddenSubjects: code } };

    const sem = await SemesterData.findOneAndUpdate(
      { userId, branch, semNumber: Number(semNumber) },
      { ...update, $setOnInsert: { userId, branch, semNumber: Number(semNumber) } },
      { upsert: true, new: true }
    );

    sendResponse(res, 200, { hiddenSubjects: sem.hiddenSubjects || [] }, "Visibility updated");
  } catch (err) { next(err); }
}
