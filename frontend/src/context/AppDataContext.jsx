import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { BRANCHES } from "../data/branches";
import { calcSGPA, calcCGPA, calcTarget } from "../utils/calculations";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  apiGetSemesters,
  apiSaveSemester,
  apiSaveQuickSgpa,
  apiDeleteSemester,
  apiToggleBacklog,
  apiUpdateElective,
  apiAddCustomSubject,
  apiRemoveCustomSubject,
  apiToggleSubjectVisibility,
} from "../services/semester.api.js";
import { apiGetLeaderboard }          from "../services/leaderboard.api.js";
import { apiUpdateBranch, apiUpdateLbOptIn } from "../services/user.api.js";

const AppDataContext = createContext(null);

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}

// ── Helper: parse semester data from API response into local shape ─────────────
function parseSemesterData(sem) {
  const marksObj = {};
  for (const m of (sem.marks || [])) {
    marksObj[m.code] = { int: m.int, ext: m.ext };
  }
  const electiveNamesObj = sem.electiveNames
    ? (sem.electiveNames instanceof Map
        ? Object.fromEntries(sem.electiveNames)
        : sem.electiveNames)
    : {};
  return {
    marks:          marksObj,
    sgpa:           sem.sgpa,
    credits:        sem.credits,
    isPartial:      sem.isPartial,
    mode:           sem.mode,
    savedAt:        sem.savedAt ? new Date(sem.savedAt).toLocaleDateString("en-IN") : "",
    electiveNames: electiveNamesObj,
    backlogs:       sem.backlogs || [],
    _electiveNamesObj: electiveNamesObj,
  };
}

