import { ENGINEERING_GRADES, PHARMACY_GRADES, getGrade, getMaxMarks } from "../data/gradeTable";
import { BRANCHES }          from "../data/branches";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";

// ── Get branch data from either faculty ───────────────────────────────────────
function getBranchData(branch) {
  return BRANCHES[branch] || PHARMACY_BRANCHES[branch] || null;
}

// ── Subject total ─────────────────────────────────────────────────────────────
export function getSubjectTotal(entry) {
  if (!entry) return null;
  const i = entry.int !== "" && entry.int !== undefined ? Number(entry.int) : null;
  const e = entry.ext !== "" && entry.ext !== undefined ? Number(entry.ext) : null;
  return i !== null && e !== null ? i + e : null;
}

// ── SGPA — scheme-aware ───────────────────────────────────────────────────────
// scheme: "engineering" | "pharmacy" — drives grade boundary table used
export function calcSGPA(subjects, marksMap, scheme = "engineering") {
  const totalSemCredits = subjects.reduce((sum, sub) => sum + sub.credits, 0);
  let weightedSum = 0;
  let filledCount = 0;

  for (const sub of subjects) {
    const mx       = getMaxMarks(sub.type, scheme);
    const maxTotal = mx.total || (mx.int + mx.ext) || 100; // pharmacy subjects have different totals
    const total    = getSubjectTotal(marksMap[sub.code]);
    const grade    = getGrade(total, scheme, maxTotal);
    if (grade) {
      weightedSum += grade.points * sub.credits;
      filledCount++;
    }
  }

  if (filledCount === 0) return null;
  return {
    sgpa:      (weightedSum / totalSemCredits).toFixed(2),
    credits:   totalSemCredits,
    isPartial: filledCount < subjects.length,
    filled:    filledCount,
    total:     subjects.length,
  };
}

// ── CGPA ──────────────────────────────────────────────────────────────────────
export function calcCGPA(semesterHistoryArray) {
  let totalCredits = 0;
  let weightedSum  = 0;

  for (const sem of semesterHistoryArray) {
    if (!sem.sgpa || !sem.credits) continue;
    totalCredits += sem.credits;
    weightedSum  += parseFloat(sem.sgpa) * sem.credits;
  }

  return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : null;
}

// ── Target CGPA — works for both engineering and pharmacy ─────────────────────
export function calcTarget(branch, semKeys, branchHist, targetCGPA, semCreditsOverride = {}) {
  const t = parseFloat(targetCGPA);

  if (isNaN(t) || t < 0 || t > 10)
    return { error: "Enter a valid target CGPA between 0.00 and 10.00." };

  const doneSemsList = semKeys.filter(s => branchHist[s]?.sgpa);

  if (!doneSemsList.length)
    return { error: "Save at least one semester first so we know your current standing." };

  // Works for both faculties — getBranchData checks both BRANCHES and PHARMACY_BRANCHES
  const branchData = getBranchData(branch);
  if (!branchData)
    return { error: "Invalid branch selected. Please double check configuration." };

  const totalSems = semKeys.length;
  const allSaved  = semKeys.every(s => branchHist[s]?.sgpa);
  if (allSaved) {
    // Dynamic label — "years" for Pharm.D, "semesters" for everything else
    const unit = branchData.semLabel === "Year" ? "years" : "semesters";
    return { error: `All ${totalSems} ${unit} are saved. Your final CGPA is already calculated.` };
  }

  const doneCr = doneSemsList.reduce((a, s) => a + (branchHist[s].credits || 0), 0);
  const doneWeighted = doneSemsList.reduce(
    (a, s) => a + parseFloat(branchHist[s].sgpa) * (branchHist[s].credits || 0), 0
  );
  const currentCGPA = doneCr ? doneWeighted / doneCr : 0;

  const remainSemsList    = semKeys.filter(s => !branchHist[s]?.sgpa);
  const unit              = branchData.semLabel || "Sem";

  const remainSemDetails = remainSemsList.map(s => {
    const semConfig      = branchData.semesters?.[s];
    const defaultCredits = semConfig?.subjects?.reduce((x, sub) => x + sub.credits, 0) || 0;
    return {
      sem:     s,
      name:    semConfig?.label || `${unit} ${s}`,
      credits: semCreditsOverride[s] ?? defaultCredits,
    };
  });

  const futureCr = remainSemDetails.reduce((a, d) => a + d.credits, 0);

  if (currentCGPA >= t) {
    return {
      alreadyAchieved: true,
      currentCGPA:     currentCGPA.toFixed(2),
      target:          t,
      futureCr,
      remainSems:      remainSemsList.length,
    };
  }

  const needed      = ((t * (doneCr + futureCr)) - doneWeighted) / futureCr;
  const maxReachable = ((10 * futureCr) + doneWeighted) / (doneCr + futureCr);

  return {
    needed:          Math.min(needed, 10).toFixed(2),
    achievable:      needed <= 10,
    futureCr,
    doneCr,
    remainSems:      remainSemsList.length,
    remainSemDetails,
    currentCGPA:     currentCGPA.toFixed(2),
    target:          t,
    maxReachable:    maxReachable.toFixed(2),
  };
}

