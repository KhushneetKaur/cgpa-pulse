import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { BRANCHES }          from "../data/branches";
import { PHARMACY_BRANCHES } from "../data/pharmacyBranches";
import { calcSGPA, calcCGPA, calcTarget } from "../utils/calculations";
import { useAuth }           from "../context/AuthContext";
import { getMaxMarks }       from "../data/gradeTable";
import toast from "react-hot-toast";
import {
  apiGetSemesters, apiSaveSemester, apiSaveQuickSgpa,
  apiDeleteSemester, apiToggleBacklog, apiUpdateElective,
  apiAddCustomSubject, apiRemoveCustomSubject, apiToggleSubjectVisibility,
} from "../services/semester.api.js";
import { apiGetLeaderboard }           from "../services/leaderboard.api.js";
import { apiUpdateBranch } from "../services/user.api.js";

const AppDataContext = createContext(null);

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}

// ── Parse API semester response into local shape ──────────────────────────────
function parseSemesterData(sem) {
  const marksObj = {};
  for (const m of sem.marks || []) {
    marksObj[m.code] = { int: m.int, ext: m.ext };
  }
  let electiveNamesObj = {};
  if (sem.electiveNames) {
    electiveNamesObj = sem.electiveNames instanceof Map
      ? Object.fromEntries(sem.electiveNames)
      : typeof sem.electiveNames === "object"
      ? sem.electiveNames : {};
  }
  return {
    marks:             marksObj,
    sgpa:              sem.sgpa,
    credits:           sem.credits,
    isPartial:         sem.isPartial,
    mode:              sem.mode,
    savedAt:           sem.savedAt ? new Date(sem.savedAt).toISOString() : "",
    electiveNames:     electiveNamesObj,
    backlogs:          sem.backlogs || [],
    _electiveNamesObj: electiveNamesObj,
  };
}

// ── Case-Insensitive Branch Normalization ──────────────────────────────────────
function normalizeBranchKey(branch) {
  return branch ? String(branch).toUpperCase().trim() : "";
}

// ── Branch helpers — both engineering and pharmacy aware ──────────────────────
function getBranchData(branch, faculty) {
  if (!branch) return null;
  const key = normalizeBranchKey(branch);
  
  if (faculty === "pharmacy" && PHARMACY_BRANCHES[key]) {
    return PHARMACY_BRANCHES[key];
  }
  if (faculty === "engineering" && BRANCHES[key]) {
    return BRANCHES[key];
  }

  // General fallback search across both dictionaries
  return PHARMACY_BRANCHES[key] || BRANCHES[key] || null;
}

function getBranchSemesters(branch, faculty) {
  return getBranchData(branch, faculty)?.semesters || {};
}

// Infer faculty from normalized branch key
function inferFaculty(branch) {
  if (!branch) return null;
  const key = normalizeBranchKey(branch);
  if (PHARMACY_BRANCHES[key]) return "pharmacy";
  if (BRANCHES[key])          return "engineering";
  return null;
}

