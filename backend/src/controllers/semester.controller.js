import {
  getUserSemesters, saveSemester, saveQuickSgpa,
  deleteSemester, toggleBacklog, updateElectiveName, calculateCGPA,
} from "../services/semester.service.js";
import { upsertLeaderboardEntry, removeLeaderboardEntry } from "../services/leaderboard.service.js";
import { sendResponse } from "../utils/ApiResponse.js";
import ApiError        from "../utils/ApiError.js";
import SemesterData    from "../models/SemesterData.js";
import User            from "../models/User.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseSem = (semNumber) => {
  const parsed = parseInt(semNumber, 10);
  if (isNaN(parsed) || parsed < 1) throw ApiError.badRequest("Invalid semester number");
  return parsed;
};

const normBranch = (branch) => (branch ? branch.toUpperCase().trim() : "");

// Ensure user has active opt-in date set on their first valid semester save
async function ensureLeaderboardOptIn(req, userId, validSemsCount) {
  if (validSemsCount >= 1 && (!req.user.lbOptInDate || !req.user.lbOptIn)) {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          lbOptIn: true,
          lbOptInDate: req.user.lbOptInDate || new Date(),
        },
      },
      { new: true }
    );
    req.user.lbOptIn = true;
    req.user.lbOptInDate = updatedUser.lbOptInDate;
  }
}

async function syncLeaderboard(req, userId, branch, allSems) {
  const cgpa     = calculateCGPA(allSems) ?? 0;
  const semCount = allSems.filter(s => s.sgpa != null && s.sgpa > 0).length;

  if (semCount === 0) {
    // If no valid semesters remain, remove user from leaderboard if function exists
    if (typeof removeLeaderboardEntry === "function") {
      await removeLeaderboardEntry(userId);
    }
    return;
  }

  await upsertLeaderboardEntry({
    userId,
    username: req.user.username || "Anonymous",
    branch: req.user.branch || branch,
    faculty:  req.user.faculty  || null,
    cgpa,
    semCount,
  });
}

// ── GET /api/semesters/:branch ────────────────────────────────────────────────
export async function getAllSemesters(req, res, next) {
  try {
    const branch    = normBranch(req.params.branch);
    const userId    = req.user._id.toString();
    const semesters = await getUserSemesters(userId, branch);
    const cgpa      = calculateCGPA(semesters) ?? 0;

    await syncLeaderboard(req, userId, branch, semesters || []);

    sendResponse(res, 200, { semesters, cgpa }, "Semesters fetched");
  } catch (err) { next(err); }
}

// ── POST /api/semesters/:branch/:semNumber ────────────────────────────────────
export async function saveSemesterHandler(req, res, next) {
  try {
    const branch  = normBranch(req.params.branch);
    const semNum  = parseSem(req.params.semNumber);
    const userId  = req.user._id.toString();

    const saved   = await saveSemester(userId, { ...req.body, branch, semNumber: semNum });
    const allSems = await getUserSemesters(userId, branch) || [];
    const cgpa    = calculateCGPA(allSems) ?? 0;

    const validSemsCount = allSems.filter(s => s.sgpa != null && s.sgpa > 0).length;
    await ensureLeaderboardOptIn(req, userId, validSemsCount);
    await syncLeaderboard(req, userId, branch, allSems);

    sendResponse(res, 200, { semester: saved, cgpa }, "Semester saved");
  } catch (err) { next(err); }
}

// ── POST /api/semesters/:branch/:semNumber/quick ──────────────────────────────
export async function saveQuickSgpaHandler(req, res, next) {
  try {
    const branch  = normBranch(req.params.branch);
    const semNum  = parseSem(req.params.semNumber);
    const userId  = req.user._id.toString();

    const saved   = await saveQuickSgpa(userId, branch, semNum, req.body.sgpa, req.body.credits);
    const allSems = await getUserSemesters(userId, branch) || [];
    const cgpa    = calculateCGPA(allSems) ?? 0;

    const validSemsCount = allSems.filter(s => s.sgpa != null && s.sgpa > 0).length;
    await ensureLeaderboardOptIn(req, userId, validSemsCount);
    await syncLeaderboard(req, userId, branch, allSems);

    sendResponse(res, 200, { semester: saved, cgpa }, "SGPA saved");
  } catch (err) { next(err); }
}

// ── DELETE /api/semesters/:branch/:semNumber ──────────────────────────────────
export async function deleteSemesterHandler(req, res, next) {
  try {
    const branch  = normBranch(req.params.branch);
    const semNum  = parseSem(req.params.semNumber);
    const userId  = req.user._id.toString();

    const result  = await deleteSemester(userId, branch, semNum);
    const allSems = await getUserSemesters(userId, branch) || [];
    const cgpa    = calculateCGPA(allSems) ?? 0;
    await syncLeaderboard(req, userId, branch, allSems);

    sendResponse(res, 200, { ...result, cgpa }, "Semester deleted");
  } catch (err) { next(err); }
}

// ── PUT /api/semesters/:branch/:semNumber/backlog ─────────────────────────────
export async function toggleBacklogHandler(req, res, next) {
  try {
    const branch  = normBranch(req.params.branch);
    const semNum  = parseSem(req.params.semNumber);
    const userId  = req.user._id.toString();
    const updated = await toggleBacklog(userId, branch, semNum, req.body.subjectCode);
    sendResponse(res, 200, { backlogs: updated.backlogs }, "Backlog updated");
  } catch (err) { next(err); }
}

// ── PUT /api/semesters/:branch/:semNumber/elective ────────────────────────────
export async function updateElectiveHandler(req, res, next) {
  try {
    const branch  = normBranch(req.params.branch);
    const semNum  = parseSem(req.params.semNumber);
    const { subjectCode, name } = req.body;
    const userId  = req.user._id.toString();
    const updated = await updateElectiveName(userId, branch, semNum, subjectCode, name);
    sendResponse(res, 200, { electiveNames: Object.fromEntries(updated.electiveNames || new Map()) }, "Elective name updated");
  } catch (err) { next(err); }
}

// ── POST /api/semesters/:branch/:semNumber/custom-subjects ────────────────────
export async function addCustomSubject(req, res, next) {
  try {
    const branch  = normBranch(req.params.branch);
    const semNum  = parseSem(req.params.semNumber);
    const { name, credits, type } = req.body;
    const userId  = req.user._id.toString();
    const code    = `CUSTOM_${Date.now()}`;

    const sem = await SemesterData.findOneAndUpdate(
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
    const branch = normBranch(req.params.branch);
    const semNum = parseSem(req.params.semNumber);
    const { code } = req.params;
    const userId = req.user._id.toString();

    const sem    = await SemesterData.findOneAndUpdate(
      { userId, branch, semNumber: semNum },
      { $pull: { customSubjects: { code } } },
      { new: true }
    );
    sendResponse(res, 200, { customSubjects: sem?.customSubjects || [] }, "Subject removed");
  } catch (err) { next(err); }
}

// ── PATCH /api/semesters/:branch/:semNumber/subjects/:code/visibility ─────────
export async function toggleSubjectVisibility(req, res, next) {
  try {
    const branch = normBranch(req.params.branch);
    const semNum = parseSem(req.params.semNumber);
    const { code }   = req.params;
    const { hidden } = req.body;
    const userId     = req.user._id.toString();

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