// ── Grade predictor — scheme-aware ────────────────────────────────────────────
export function getPredictorBreakdown(subjects, predInt, desiredSGPA, scheme = "engineering") {
  const totalSemCr = subjects.reduce((a, sub) => a + sub.credits, 0);
  const desiredNum = parseFloat(desiredSGPA || 0);

  // Use correct grade table for scheme
  const gradeTable = scheme === "pharmacy" ? PHARMACY_GRADES : ENGINEERING_GRADES;

  const targetGrade = desiredNum > 0
    ? [...gradeTable].reverse().find(g => g.points >= desiredNum) || gradeTable[0]
    : null;

  const subResults = subjects.map(sub => {
    const mx     = getMaxMarks(sub.type);
    const intRaw = predInt[sub.code];

    if (intRaw === undefined || intRaw === "") return { sub, status: "no_internal", mx };

    const intV = Number(intRaw);

    const gradeNeeds = gradeTable.map(g => {
      const minExt    = Math.max(0, g.min - intV);
      const achievable = g.grade === "F" || minExt <= mx.ext;
      return { ...g, minExt, achievable };
    });

    const bestAchievable  = gradeNeeds.find(g => g.achievable && g.grade !== "F");
    const matchingNeed    = gradeNeeds.find(g => g.grade === targetGrade?.grade);
    const canHighlight    = matchingNeed ? matchingNeed.achievable : false;

    return {
      sub, intV, gradeNeeds, bestAchievable, mx,
      status:         "has_internal",
      highlightGrade: canHighlight ? targetGrade.grade : null,
    };
  });

  let bestCaseWeighted  = 0;
  let worstCaseWeighted = 0;
  let anyFilled         = false;

  for (const sub of subjects) {
    const mx     = getMaxMarks(sub.type);
    const intRaw = predInt[sub.code];
    if (intRaw !== undefined && intRaw !== "") {
      const intV       = Number(intRaw);
      const bestGrade  = getGrade(Math.min(intV + mx.ext, 100), scheme);
      const worstGrade = getGrade(intV, scheme);
      bestCaseWeighted  += (bestGrade?.points  || 0) * sub.credits;
      worstCaseWeighted += (worstGrade?.points || 0) * sub.credits;
      anyFilled = true;
    }
  }

  return {
    subResults,
    totalSemCr,
    bestCaseSGPA:  anyFilled ? (bestCaseWeighted  / totalSemCr).toFixed(2) : null,
    worstCaseSGPA: anyFilled ? (worstCaseWeighted / totalSemCr).toFixed(2) : null,
    targetGrade,
    desiredNum,
  };
}

// ── Percentage conversion ─────────────────────────────────────────────────────
export function cgpaToPercentage(cgpa) {
  if (!cgpa) return null;
  return (parseFloat(cgpa) * 10).toFixed(1);
}

// ── Performance label ─────────────────────────────────────────────────────────
export function getPerformanceLabel(cgpa) {
  const n = parseFloat(cgpa);
  if (n >= 9)  return { label: "🏆 Outstanding",      color: "ok"        };
  if (n >= 8)  return { label: "⭐ Excellent",         color: "ok"        };
  if (n >= 7)  return { label: "👍 Very Good",         color: "accentTxt" };
  if (n >= 6)  return { label: "✅ Good",              color: "accentTxt" };
  if (n >= 5)  return { label: "📘 Average",           color: "warn"      };
  return             { label: "⚠ Needs Improvement", color: "bad"       };
}