export function AppDataProvider({ children }) {
  const {
    user, authLoading, logout,
    authErr, setAuthErr, clearForm, googleLogin, setUser,
  } = useAuth();

  // ── App state ──────────────────────────────────────────────────────────────
  const [screen,          setScreen]          = useState("login");
  const [tab,             setTab]             = useState("calculator");
  const [saveMsg,         setSaveMsg]         = useState("");
  const [branch,          setBranchState]     = useState(null);
  const [faculty,         setFaculty]         = useState(null);
  const [hist,            setHist]            = useState({});
  const [backlogs,        setBacklogs]        = useState({});
  const [electiveNames,   setElectiveNames]   = useState({});
  const [lbOptIn,         setLbOptInState]    = useState(true);
  const [lbData,          setLbData]          = useState([]);
  const [selSem,          setSelSem]          = useState(null);
  const [marks,           setMarks]           = useState({});
  const [saving,          setSaving]          = useState(false);
  const [qSem,            setQSem]            = useState(null);
  const [qVal,            setQVal]            = useState("");
  const [qErr,            setQErr]            = useState("");
  const [showDisclaimer,  setShowDisclaimer]  = useState(false);
  const [targetCGPA,      setTargetCGPA]      = useState("");
  const [targetResult,    setTargetResult]    = useState(null);
  const [predSem,         setPredSem]         = useState(null);
  const [predInt,         setPredInt]         = useState({});
  const [predDesiredSGPA, setPredDesiredSGPA] = useState("");
  const [customSubjects,  setCustomSubjects]  = useState({});
  const [hiddenSubjects,  setHiddenSubjects]  = useState({});

  const hasLoaded = useRef(false);

  const bCustomSubjects = useMemo(() => (branch ? customSubjects[branch] || {} : {}), [branch, customSubjects]);
  const bHiddenSubjects = useMemo(() => (branch ? hiddenSubjects[branch] || {} : {}), [branch, hiddenSubjects]);

  // Grade scheme derived from branch — drives getGrade() boundaries in calcSGPA
  const scheme = useMemo(() => getBranchData(branch, faculty)?.scheme || (faculty === "pharmacy" ? "pharmacy" : "engineering"), [branch, faculty]);

  const flashSave = useCallback((msg = "Saved!") => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 2500);
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      hasLoaded.current = false;
      setScreen("login");
      setHist({});
      setBacklogs({});
      setElectiveNames({});
      setBranchState(null);
      setFaculty(null);
      setSelSem(null);
      setMarks({});
      return;
    }

    const userId = user?._id?.toString() || user?.id?.toString();
    if (!userId) { setScreen("app"); return; }
    if (hasLoaded.current === userId) return;
    hasLoaded.current = userId;

    async function loadUserData() {
      try {
        const userBranch = user.branch ? normalizeBranchKey(user.branch) : null;
        setBranchState(userBranch);
        setLbOptInState(user.lbOptIn || false);

        // Detect faculty — from user record or inferred from branch
        const detectedFaculty = user.faculty || inferFaculty(userBranch);
        if (detectedFaculty) setFaculty(detectedFaculty);

        if (userBranch) {
          try {
            const result    = await apiGetSemesters(userBranch);
            const semesters = result?.semesters || result?.data?.semesters || [];

            const histMap     = { [userBranch]: {} };
            const backlogMap  = { [userBranch]: {} };
            const electiveMap = { [userBranch]: {} };
            const customMap   = { [userBranch]: {} };
            const hiddenMap   = { [userBranch]: {} };

            for (const sem of semesters) {
              const { _electiveNamesObj, ...histEntry } = parseSemesterData(sem);
              histMap[userBranch][sem.semNumber]    = histEntry;
              backlogMap[userBranch][sem.semNumber] = sem.backlogs || [];
              customMap[userBranch][sem.semNumber]  = sem.customSubjects || [];
              hiddenMap[userBranch][sem.semNumber]  = sem.hiddenSubjects || [];
              for (const [code, name] of Object.entries(_electiveNamesObj)) {
                electiveMap[userBranch][code] = name;
              }
            }

            setHist(histMap);
            setBacklogs(backlogMap);
            setElectiveNames(electiveMap);
            setCustomSubjects(customMap);
            setHiddenSubjects(hiddenMap);
          } catch (semErr) {
            console.error("Failed to load semester data:", semErr);
          }
        }
      } catch (err) {
        console.error("Failed to load user data:", err?.message || err);
      } finally {
        setScreen("app");
      }
    }

    loadUserData();
  }, [user, authLoading]);

