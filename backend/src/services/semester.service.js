import SemesterData from "../models/SemesterData.js";
import ApiError from "../utils/ApiError.js";

// ── Get all semesters for a user + branch ─────────────────────────────────────
export async function getUserSemesters(userId, branch) {
  return await SemesterData.find({ userId, branch })
    .sort({ semNumber: 1 })
    .lean();
}

// ── Get one specific semester ─────────────────────────────────────────────────
export async function getOneSemester(userId, branch, semNumber) {
  const sem = await SemesterData.findOne({ userId, branch, semNumber }).lean();
  if (!sem) {
    throw ApiError.notFound(
      `Semester ${semNumber} not found for branch ${branch}`
    );
  }
  return sem;
}

// ── Save or update a semester ─────────────────────────────────────────────────
export async function saveSemester(userId, semesterData) {
  const {
    branch,
    semNumber,
    marks,
    sgpa,
    credits,
    isPartial,
    mode,
    electiveNames,
    backlogs,
  } = semesterData;

  const saved = await SemesterData.findOneAndUpdate(
    { userId, branch, semNumber },
    {
      $set: {
        marks: marks || [],
        sgpa: sgpa ?? null,
        credits: credits || 0,
        isPartial: isPartial || false,
        mode: mode || "detailed",
        electiveNames: electiveNames || {},
        backlogs: backlogs || [],
        savedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return saved;
}

// ── Save quick SGPA only ──────────────────────────────────────────────────────
export async function saveQuickSgpa(userId, branch, semNumber, sgpa, credits) {
  const saved = await SemesterData.findOneAndUpdate(
    { userId, branch, semNumber },
    {
      $set: {
        sgpa: Number(sgpa),
        credits: Number(credits) || 0,
        isPartial: false,
        mode: "quick",
        savedAt: new Date(),
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return saved;
}

// ── Delete a semester ─────────────────────────────────────────────────────────
export async function deleteSemester(userId, branch, semNumber) {
  const result = await SemesterData.findOneAndDelete({
    userId,
    branch,
    semNumber,
  });

  if (!result) {
    throw ApiError.notFound(
      `Semester ${semNumber} not found for branch ${branch}`
    );
  }

  return { deleted: true, semNumber, branch };
}

// ── Toggle backlog for a subject (Atomic) ─────────────────────────────────────
export async function toggleBacklog(userId, branch, semNumber, subjectCode) {
  const sem = await SemesterData.findOne({ userId, branch, semNumber });

  if (!sem) {
    // Create new entry directly if it doesn't exist
    return await SemesterData.create({
      userId,
      branch,
      semNumber,
      backlogs: [subjectCode],
      marks: [],
      credits: 0,
    });
  }

  const hasBacklog = sem.backlogs.includes(subjectCode);
  const update = hasBacklog
    ? { $pull: { backlogs: subjectCode } }
    : { $addToSet: { backlogs: subjectCode } };

  const updatedSem = await SemesterData.findOneAndUpdate(
    { userId, branch, semNumber },
    update,
    { new: true }
  );

  return updatedSem;
}

// ── Update elective name for a subject ───────────────────────────────────────
export async function updateElectiveName(
  userId,
  branch,
  semNumber,
  subjectCode,
  name
) {
  // Sanitize dot notation keys to avoid path traversal issues in MongoDB
  const safeCode = subjectCode.replace(/\./g, "_");

  const sem = await SemesterData.findOneAndUpdate(
    { userId, branch, semNumber },
    { $set: { [`electiveNames.${safeCode}`]: name } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return sem;
}

// ── Calculate CGPA from saved semesters ───────────────────────────────────────
export function calculateCGPA(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) return null;

  let totalCredits = 0;
  let weightedSum = 0;

  for (const sem of semesters) {
    const sgpaVal = parseFloat(sem.sgpa);
    const creditsVal = parseFloat(sem.credits);

    if (isNaN(sgpaVal) || isNaN(creditsVal) || creditsVal <= 0) continue;

    totalCredits += creditsVal;
    weightedSum += sgpaVal * creditsVal;
  }

  if (totalCredits === 0) return null;

  return Number((weightedSum / totalCredits).toFixed(2));
}