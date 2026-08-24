import SemesterData from "../models/SemesterData.js";
import User from "../models/User.js"; // Needed to get user metadata for leaderboard
import ApiError from "../utils/ApiError.js";
import { upsertLeaderboardEntry, removeLeaderboardEntry } from "./leaderboard.service.js";

// ── Helper to recalculate & sync user leaderboard entry ─────────────────────
async function syncUserLeaderboard(userId, branch) {
  try {
    // 1. Fetch user to get username & faculty
    const user = await User.findById(userId).select("username faculty name").lean();
    if (!user) return;

    // 2. Fetch all saved semesters for this user + branch
    const allSemesters = await SemesterData.find({ userId, branch }).lean();

    // 3. Calculate CGPA & count valid semesters
    const validSemesters = allSemesters.filter(
      (s) => s.sgpa != null && !isNaN(Number(s.sgpa)) && Number(s.credits) > 0
    );

    const semCount = validSemesters.length;

    // If user has no remaining saved semesters, remove them from leaderboard
    if (semCount === 0) {
      await removeLeaderboardEntry(userId);
      return;
    }

    const cgpa = calculateCGPA(validSemesters);

    // 4. Upsert entry to Leaderboard
    if (cgpa != null) {
      await upsertLeaderboardEntry({
        userId,
        username: user.username || user.name || "Student",
        branch,
        faculty: user.faculty || null,
        cgpa,
        semCount,
      });
    }
  } catch (err) {
    console.error(`Leaderboard sync failed for user ${userId}:`, err);
  }
}

// ── Get all semesters for a user + branch ─────────────────────────────────────
export async function getUserSemesters(userId, branch) {
  return await SemesterData.find({ userId, branch })
    .sort({ semNumber: 1 })
    .lean();
}

// ── Save or update a semester ─────────────────────────────────────────────────
export async function saveSemester(userId, semesterData) {
  const {
    branch, semNumber, marks, sgpa,
    credits, isPartial, mode, electiveNames, backlogs,
  } = semesterData;

  const savedSem = await SemesterData.findOneAndUpdate(
    { userId, branch, semNumber },
    {
      $set: {
        marks:         marks         || [],
        sgpa:          sgpa          ?? null,
        credits:       credits       || 0,
        isPartial:     isPartial     || false,
        mode:          mode          || "detailed",
        electiveNames: electiveNames || {},
        backlogs:      backlogs      || [],
        savedAt:       new Date(),
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Auto-sync to Leaderboard after manual save
  await syncUserLeaderboard(userId, branch);

  return savedSem;
}

// ── Save quick SGPA only ──────────────────────────────────────────────────────
export async function saveQuickSgpa(userId, branch, semNumber, sgpa, credits) {
  const savedSem = await SemesterData.findOneAndUpdate(
    { userId, branch, semNumber },
    {
      $set: {
        sgpa:      Number(sgpa),
        credits:   Number(credits) || 0,
        isPartial: false,
        mode:      "quick",
        savedAt:   new Date(),
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Auto-sync to Leaderboard after quick save
  await syncUserLeaderboard(userId, branch);

  return savedSem;
}

// ── Delete a semester ─────────────────────────────────────────────────────────
export async function deleteSemester(userId, branch, semNumber) {
  const result = await SemesterData.findOneAndDelete({ userId, branch, semNumber });
  if (!result) throw ApiError.notFound(`Semester ${semNumber} not found for branch ${branch}`);

  // Auto-sync or clear Leaderboard entry after deletion
  await syncUserLeaderboard(userId, branch);

  return { deleted: true, semNumber, branch };
}

// ── Toggle backlog for a subject ────────────────────
export async function toggleBacklog(userId, branch, semNumber, subjectCode) {
  const sem = await SemesterData.findOne(
    { userId, branch, semNumber },
    { backlogs: 1 }   
  ).lean();

  const hasBacklog = sem?.backlogs?.includes(subjectCode) ?? false;

  return await SemesterData.findOneAndUpdate(
    { userId, branch, semNumber },
    hasBacklog
      ? { $pull:     { backlogs: subjectCode } }
      : { $addToSet: { backlogs: subjectCode } },
    {
      new:                true,
      upsert:             true,
      setDefaultsOnInsert: true,
    }
  );
}

// ── Update elective name for a subject ────────────────────────────────────────
export async function updateElectiveName(userId, branch, semNumber, subjectCode, name) {
  const safeCode = subjectCode.replace(/\./g, "_");
  return await SemesterData.findOneAndUpdate(
    { userId, branch, semNumber },
    { $set: { [`electiveNames.${safeCode}`]: name } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

// ── Calculate CGPA from saved semesters ───────────────────────────────────────
export function calculateCGPA(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) return null;

  let totalCredits = 0;
  let weightedSum  = 0;

  for (const sem of semesters) {
    const sgpa    = parseFloat(sem.sgpa);
    const credits = parseFloat(sem.credits);
    if (isNaN(sgpa) || isNaN(credits) || credits <= 0) continue;
    totalCredits += credits;
    weightedSum  += sgpa * credits;
  }

  if (totalCredits === 0) return null;
  return Number((weightedSum / totalCredits).toFixed(2));
}