import SemesterData from "../models/SemesterData.js";
import ApiError     from "../utils/ApiError.js";

// ── Get all semesters for a user + branch ─────────────────────────────────────

export async function getUserSemesters(userId, branch) {
  const semesters = await SemesterData.find({ userId, branch })
    .sort({ semNumber: 1 })
    .lean();   // .lean() returns plain JS objects — faster for read-only

  return semesters;
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
// Uses findOneAndUpdate with upsert: true
// — creates if doesn't exist, updates if it does

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
    // Filter — find existing doc for this user + branch + sem
    { userId, branch, semNumber },

    // Update — $set replaces only the provided fields
    {
      $set: {
        marks:        marks        || [],
        sgpa:         sgpa         ?? null,
        credits:      credits      || 0,
        isPartial:    isPartial    || false,
        mode:         mode         || "detailed",
        electiveNames: electiveNames || {},
        backlogs:     backlogs     || [],
        savedAt:      new Date(),
      },
    },

    {
      new:     true,    // return updated doc not original
      upsert:  true,    // create if not found
      runValidators: true,
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
        sgpa,
        credits,
        isPartial: false,
        mode:      "quick",
        savedAt:   new Date(),
      },
    },
    { new: true, upsert: true, runValidators: true }
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

// ── Toggle backlog for a subject ──────────────────────────────────────────────

export async function toggleBacklog(userId, branch, semNumber, subjectCode) {
  let sem = await SemesterData.findOne({ userId, branch, semNumber });

  if (!sem) {
    // Semester not saved yet — create a minimal document just to hold the backlog
    sem = await SemesterData.create({
      userId,
      branch,
      semNumber,
      backlogs: [subjectCode],
      marks:    [],
      credits:  0,
    });
    return sem;
  }

  const hasBacklog = sem.backlogs.includes(subjectCode);
  sem.backlogs = hasBacklog
    ? sem.backlogs.filter(c => c !== subjectCode)
    : [...sem.backlogs, subjectCode];

  await sem.save();
  return sem;
}

// ── Update elective name for a subject ───────────────────────────────────────

export async function updateElectiveName(
  userId, branch, semNumber, subjectCode, name
) {
  // Use $set with dot notation to update just one key in the Map
  // upsert: true creates the document if it doesn't exist yet
  const sem = await SemesterData.findOneAndUpdate(
    { userId, branch, semNumber },
    { $set: { [`electiveNames.${subjectCode}`]: name } },
    { new: true, upsert: true }
  );
  return sem;
}

// ── Calculate CGPA from saved semesters ───────────────────────────────────────
// Called after saving a semester to return updated CGPA

export function calculateCGPA(semesters) {
  let totalCredits  = 0;
  let weightedSum   = 0;

  for (const sem of semesters) {
    if (sem.sgpa == null || !sem.credits) continue;
    totalCredits += sem.credits;
    weightedSum  += parseFloat(sem.sgpa) * sem.credits;
  }

  if (totalCredits === 0) return null;

  return parseFloat((weightedSum / totalCredits).toFixed(2));
}