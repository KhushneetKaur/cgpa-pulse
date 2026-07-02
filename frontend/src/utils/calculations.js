import { GRADE_TABLE, getGrade, getMaxMarks } from "../data/gradeTable";
import { BRANCHES } from "../data/branches";

// ─── Subject total ────────────────────────────────────────────────────────────
// Returns combined internal + external marks, or null if either is missing
export function getSubjectTotal(entry) {
  if (!entry) return null;
  const i = entry.int !== "" && entry.int !== undefined ? Number(entry.int) : null;
  const e = entry.ext !== "" && entry.ext !== undefined ? Number(entry.ext) : null;
  return i !== null && e !== null ? i + e : null;
}

// ─── SGPA ─────────────────────────────────────────────────────────────────────
// Always divides by FULL semester credits, not just filled subjects.
// Unfilled subjects contribute 0 grade points but their credits still count
// in the denominator — so partial entry shows a conservative estimate.
export function calcSGPA(subjects, marksMap) {
  const totalSemCredits = subjects.reduce((sum, sub) => sum + sub.credits, 0);
  let weightedSum = 0;
  let filledCount = 0;

  for (const sub of subjects) {
    const total = getSubjectTotal(marksMap[sub.code]);
    const grade = getGrade(total);
    if (grade) {
      weightedSum += grade.points * sub.credits;
      filledCount++;
    }
    // unfilled: adds 0 to numerator, but credits still go into denominator
  }

  if (filledCount === 0) return null;

  return {
    sgpa: (weightedSum / totalSemCredits).toFixed(2),
    credits: totalSemCredits,
    isPartial: filledCount < subjects.length,
    filled: filledCount,
    total: subjects.length,
  };
}

// ─── CGPA ─────────────────────────────────────────────────────────────────────
// Credit-weighted average across all saved semesters.
// NOTE: This is intentionally different from a simple average of SGPAs.
// Later semesters have more credits so they carry proportionally more weight.
export function calcCGPA(semesterHistoryArray) {
  let totalCredits = 0;
  let weightedSum = 0;

  for (const sem of semesterHistoryArray) {
    if (!sem.sgpa || !sem.credits) continue;
    totalCredits += sem.credits;
    weightedSum += parseFloat(sem.sgpa) * sem.credits;
  }

  return totalCredits > 0
    ? (weightedSum / totalCredits).toFixed(2)
    : null;
}

// ─── Target CGPA ──────────────────────────────────────────────────────────────
// Given current saved semesters and a target CGPA, calculates the average
// SGPA needed in ALL remaining semesters to hit that target.
//
// Formula:
//   target = (doneWeighted + needed * futureCr) / (doneCr + futureCr)
//   solving for needed:
//   needed = (target * (doneCr + futureCr) - doneWeighted) / futureCr
export function calcTarget(branch, semKeys, branchHist, targetCGPA, semCreditsOverride = {}) {
  const t = parseFloat(targetCGPA);

  if (isNaN(t) || t < 0 || t > 10) {
    return { error: "Enter a valid target CGPA between 0.00 and 10.00." };
  }

  const doneSemsList = semKeys.filter(s => branchHist[s]?.sgpa);

  if (!doneSemsList.length) {
    return { error: "Save at least one semester first so we know your current standing." };
  }

  const allSaved = semKeys.every(s => branchHist[s]?.sgpa);
  if (allSaved) {
    return { error: "All 8 semesters are saved. Your final CGPA is already calculated." };
  }

  // Credits and weighted sum for completed semesters
  const doneCr = doneSemsList.reduce(
    (a, s) => a + (branchHist[s].credits || 0), 0
  );
  const doneWeighted = doneSemsList.reduce(
    (a, s) => a + parseFloat(branchHist[s].sgpa) * (branchHist[s].credits || 0), 0
  );
  const currentCGPA = doneCr ? doneWeighted / doneCr : 0;

  // Remaining semesters with their credit counts
  const remainSemsList = semKeys.filter(s => !branchHist[s]?.sgpa);
  const remainSemDetails = remainSemsList.map(s => ({
  sem: s,
  name: BRANCHES[branch].semesters[s].name,
  credits: semCreditsOverride[s] ??
    BRANCHES[branch].semesters[s].subjects.reduce(
      (x, sub) => x + sub.credits, 0
    ),
}));
  const futureCr = remainSemDetails.reduce((a, d) => a + d.credits, 0);

  // Already achieved?
  if (currentCGPA >= t) {
    return {
      alreadyAchieved: true,
      currentCGPA: currentCGPA.toFixed(2),
      target: t,
      futureCr,
      remainSems: remainSemsList.length,
    };
  }

  // Required SGPA per remaining semester on average
  const needed = ((t * (doneCr + futureCr)) - doneWeighted) / futureCr;

  // Max reachable CGPA even if student scores 10.0 in everything remaining
  const maxReachable = ((10 * futureCr) + doneWeighted) / (doneCr + futureCr);

  return {
    needed: Math.min(needed, 10).toFixed(2),
    achievable: needed <= 10,
    futureCr,
    doneCr,
    remainSems: remainSemsList.length,
    remainSemDetails,
    currentCGPA: currentCGPA.toFixed(2),
    target: t,
    maxReachable: maxReachable.toFixed(2),
  };
}

