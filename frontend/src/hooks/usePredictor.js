import { useCallback, useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme }   from "../context/ThemeContext";
import { BRANCHES }          from "../data/branches";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";
import { getMaxMarks }       from "../data/gradeTable";
import { getPredictorBreakdown } from "../utils/calculations";

export function usePredictor() {
  const {
    branch, faculty, scheme,
    semKeys,
    predSem,          setPredSem,
    predInt,          setPredInt,
    predDesiredSGPA,  setPredDesiredSGPA,
    bElectiveNames,
    bCustomSubjects,
    bHiddenSubjects,
  } = useAppData();

  const { c, cardSty, btn, scoreClr, inp } = useTheme();

  // "Year" for Pharm.D, "Sem" for everything else
  const semLabel = useMemo(() => {
    const bd = BRANCHES[branch] || PHARMACY_BRANCHES[branch];
    return bd?.semLabel || "Sem";
  }, [branch]);

  // Subjects — faculty-aware, memoized
  const subs = useMemo(() => {
    if (!predSem || !branch) return [];
    const allBranches = faculty === "pharmacy" ? PHARMACY_BRANCHES : BRANCHES;
    const branchData  = allBranches[branch];
    if (!branchData) return [];
    return [
      ...(branchData.semesters[predSem]?.subjects || [])
        .filter(s => !(bHiddenSubjects[predSem] || []).includes(s.code)),
      ...(bCustomSubjects[predSem] || []),
    ];
  }, [predSem, branch, faculty, bHiddenSubjects, bCustomSubjects]);

  // Breakdown — memoized, scheme passed for correct pharmacy grade table
  const breakdown = useMemo(() => {
    if (!predSem || !subs.length) return null;
    return getPredictorBreakdown(subs, predInt, predDesiredSGPA, scheme);
  }, [predSem, subs, predInt, predDesiredSGPA, scheme]);

  // Whether any internal marks have been entered
  const anyIntFilled = useMemo(() =>
    Object.values(predInt).some(v => v !== "" && v !== undefined),
    [predInt]
  );

  // Display name — respects elective overrides
  const getDisplayName = useCallback((sub) => {
    const name = bElectiveNames[sub.code];
    return name && name !== "__other__" ? name : sub.name;
  }, [bElectiveNames]);

  // Per-subject prediction — scheme-aware max marks
  const getSubjectPrediction = useCallback((sub) => {
    const mx     = getMaxMarks(sub.type, scheme); // scheme so pharmacy gets 25/75 not 40/60
    const iRaw   = predInt[sub.code];
    const iV     = iRaw !== undefined && iRaw !== "" ? Number(iRaw) : null;
    const result = breakdown?.subResults?.find(r => r.sub.code === sub.code);
    return { mx, iV, result };
  }, [predInt, breakdown, scheme]);

  // Reset when switching semester
  const selectPredSem = useCallback((s) => {
    setPredSem(s);
    setPredInt({});
    setPredDesiredSGPA("");
  }, [setPredSem, setPredInt, setPredDesiredSGPA]);

  const setPredIntForSub = useCallback((code, val) => {
    setPredInt(prev => ({ ...prev, [code]: val }));
  }, [setPredInt]);

  return {
    branch, semKeys,
    predSem, predDesiredSGPA,
    predInt,
    subs, breakdown,
    anyIntFilled,
    semLabel,           
    selectPredSem,
    setPredDesiredSGPA,
    setPredIntForSub,
    getDisplayName,
    getSubjectPrediction,
    c, cardSty, btn, scoreClr, inp,
  };
}