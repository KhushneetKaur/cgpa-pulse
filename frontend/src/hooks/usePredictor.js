import { useAppData } from "../context/AppDataContext";
import { BRANCHES } from "../data/branches";
import { getMaxMarks } from "../data/gradeTable";
import { getPredictorBreakdown } from "../utils/calculations";

// Encapsulates all predictor-specific state and derived values.

export function usePredictor() {
  const {
  branch,
  semKeys,
  predSem, setPredSem,
  predInt, setPredInt,
  predDesiredSGPA, setPredDesiredSGPA,
  bElectiveNames,
  bCustomSubjects,
  bHiddenSubjects,
  c, cardSty, btn, scoreClr, inp,
} = useAppData();

  // Subjects for the selected predictor semester
  const subs = (predSem && branch)
  ? [
      ...BRANCHES[branch].semesters[predSem].subjects
        .filter(s => !(bHiddenSubjects[predSem] || []).includes(s.code)),
      ...(bCustomSubjects[predSem] || []),
    ]
  : [];

  // Full breakdown from calculation utility
  const breakdown = (predSem && branch && subs.length)
    ? getPredictorBreakdown(subs, predInt, predDesiredSGPA)
    : null;

  // Whether any internal marks have been entered
  const anyIntFilled = Object.values(predInt).some(v => v !== "" && v !== undefined);

  // Display name for a subject (respects elective overrides)
  function getDisplayName(sub) {
    const name = bElectiveNames[sub.code];
    return name && name !== "__other__" ? name : sub.name;
  }

  // Per-subject predictor data
  function getSubjectPrediction(sub) {
    const mx   = getMaxMarks(sub.type);
    const iRaw = predInt[sub.code];
    const iV   = iRaw !== undefined && iRaw !== ""
                   ? Number(iRaw) : null;

    const result = breakdown?.subResults?.find(
      r => r.sub.code === sub.code
    );

    return { mx, iV, result };
  }

  // Reset predictor state when switching semester
  function selectPredSem(s) {
    setPredSem(s);
    setPredInt({});
    setPredDesiredSGPA("");
  }

  // Update a single subject's internal marks
  function setPredIntForSub(code, val) {
    setPredInt(prev => ({ ...prev, [code]: val }));
  }

  return {
    // State
    branch, semKeys,
    predSem, predDesiredSGPA,
    predInt,
    subs, breakdown,
    anyIntFilled,

    // Actions
    selectPredSem,
    setPredDesiredSGPA,
    setPredIntForSub,

    // Helpers
    getDisplayName,
    getSubjectPrediction,

    // Style
    c, cardSty, btn, scoreClr, inp,
  };
}