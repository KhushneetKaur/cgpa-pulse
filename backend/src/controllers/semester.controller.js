import {
  getUserSemesters,
  saveSemester,
  saveQuickSgpa,
  deleteSemester,
  toggleBacklog,
  updateElectiveName,
  calculateCGPA,
} from "../services/semester.service.js";
import { upsertLeaderboardEntry } from "../services/leaderboard.service.js";
import { sendResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import SemesterData from "../models/SemesterData.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseSem = (semNumber) => {
  const parsed = parseInt(semNumber, 10);
  if (isNaN(parsed) || parsed < 1) throw ApiError.badRequest("Invalid semester number");
  return parsed;
};

// Sync leaderboard if user is opted in — called after any CGPA-affecting change
async function syncLeaderboard(req, userId, branch, allSems) {
  if (!req.user?.lbOptIn) return;
  const cgpa     = calculateCGPA(allSems) ?? 0;
  const semCount = allSems.filter(s => s.sgpa).length;
  await upsertLeaderboardEntry({
    userId,
    username: req.user.username || req.user.name || "Anonymous",
    branch,
    cgpa,
    semCount,
  });
  return cgpa;
}

// ── GET /api/semesters/:branch ────────────────────────────────────────────────
export async function getAllSemesters(req, res, next) {
  try {
    const { branch } = req.params;
    const userId     = req.user._id.toString();
    const semesters  = await getUserSemesters(userId, branch);
    const cgpa       = calculateCGPA(semesters);
    sendResponse(res, 200, { semesters, cgpa }, "Semesters fetched");
  } catch (err) { next(err); }
}

// ── POST /api/semesters/:branch/:semNumber ────────────────────────────────────
export async function saveSemesterHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const userId    = req.user._id.toString();
    const semNum    = parseSem(semNumber);
    const normBranch = branch.toUpperCase().trim();

    const saved   = await saveSemester(userId, { ...req.body, branch: normBranch, semNumber: semNum });
    const allSems = await getUserSemesters(userId, normBranch) || [];
    const cgpa    = await syncLeaderboard(req, userId, normBranch, allSems) ?? calculateCGPA(allSems) ?? 0;

    sendResponse(res, 200, { semester: saved, cgpa }, "Semester saved");
  } catch (err) { next(err); }
}

// ── POST /api/semesters/:branch/:semNumber/quick ──────────────────────────────
export async function saveQuickSgpaHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const { sgpa, credits }     = req.body;
    const userId = req.user._id.toString();
    const semNum = parseSem(semNumber);

    const saved   = await saveQuickSgpa(userId, branch, semNum, sgpa, credits);
    const allSems = await getUserSemesters(userId, branch) || [];
    const cgpa    = await syncLeaderboard(req, userId, branch, allSems) ?? calculateCGPA(allSems) ?? 0;

    sendResponse(res, 200, { semester: saved, cgpa }, "SGPA saved");
  } catch (err) { next(err); }
}

// ── DELETE /api/semesters/:branch/:semNumber ──────────────────────────────────
export async function deleteSemesterHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const userId = req.user._id.toString();
    const semNum = parseSem(semNumber);

    const result  = await deleteSemester(userId, branch, semNum);
    const allSems = await getUserSemesters(userId, branch) || [];
    const cgpa    = await syncLeaderboard(req, userId, branch, allSems) ?? calculateCGPA(allSems) ?? 0;

    sendResponse(res, 200, { ...result, cgpa }, "Semester deleted");
  } catch (err) { next(err); }
}

// ── PUT /api/semesters/:branch/:semNumber/backlog ─────────────────────────────
export async function toggleBacklogHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const { subjectCode }       = req.body;
    const userId = req.user._id.toString();

    if (!subjectCode) throw ApiError.badRequest("subjectCode is required");

    const updated = await toggleBacklog(userId, branch, parseSem(semNumber), subjectCode);
    sendResponse(res, 200, { backlogs: updated.backlogs }, "Backlog updated");
  } catch (err) { next(err); }
}

// ── PUT /api/semesters/:branch/:semNumber/elective ────────────────────────────
export async function updateElectiveHandler(req, res, next) {
  try {
    const { branch, semNumber } = req.params;
    const { subjectCode, name } = req.body;
    const userId = req.user._id.toString();

    if (!subjectCode || !name) throw ApiError.badRequest("subjectCode and name are required");

    const updated = await updateElectiveName(userId, branch, parseSem(semNumber), subjectCode, name);
    sendResponse(res, 200, { electiveNames: Object.fromEntries(updated.electiveNames || new Map()) }, "Elective name updated");
  } catch (err) { next(err); }
}

// ── POST /api/semesters/:branch/:semNumber/custom-subjects ────────────────────
export async function addCustomSubject(req, res, next) {
  try {
    const { branch, semNumber }  = req.params;
    const { name, credits, type } = req.body;
    const userId = req.user._id.toString();
    const semNum = parseSem(semNumber); 

    if (!name || !credits) throw ApiError.badRequest("Name and credits are required");

    const code = `CUSTOM_${Date.now()}`;
    const sem  = await SemesterData.findOneAndUpdate(
      { userId, branch, semNumber: semNum },
      {
        $push:        { customSubjects: { code, name, credits: Number(credits), type } },
        $setOnInsert: { userId, branch, semNumber: semNum },
      },
      { upsert: true, new: true }
    );

    sendResponse(res, 200, { customSubjects: sem.customSubjects }, "Subject added");
  } catch (err) { next(err); }
}

// ── DELETE /api/semesters/:branch/:semNumber/custom-subjects/:code ────────────
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
  } catch (err) { next(err); }
}

// ── PATCH /api/semesters/:branch/:semNumber/subjects/:code/visibility ─────────
export async function toggleSubjectVisibility(req, res, next) {
  try {
    const { branch, semNumber, code } = req.params;
    const { hidden }  = req.body;
    const userId      = req.user._id.toString();
    const semNum      = parseSem(semNumber);

    const update = hidden
      ? { $addToSet: { hiddenSubjects: code } }
      : { $pull:     { hiddenSubjects: code } };

    const sem = await SemesterData.findOneAndUpdate(
      { userId, branch, semNumber: semNum },
      { ...update, $setOnInsert: { userId, branch, semNumber: semNum } },
      { upsert: true, new: true }
    );

    sendResponse(res, 200, { hiddenSubjects: sem?.hiddenSubjects || [] }, "Visibility updated");
  } catch (err) { next(err); }
}