export function AppDataProvider({ children }) {
  const { user, authLoading, logout, authErr, setAuthErr, clearForm, googleLogin, setUser } = useAuth();

  // ── App state ──────────────────────────────────────────────────────────────
  const [screen,         setScreen]         = useState("login");
  const [tab,            setTab]            = useState("calculator");
  const [saveMsg,        setSaveMsg]        = useState("");
  const [branch,         setBranchState]    = useState(null);
  const [hist,           setHist]           = useState({});
  const [backlogs,       setBacklogs]       = useState({});
  const [electiveNames,  setElectiveNames]  = useState({});
  const [lbOptIn,        setLbOptInState]   = useState(false);
  const [lbData,         setLbData]         = useState([]);
  const [selSem,         setSelSem]         = useState(null);
  const [marks,          setMarks]          = useState({});
  const [saving,         setSaving]         = useState(false);
  const [qSem,           setQSem]           = useState(null);
  const [qVal,           setQVal]           = useState("");
  const [qErr,           setQErr]           = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [targetCGPA,     setTargetCGPA]     = useState("");
  const [targetResult,   setTargetResult]   = useState(null);
  const [predSem,        setPredSem]        = useState(null);
  const [predInt,        setPredInt]        = useState({});
  const [predDesiredSGPA,setPredDesiredSGPA]= useState("");
  const [customSubjects, setCustomSubjects] = useState({});
  const [hiddenSubjects, setHiddenSubjects] = useState({});

  const hasLoaded = useRef(false);

  const bCustomSubjects = useMemo(() => branch ? (customSubjects[branch] || {}) : {}, [branch, customSubjects]);
  const bHiddenSubjects = useMemo(() => branch ? (hiddenSubjects[branch] || {}) : {}, [branch, hiddenSubjects]);

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
        setBranchState(user.branch || null);
        setLbOptInState(user.lbOptIn || false);

        if (user.branch) {
          try {
            const result = await apiGetSemesters(user.branch);
            const semesters = result?.semesters || result?.data?.semesters || [];

            const histMap = { [user.branch]: {} };
            const backlogMap = { [user.branch]: {} };
            const electiveMap = { [user.branch]: {} };
            const customMap = { [user.branch]: {} };
            const hiddenMap = { [user.branch]: {} };

            for (const sem of semesters) {
              const { _electiveNamesObj, ...histEntry } = parseSemesterData(sem);
              histMap[user.branch][sem.semNumber] = histEntry; 
              backlogMap[user.branch][sem.semNumber] = sem.backlogs || [];
              customMap[user.branch][sem.semNumber]  = sem.customSubjects || [];
              hiddenMap[user.branch][sem.semNumber]  = sem.hiddenSubjects || [];
              for (const [code, name] of Object.entries(_electiveNamesObj)) {
                electiveMap[user.branch][code] = name;
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
        console.error("Failed to load user data:", err.message, err);
      } finally {
        setScreen("app");
      }
    }

    loadUserData();
  }, [user, authLoading]);

  // ── Fetch leaderboard ──────────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    try {
      const result  = await apiGetLeaderboard("ALL");
      const entries = result?.entries || result?.data?.entries || [];
      setLbData(entries);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
  }, []);

  // ── setBranch ─────────────────────────────────────────────────────────────
  const setBranch = useCallback(async (key) => {
    if (!BRANCHES[key]) return;
    setBranchState(key);
    setSelSem(null);
    setMarks({});
    setSaveMsg("");

    try {
      await apiUpdateBranch(key);
      const result    = await apiGetSemesters(key);
      const semesters = result?.semesters || result?.data?.semesters || [];
      const histMap   = { [key]: {} };
      const electiveMapForBranch = {};

      for (const sem of semesters) {
        // FIX: Destructured _electiveNamesObj correctly instead of calling undefined `parsed`
        const { _electiveNamesObj, ...histEntry } = parseSemesterData(sem);
        histMap[key][sem.semNumber] = histEntry;
        for (const [code, name] of Object.entries(_electiveNamesObj)) {
          electiveMapForBranch[code] = name;
        }
      }

      setElectiveNames(prev => ({ ...prev, [key]: { ...(prev[key] || {}), ...electiveMapForBranch } }));
      setHist(prev => ({ ...prev, ...histMap }));
    } catch (err) {
      console.error("setBranch error:", err);
    }
  }, []);

  const selectSem = useCallback((s) => {
    setSelSem(s);
    setSaveMsg("");
  }, []);

  // Sync marks whenever selSem or branch changes
  useEffect(() => {
    setMarks(branch && selSem ? (hist[branch]?.[selSem]?.marks || {}) : {});
  }, [selSem, branch, hist]);

  const changeMark = useCallback((code, field, val) => {
    if (val !== "" && isNaN(val)) return;
    setMarks(prev => ({ ...prev, [code]: { ...prev[code], [field]: val } }));
  }, []);

  const saveSem = useCallback(async () => {
    if (!selSem || !branch) return;
    setSaving(true);
    try {
      const hiddenCodes   = bHiddenSubjects[selSem] || [];
      const hardcodedSubs = BRANCHES[branch].semesters[selSem].subjects.filter(s => !hiddenCodes.includes(s.code));
      const customSubs    = bCustomSubjects[selSem] || [];
      const subs          = [...hardcodedSubs, ...customSubs];
      const res           = calcSGPA(subs, marks);
      const marksArray    = subs.map(sub => ({ code: sub.code, int: marks[sub.code]?.int ?? null, ext: marks[sub.code]?.ext ?? null }));

      const result   = await apiSaveSemester(branch, selSem, { branch, semNumber: selSem, marks: marksArray, sgpa: res?.sgpa || null, credits: res?.credits || 0, isPartial: res?.isPartial || false, mode: "detailed" });
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
            savedAt:   new Date(semester.savedAt).toLocaleDateString("en-IN"),
          },
        },
      }));
      toast.success("Semester saved!");
    } catch (err) {
      toast.error("Save failed — try again");
      console.error("saveSem error:", err);
    } finally {
      setSaving(false);
    }
  }, [selSem, branch, bHiddenSubjects, bCustomSubjects, marks]);

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

  const openQuick = useCallback((s) => {
    setQSem(s);
    setQVal(branch ? (hist[branch]?.[s]?.sgpa || "") : "");
    setQErr("");
  }, [branch, hist]);

  const closeQuick = useCallback(() => { setQSem(null); setQVal(""); setQErr(""); }, []);

  const saveQuick = useCallback(async () => {
    const v = parseFloat(qVal);
    if (isNaN(v) || v < 0 || v > 10) { setQErr("Enter a valid SGPA between 0.00 and 10.00."); return; }
    try {
      const hiddenCodes   = bHiddenSubjects[qSem] || [];
      const hardcodedSubs = BRANCHES[branch].semesters[qSem].subjects.filter(s => !hiddenCodes.includes(s.code));
      const customSubs    = bCustomSubjects[qSem] || [];
      const totalCr       = [...hardcodedSubs, ...customSubs].reduce((a, sub) => a + sub.credits, 0);

      const result   = await apiSaveQuickSgpa(branch, qSem, v, totalCr);
      const semester = result?.semester || result?.data?.semester || result;

      setHist(prev => ({
        ...prev,
        [branch]: {
          ...(prev[branch] || {}),
          [qSem]: { marks: prev[branch]?.[qSem]?.marks || {}, sgpa: semester.sgpa, credits: semester.credits, isPartial: false, mode: "quick", savedAt: new Date(semester.savedAt).toLocaleDateString("en-IN") },
        },
      }));
      closeQuick();
      toast.success("SGPA saved!");
    } catch (err) {
      setQErr("Failed to save — try again");
      console.error("saveQuick error:", err);
    }
  }, [qVal, branch, qSem, bHiddenSubjects, bCustomSubjects, closeQuick]);

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
      const result         = await apiToggleBacklog(branch, sem, code);
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

  const toggleLbOptIn = useCallback(async () => {
    try {
      const next = !lbOptIn;
      await apiUpdateLbOptIn(next);
      setLbOptInState(next);
      await fetchLeaderboard();
    } catch (err) {
      console.error("toggleLbOptIn error:", err?.message || err?.status);
      throw err;
    }
  }, [lbOptIn, fetchLeaderboard]);

  const runCalcTarget = useCallback(() => {
    if (!branch || !targetCGPA) return;
    const semKeysLocal       = Object.keys(BRANCHES[branch].semesters).map(Number);
    const bHistLocal         = hist[branch] || {};
    const semCreditsOverride = {};
    for (const s of semKeysLocal) {
      const hiddenCodes   = bHiddenSubjects[s] || [];
      const hardcodedSubs = BRANCHES[branch].semesters[s].subjects.filter(sub => !hiddenCodes.includes(sub.code));
      const customSubs    = bCustomSubjects[s] || [];
      semCreditsOverride[s] = [...hardcodedSubs, ...customSubs].reduce((t, sub) => t + sub.credits, 0);
    }
    setTargetResult(calcTarget(branch, semKeysLocal, bHistLocal, targetCGPA, semCreditsOverride));
  }, [branch, targetCGPA, hist, bHiddenSubjects, bCustomSubjects]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const semKeys      = useMemo(() => branch ? Object.keys(BRANCHES[branch].semesters).map(Number) : [], [branch]);
  const bHist        = useMemo(() => branch ? (hist[branch] || {}) : {}, [branch, hist]);
  const bBacklogs    = useMemo(() => branch ? (backlogs[branch] || {}) : {}, [branch, backlogs]);
  const bElectiveNames = useMemo(() => branch ? (electiveNames[branch] || {}) : {}, [branch, electiveNames]);
  const cgpa         = useMemo(() => branch ? calcCGPA(semKeys.map(s => bHist[s] || {})) : null, [branch, semKeys, bHist]);
  const doneSems     = useMemo(() => branch ? semKeys.filter(s => bHist[s]?.sgpa).length : 0, [branch, semKeys, bHist]);
  const totalBacklogs = useMemo(() => Object.values(bBacklogs).reduce((a, arr) => a + (arr?.length || 0), 0), [bBacklogs]);
  const curSubs      = useMemo(() => (selSem && branch)
    ? [...BRANCHES[branch].semesters[selSem].subjects.filter(s => !(bHiddenSubjects[selSem] || []).includes(s.code)), ...(bCustomSubjects[selSem] || [])]
    : [], [selSem, branch, bHiddenSubjects, bCustomSubjects]);
  const liveRes      = useMemo(() => (selSem && branch) ? calcSGPA(curSubs, marks) : null, [selSem, branch, curSubs, marks]);

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
    setHiddenSubjects(prev => {
      const current = prev[branch]?.[semNumber] || [];
      const updated = hidden ? [...current.filter(c => c !== code), code] : current.filter(c => c !== code);
      return { ...prev, [branch]: { ...(prev[branch] || {}), [semNumber]: updated } };
    });

    if (bHist[semNumber]?.marks) {
      const newHiddenCodes = hidden
        ? [...(bHiddenSubjects[semNumber] || []).filter(c => c !== code), code]
        : (bHiddenSubjects[semNumber] || []).filter(c => c !== code);
      const allSubs = [
        ...BRANCHES[branch].semesters[semNumber].subjects.filter(s => !newHiddenCodes.includes(s.code)),
        ...(bCustomSubjects[semNumber] || []),
      ];
      const recalc = calcSGPA(allSubs, bHist[semNumber].marks);
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
      setHiddenSubjects(prev => {
        const current  = prev[branch]?.[semNumber] || [];
        const reverted = hidden ? current.filter(c => c !== code) : [...current, code];
        return { ...prev, [branch]: { ...(prev[branch] || {}), [semNumber]: reverted } };
      });
      console.error("toggleHiddenSubject error:", err);
      throw err;
    }
  }, [branch, bHist, bHiddenSubjects, bCustomSubjects]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = useMemo(() => ({
    screen, setScreen, tab, setTab, saveMsg,
    branch, setBranch, hist, bHist,
    backlogs, bBacklogs, electiveNames, bElectiveNames,
    lbOptIn, toggleLbOptIn, lbData, fetchLeaderboard,
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
    screen, tab, saveMsg, branch, setBranch, hist, bHist,
    backlogs, bBacklogs, electiveNames, bElectiveNames,
    lbOptIn, toggleLbOptIn, lbData, fetchLeaderboard,
    selSem, selectSem, marks, changeMark,
    saving, saveSem, deleteSemRecord, curSubs, liveRes,
    qSem, qVal, qErr, openQuick, closeQuick, saveQuick, deleteQuick,
    showDisclaimer, targetCGPA, targetResult, runCalcTarget,
    predSem, predInt, predDesiredSGPA,
    semKeys, cgpa, doneSems, totalBacklogs,
    subDisplayName, toggleBacklog, setElectiveName, flashSave,
    user, setUser, logout, authErr, setAuthErr, authLoading, clearForm, googleLogin,
    bCustomSubjects, bHiddenSubjects,
    addCustomSubject, removeCustomSubject, toggleHiddenSubject,
  ]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}