// ─── Grade predictor ──────────────────────────────────────────────────────────
// For a single subject: given internal marks and desired SGPA for the semester,
// returns how many external marks are needed to hit each grade,
// and which grade aligns with the desired SGPA.
//
// The "target grade highlight" logic:
//   desiredSGPA = 8.0 → we highlight B+ (8 pts), NOT A+ (10 pts)
//   We find the LOWEST grade whose points >= desiredSGPA so we don't
//   over-ask the student. e.g. if you want 8.0 SGPA, B+ is enough —
//   no need to show A+ as the target.
export function getPredictorBreakdown(subjects, predInt, desiredSGPA) {
  const totalSemCr = subjects.reduce((a, sub) => a + sub.credits, 0);
  const desiredNum = parseFloat(desiredSGPA || 0);

  // Find minimum grade that satisfies desiredSGPA per subject on average
  // (simplified: find grade whose points >= desiredSGPA)
  const targetGrade = desiredNum > 0
    ? [...GRADE_TABLE].reverse().find(g => g.points >= desiredNum) || GRADE_TABLE[0]
    : null;

  const subResults = subjects.map(sub => {
    const mx = getMaxMarks(sub.type);
    const intRaw = predInt[sub.code];
    if (intRaw === undefined || intRaw === "") {
      return { sub, status: "no_internal", mx };
    }

    const intV = Number(intRaw);

    // For every grade, calculate minimum external marks needed
    const gradeNeeds = GRADE_TABLE.map(g => {
      const minExt = Math.max(0, g.min - intV);
      return {
        ...g,
        minExt,
        achievable: g.grade === "F" || minExt <= mx.ext,
      };
    });

    const bestAchievable = gradeNeeds.find(g => g.achievable && g.grade !== "F");

    return {
      sub,
      intV,
      gradeNeeds,
      bestAchievable,
      mx,
      status: "has_internal",
      // highlight the grade that matches desired SGPA, not always A+
      highlightGrade: targetGrade?.grade || null,
    };
  });

  // Best-case SGPA (student scores max in all externals)
  let bestCaseWeighted = 0;
  let worstCaseWeighted = 0;
  let anyFilled = false;

  for (const sub of subjects) {
    const mx = getMaxMarks(sub.type);
    const intRaw = predInt[sub.code];
    if (intRaw !== undefined && intRaw !== "") {
      const intV = Number(intRaw);
      const bestTotal = Math.min(intV + mx.ext, 100);
      const worstTotal = intV; // 0 in external
      const bestGrade = getGrade(bestTotal);
      const worstGrade = getGrade(worstTotal);
      bestCaseWeighted += (bestGrade?.points || 0) * sub.credits;
      worstCaseWeighted += (worstGrade?.points || 0) * sub.credits;
      anyFilled = true;
    }
  }

  const bestCaseSGPA = anyFilled
    ? (bestCaseWeighted / totalSemCr).toFixed(2)
    : null;
  const worstCaseSGPA = anyFilled
    ? (worstCaseWeighted / totalSemCr).toFixed(2)
    : null;

  return {
    subResults,
    totalSemCr,
    bestCaseSGPA,
    worstCaseSGPA,
    targetGrade,
    desiredNum,
  };
}

// ─── Percentage conversion ────────────────────────────────────────────────────
// MRSPTU formula: Percentage = CGPA × 10
export function cgpaToPercentage(cgpa) {
  if (!cgpa) return null;
  return (parseFloat(cgpa) * 10).toFixed(1);
}

// ─── Performance label ────────────────────────────────────────────────────────
export function getPerformanceLabel(cgpa) {
  const n = parseFloat(cgpa);
  if (n >= 9)   return { label: "🏆 Outstanding",      color: "ok"       };
  if (n >= 8)   return { label: "⭐ Excellent",         color: "ok"       };
  if (n >= 7)   return { label: "👍 Very Good",         color: "accentTxt"};
  if (n >= 6)   return { label: "✅ Good",              color: "accentTxt"};
  if (n >= 5)   return { label: "📘 Average",           color: "warn"     };
  return              { label: "⚠ Needs Improvement", color: "bad"      };
}