// ── Leaderboard ───────────────────────────────────────────────────────────
const fetchLeaderboard = useCallback(async (branchFilter = "ALL", facultyFilter = null) => {
  try {
    const params = { limit: 100 }; // Use a standard limit boundary

    // Only include the branch query parameter if filtering by a specific branch
    if (branchFilter && branchFilter !== "ALL") {
      params.branch = branchFilter;
    }

    if (facultyFilter) {
      params.faculty = facultyFilter;
    }

    const result = await apiGetLeaderboard(params);
    const entries = result?.entries || result?.data?.entries || result?.data || [];
    setLbData(entries);
  } catch (err) {
    console.error("Failed to load leaderboard:", err);
  }
}, []);

  // ── setBranch ─────────────────────────────────────────────────────────────
  const setBranch = useCallback(async (rawKey) => {
    const key           = normalizeBranchKey(rawKey);
    const isPharmacy    = !!PHARMACY_BRANCHES[key];
    const isEngineering = !!BRANCHES[key];

    if (!isPharmacy && !isEngineering) return;

    if (isPharmacy) setFaculty("pharmacy");
    else            setFaculty("engineering");

    setBranchState(key);
    setSelSem(null);
    setMarks({});
    setSaveMsg("");

    try {
      await apiUpdateBranch(key);
      const result    = await apiGetSemesters(key);
      const semesters = result?.semesters || result?.data?.semesters || [];
      const branchHist           = {};
      const electiveMapForBranch = {};

      for (const sem of semesters) {
        const { _electiveNamesObj, ...histEntry } = parseSemesterData(sem);
        branchHist[sem.semNumber] = histEntry;
        for (const [code, name] of Object.entries(_electiveNamesObj)) {
          electiveMapForBranch[code] = name;
        }
      }

      setElectiveNames(prev => ({ ...prev, [key]: { ...(prev[key] || {}), ...electiveMapForBranch } }));
      setHist(prev => ({ ...prev, [key]: branchHist }));
    } catch (err) {
      console.error("setBranch error:", err);
    }
  }, []);

  const selectSem = useCallback((s) => { setSelSem(s); setSaveMsg(""); }, []);

  // Sync marks when selSem/branch/hist changes
  useEffect(() => {
    setMarks(branch && selSem ? hist[branch]?.[selSem]?.marks || {} : {});
  }, [selSem, branch, hist]);

  // Scheme-aware max enforcement — pharmacy subjects have different int/ext limits
  const changeMark = useCallback((code, field, val, subType) => {
    if (val !== "" && isNaN(val)) return;
    if (val !== "" && subType) {
      const mx  = getMaxMarks(subType, scheme);
      const max = field === "int" ? mx.int : mx.ext;
      if (Number(val) > max) return;
    }
    setMarks(prev => ({ ...prev, [code]: { ...prev[code], [field]: val } }));
  }, [scheme]);

  const saveSem = useCallback(async () => {
    if (!selSem || !branch) return;
    setSaving(true);
    try {
      const branchSems    = getBranchSemesters(branch, faculty);
      const hiddenCodes   = bHiddenSubjects[selSem] || [];
      const hardcodedSubs = (branchSems[selSem]?.subjects || []).filter(s => !hiddenCodes.includes(s.code));
      const customSubs    = bCustomSubjects[selSem] || [];
      const subs          = [...hardcodedSubs, ...customSubs];
      const res           = calcSGPA(subs, marks, scheme);
      const marksArray    = subs.map(sub => ({
        code: sub.code,
        int:  marks[sub.code]?.int ?? null,
        ext:  marks[sub.code]?.ext ?? null,
      }));

      const result   = await apiSaveSemester(branch, selSem, {
        branch, semNumber: selSem, marks: marksArray,
        sgpa: res?.sgpa || null, credits: res?.credits || 0,
        isPartial: res?.isPartial || false, mode: "detailed",
      });
      const semester = result?.semester || result?.data?.semester || result;

      setHist(prev => ({
        ...prev,
        [branch]: {
          ...(prev[branch] || {}),
          [selSem]: {
            marks:     Object.fromEntries(marksArray.map(m => [m.code, { int: m.int, ext: m.ext }])),
            sgpa:      semester.sgpa,
            credits:   semester.credits,
            isPartial: semester.isPartial,
            mode:      "detailed",
            savedAt:   semester.savedAt
              ? new Date(semester.savedAt).toISOString()
              : new Date().toISOString(),
          },
        },
      }));

      try {
        const { apiGetProfile } = await import("../services/user.api.js");
        const updatedUser = await apiGetProfile();
        if (updatedUser) {
          setUser(updatedUser);
          setLbOptInState(updatedUser.lbOptIn || false);
        }
      } catch { /* non-critical */ }

      toast.success("Semester saved!");
    } catch (err) {
      toast.error("Save failed — try again");
      console.error("saveSem error:", err);
    } finally {
      setSaving(false);
    }
  }, [selSem, branch, faculty, bHiddenSubjects, bCustomSubjects, marks, scheme, setUser]);

  const deleteSemRecord = useCallback(async (sem = selSem) => {
    if (!branch || !sem) return;
    try {
      await apiDeleteSemester(branch, sem);
      setHist(prev => { const b = { ...(prev[branch] || {}) }; delete b[sem]; return { ...prev, [branch]: b }; });
      setMarks({});
      toast.success("Semester deleted");
    } catch (err) {
      console.error("deleteSemRecord error:", err);
      toast.error("Delete failed");
    }
  }, [branch, selSem]);

  const openQuick  = useCallback((s) => {
    setQSem(s);
    setQVal(branch ? hist[branch]?.[s]?.sgpa || "" : "");
    setQErr("");
  }, [branch, hist]);

  const closeQuick = useCallback(() => { setQSem(null); setQVal(""); setQErr(""); }, []);

  const saveQuick = useCallback(async () => {
    const v = parseFloat(qVal);
    if (isNaN(v) || v < 0 || v > 10) { setQErr("Enter a valid SGPA between 0.00 and 10.00."); return; }
    try {
      const branchSems    = getBranchSemesters(branch, faculty);
      const hiddenCodes   = bHiddenSubjects[qSem] || [];
      const hardcodedSubs = (branchSems[qSem]?.subjects || []).filter(s => !hiddenCodes.includes(s.code));
      const customSubs    = bCustomSubjects[qSem] || [];
      const totalCr       = [...hardcodedSubs, ...customSubs].reduce((a, sub) => a + sub.credits, 0);

      const result   = await apiSaveQuickSgpa(branch, qSem, v, totalCr);
      const semester = result?.semester || result?.data?.semester || result;

      setHist(prev => ({
        ...prev,
        [branch]: {
          ...(prev[branch] || {}),
          [qSem]: {
            marks:     prev[branch]?.[qSem]?.marks || {},
            sgpa:      semester.sgpa,
            credits:   semester.credits,
            isPartial: false,
            mode:      "quick",
            savedAt:   semester.savedAt
              ? new Date(semester.savedAt).toISOString()
              : new Date().toISOString(),
          },
        },
      }));

      try {
        const { apiGetProfile } = await import("../services/user.api.js");
        const updatedUser = await apiGetProfile();
        if (updatedUser) {
          setUser(updatedUser);
          setLbOptInState(updatedUser.lbOptIn || false);
        }
      } catch { /* non-critical */ }

      closeQuick();
      toast.success("SGPA saved!");
    } catch (err) {
      setQErr("Failed to save — try again");
      console.error("saveQuick error:", err);
    }
  }, [qVal, branch, qSem, faculty, bHiddenSubjects, bCustomSubjects, closeQuick, setUser]);

  const deleteQuick = useCallback(async () => {
    if (!branch || !qSem) return;
    try {
      await apiDeleteSemester(branch, qSem);
      setHist(prev => { const b = { ...(prev[branch] || {}) }; delete b[qSem]; return { ...prev, [branch]: b }; });
      closeQuick();
      flashSave("SGPA deleted!");
    } catch (err) {
      console.error("deleteQuick error:", err);
      setQErr("Failed to delete — try again");
    }
  }, [branch, qSem, closeQuick, flashSave]);

  const toggleBacklog = useCallback(async (sem, code) => {
    try {
      const result          = await apiToggleBacklog(branch, sem, code);
      const updatedBacklogs = result?.backlogs || result?.data?.backlogs || [];
      setBacklogs(prev => ({ ...prev, [branch]: { ...(prev[branch] || {}), [sem]: updatedBacklogs } }));
    } catch (err) {
      console.error("toggleBacklog error:", err);
    }
  }, [branch]);

  const setElectiveName = useCallback(async (code, name) => {
    try {
      await apiUpdateElective(branch, selSem, code, name);
      setElectiveNames(prev => ({ ...prev, [branch]: { ...(prev[branch] || {}), [code]: name } }));
    } catch (err) {
      console.error("setElectiveName error:", err);
    }
  }, [branch, selSem]);

  const runCalcTarget = useCallback(() => {
    if (!branch || !targetCGPA) return;
    const branchSems         = getBranchSemesters(branch, faculty);
    const semKeysLocal       = Object.keys(branchSems).map(Number);
    const bHistLocal         = hist[branch] || {};
    const semCreditsOverride = {};
    for (const s of semKeysLocal) {
      const hiddenCodes   = bHiddenSubjects[s] || [];
      const hardcodedSubs = (branchSems[s]?.subjects || []).filter(sub => !hiddenCodes.includes(sub.code));
      const customSubs    = bCustomSubjects[s] || [];
      semCreditsOverride[s] = [...hardcodedSubs, ...customSubs].reduce((t, sub) => t + sub.credits, 0);
    }
    setTargetResult(calcTarget(branch, semKeysLocal, bHistLocal, targetCGPA, semCreditsOverride));
  }, [branch, faculty, targetCGPA, hist, bHiddenSubjects, bCustomSubjects]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const semKeys = useMemo(() => {
    if (!branch) return [];
    return Object.keys(getBranchSemesters(branch, faculty)).map(Number);
  }, [branch, faculty]);

  const bHist          = useMemo(() => (branch ? hist[branch] || {} : {}),          [branch, hist]);
  const bBacklogs      = useMemo(() => (branch ? backlogs[branch] || {} : {}),      [branch, backlogs]);
  const bElectiveNames = useMemo(() => (branch ? electiveNames[branch] || {} : {}), [branch, electiveNames]);

  const cgpa = useMemo(() => (branch ? calcCGPA(semKeys.map(s => bHist[s] || {})) : null), [branch, semKeys, bHist]);

  const doneSems = useMemo(() => (branch ? semKeys.filter(s => bHist[s]?.sgpa).length : 0), [branch, semKeys, bHist]);

  const totalBacklogs = useMemo(() => Object.values(bBacklogs).reduce((a, arr) => a + (arr?.length || 0), 0), [bBacklogs]);

  const curSubs = useMemo(() => {
    if (!selSem || !branch) return [];
    const branchSems = getBranchSemesters(branch, faculty);
    return [
      ...(branchSems[selSem]?.subjects || []).filter(s => !(bHiddenSubjects[selSem] || []).includes(s.code)),
      ...(bCustomSubjects[selSem] || []),
    ];
  }, [selSem, branch, faculty, bHiddenSubjects, bCustomSubjects]);

  // Pass scheme to calculation so pharmacy uses O/A/B/C/D/F grading logic
  const liveRes = useMemo(() => (selSem && branch ? calcSGPA(curSubs, marks, scheme) : null), [selSem, branch, curSubs, marks, scheme]);

  const subDisplayName = useCallback((sub) => bElectiveNames[sub.code] || sub.name, [bElectiveNames]);

  const addCustomSubject = useCallback(async (semNumber, subject) => {
    try {
      const result  = await apiAddCustomSubject(branch, semNumber, subject);
      const updated = result?.customSubjects || result?.data?.customSubjects || [];
      setCustomSubjects(prev => ({ ...prev, [branch]: { ...(prev[branch] || {}), [semNumber]: updated } }));
    } catch (err) { console.error("addCustomSubject error:", err); throw err; }
  }, [branch]);

  const removeCustomSubject = useCallback(async (semNumber, code) => {
    try {
      const result  = await apiRemoveCustomSubject(branch, semNumber, code);
      const updated = result?.customSubjects || result?.data?.customSubjects || [];
      setCustomSubjects(prev => ({ ...prev, [branch]: { ...(prev[branch] || {}), [semNumber]: updated } }));
    } catch (err) { console.error("removeCustomSubject error:", err); throw err; }
  }, [branch]);

  const toggleHiddenSubject = useCallback(async (semNumber, code, hidden) => {
    const currentHidden  = bHiddenSubjects[semNumber] || [];
    const newHiddenCodes = hidden
      ? [...currentHidden.filter(c => c !== code), code]
      : currentHidden.filter(c => c !== code);

    setHiddenSubjects(prev => ({ ...prev, [branch]: { ...(prev[branch] || {}), [semNumber]: newHiddenCodes } }));

    if (bHist[semNumber]?.marks) {
      const branchSems = getBranchSemesters(branch, faculty);
      const allSubs    = [
        ...(branchSems[semNumber]?.subjects || []).filter(s => !newHiddenCodes.includes(s.code)),
        ...(bCustomSubjects[semNumber] || []),
      ];
      const recalc = calcSGPA(allSubs, bHist[semNumber].marks, scheme);
      setHist(prev => ({
        ...prev,
        [branch]: {
          ...(prev[branch] || {}),
          [semNumber]: {
            ...(prev[branch]?.[semNumber] || {}),
            sgpa:    recalc?.sgpa    || prev[branch]?.[semNumber]?.sgpa,
            credits: recalc?.credits || prev[branch]?.[semNumber]?.credits,
          },
        },
      }));
    }

    try {
      await apiToggleSubjectVisibility(branch, semNumber, code, hidden);
    } catch (err) {
      setHiddenSubjects(prev => ({ ...prev, [branch]: { ...(prev[branch] || {}), [semNumber]: currentHidden } }));
      console.error("toggleHiddenSubject error:", err);
      throw err;
    }
  }, [branch, faculty, bHist, bHiddenSubjects, bCustomSubjects, scheme]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = useMemo(() => ({
    screen, setScreen, tab, setTab, saveMsg,
    branch, setBranch, faculty, setFaculty, scheme,
    hist, bHist, backlogs, bBacklogs, electiveNames, bElectiveNames,
    lbOptIn, lbData, fetchLeaderboard,
    selSem, selectSem, marks, changeMark,
    saving, saveSem, deleteSemRecord, curSubs, liveRes,
    qSem, qVal, setQVal, qErr, openQuick, closeQuick, saveQuick, deleteQuick,
    showDisclaimer, setShowDisclaimer,
    targetCGPA, setTargetCGPA, targetResult, setTargetResult, runCalcTarget,
    predSem, setPredSem, predInt, setPredInt, predDesiredSGPA, setPredDesiredSGPA,
    semKeys, cgpa, doneSems, totalBacklogs,
    subDisplayName, toggleBacklog, setElectiveName, flashSave,
    user, setUser, logout, authErr, setAuthErr, authLoading, clearForm, googleLogin,
    bCustomSubjects, bHiddenSubjects,
    addCustomSubject, removeCustomSubject, toggleHiddenSubject,
  }), [
    screen, tab, saveMsg,
    branch, setBranch, faculty, scheme,
    hist, bHist, backlogs, bBacklogs, electiveNames, bElectiveNames,
    lbOptIn, lbData, fetchLeaderboard,
    selSem, marks, saving, curSubs, liveRes,
    qSem, qVal, qErr,
    showDisclaimer, targetCGPA, targetResult, runCalcTarget,
    predSem, predInt, predDesiredSGPA,
    semKeys, cgpa, doneSems, totalBacklogs,
    subDisplayName, toggleBacklog, setElectiveName, flashSave,
    selectSem, changeMark, saveSem, deleteSemRecord,
    openQuick, closeQuick, saveQuick, deleteQuick,
    user, setUser, logout, authErr, setAuthErr, authLoading, clearForm, googleLogin,
    bCustomSubjects, bHiddenSubjects,
    addCustomSubject, removeCustomSubject, toggleHiddenSubject,
  ]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}