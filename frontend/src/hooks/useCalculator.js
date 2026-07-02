import { useAppData } from "../context/AppDataContext";
import { BRANCHES } from "../data/branches";
import { getGrade, getMaxMarks } from "../data/gradeTable";

// Encapsulates all calculator-specific derived state and helpers.
// Components import this instead of pulling individual values from useAppData.

export function useCalculator() {
  const {
    branch,
    selSem,
    marks,
    changeMark,
    saving,
    saveSem,
    liveRes,
    openQuick,
    bBacklogs,
    bElectiveNames,
    setElectiveName,
    toggleBacklog,
    c,
    inp,
    btn,
    cardSty,
    scoreClr,
  } = useAppData();

  // All subjects for the selected semester
  const subs = (selSem && branch)
    ? BRANCHES[branch].semesters[selSem].subjects
    : [];

  // Total credits for the selected semester
  const totalSemCr = subs.reduce((a, sub) => a + sub.credits, 0);

  // Semester name
  const semName = (selSem && branch)
    ? BRANCHES[branch].semesters[selSem].name
    : "";

  // Derive per-subject entry state from raw marks
  function getSubjectEntry(sub) {
    const mx     = getMaxMarks(sub.type);
    const entry  = marks[sub.code] || {};
    const isLab  = sub.type === "lab";

    const iVal = entry.int !== "" && entry.int !== undefined
      ? Number(entry.int) : null;
    const eVal = entry.ext !== "" && entry.ext !== undefined
      ? Number(entry.ext) : null;

    const total      = iVal !== null && eVal !== null ? iVal + eVal : null;
    const grade      = getGrade(total);
    const bothFilled = iVal !== null && eVal !== null;
    const iWarn      = iVal !== null && iVal > mx.int;
    const eWarn      = eVal !== null && eVal > mx.ext;

    const isBacklog  = (bBacklogs[selSem] || []).includes(sub.code);
    const electiveName = bElectiveNames[sub.code] || "";

    return {
      mx, entry, isLab,
      iVal, eVal,
      total, grade,
      bothFilled,
      iWarn, eWarn,
      isBacklog,
      electiveName,
    };
  }

  return {
    // Data
    branch, selSem, subs,
    totalSemCr, semName,
    marks, liveRes,
    saving,

    // Actions
    changeMark, saveSem,
    openQuick,
    toggleBacklog,
    setElectiveName,

    // Per-subject helper
    getSubjectEntry,

    // Style
    c, inp, btn, cardSty, scoreClr,
  };
}