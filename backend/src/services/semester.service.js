import SemesterData from "../models/SemesterData.js";
import ApiError from "../utils/ApiError.js";

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

  return await SemesterData.findOneAndUpdate(
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
}

// ── Save quick SGPA only ──────────────────────────────────────────────────────
export async function saveQuickSgpa(userId, branch, semNumber, sgpa, credits) {
  return await SemesterData.findOneAndUpdate(
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
}

// ── Delete a semester ─────────────────────────────────────────────────────────
export async function deleteSemester(userId, branch, semNumber) {
  const result = await SemesterData.findOneAndDelete({ userId, branch, semNumber });
  if (!result) throw ApiError.notFound(`Semester ${semNumber} not found for branch ${branch}`);
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