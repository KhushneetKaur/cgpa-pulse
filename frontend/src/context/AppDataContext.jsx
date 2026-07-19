import React ,{ createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { BRANCHES } from "../data/branches";
import { calcSGPA, calcCGPA, calcTarget } from "../utils/calculations";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { apiGetSemesters }    from "../services/semester.api.js";
import { apiGetLeaderboard }  from "../services/leaderboard.api.js";
import { apiUpdateBranch }    from "../services/user.api.js";
import toast from "react-hot-toast";
import {
  apiSaveSemester,
  apiSaveQuickSgpa,
  apiDeleteSemester,
  apiToggleBacklog,
  apiUpdateElective,
  apiAddCustomSubject,
  apiRemoveCustomSubject,
  apiToggleSubjectVisibility,
} from "../services/semester.api.js";
import { apiUpdateLbOptIn }   from "../services/user.api.js";

const AppDataContext = createContext(null);

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}

export function AppDataProvider({ children }) {
  const auth = useAuth();
  const {
    user, authLoading, logout,
    authErr, setAuthErr,     
    clearForm,
    googleLogin,
    setUser,
  } = auth;
  const { dark, toggleDark } = useTheme();

  // ── Color tokens (Memoized to prevent children layout rerenders) ─────────────────
  const c = useMemo(() => {
    return dark ? {
      bg:          "#080c18",        // deep navy — not pure black
      card:        "#0f1424",        // elevated surface
      cardAlt:     "#151a2e",        // second level
      border:      "#1e2540",        // subtle blue-tinted border
      borderHover: "#3d4470",

      text:        "#eceef8",        // soft white — not harsh
      sub:         "#8b90b8",        // blue-gray secondary
      muted:       "#4a5070",        // dark muted

      maroon:      "#6d6af0",
      gold:        "#7c83f5",

      accent:      "#7c83f5",        // softer than #818cf8
      accentAlt:   "#34d399",
      accentLt:    "#12163a",        // very dark indigo tint
      accentTxt:   "#a5aeff",        // readable on dark

      ok:          "#2dd4aa",        // teal-green
      warn:        "#94a3b8",        // burnt orange — no yellow
      bad:         "#e05c5c",        // muted red
      purple:      "#c084fc",

      hover:       "#131828",
      inBg:        "#0a0e1c",
      inBdr:       "#252a45",
      goldBg:      "#12100a",
    } : {
      bg:        "#f4f3ff",          // lavender tinted white
      card:      "#ffffff",          // pure white cards
      cardAlt:   "#f9f8ff",          // slightly off-white
      border:    "#e4e2f0",          // soft lavender border
      borderHover: "#a78bfa",        // violet on hover

      text:      "#1e1b4b",          // deep indigo text
      sub:       "#5b5687",          // medium purple-gray
      muted:     "#a09bbf",          // light purple-gray

      maroon:    "#8B1A1A",
      gold:      "#c9a227",

      accent:    "#6d28d9",          // deep violet
      accentAlt: "#059669",          // emerald
      accentLt:  "#ede9fe",          // violet tinted bg
      accentTxt: "#6d28d9",          // accent text on light bg

      ok:        "#059669",          // success
      warn:      "#d97706",          // warning
      bad:       "#dc2626",          // error
      purple:    "#7c3aed",          // special

      hover:     "#ede9fe",
      inBg:      "#faf9ff",
      inBdr:     "#d4d0e8",
      goldBg:    "#fefce8",
    };
  }, [dark]);

  // ── Score color ───────────────────────────────────────────────
  const scoreClr = useCallback((score) => {
    const n = parseFloat(score);
    if (isNaN(n))  return c.muted;
    if (n >= 9)    return c.ok;
    if (n >= 7)    return c.accent;
    if (n >= 5)    return c.warn;
    return c.bad;
  }, [c]);

  // ── Card style ────────────────────────────────────────────────
  const cardSty = useCallback((extra = {}) => ({
    background:   c.card,
    border:       `1px solid ${c.border}`,
    borderRadius: 16,
    padding:      "20px 22px",
    boxShadow:    dark
      ? "0 4px 24px rgba(0,0,0,0.4)"
      : "0 2px 16px rgba(109,40,217,0.06)",
    ...extra,
  }), [c, dark]);

  // ── Input style ───────────────────────────────────────────────
  const inp = useCallback((extra = {}) => ({
    fontSize:         15,
    padding:          "10px 13px",
    border:           `1px solid ${c.inBdr}`,
    borderRadius:     10,
    background:       c.inBg,
    color:            c.text,
    outline:          "none",
    width:            "100%",
    boxSizing:        "border-box",
    fontFamily:       "inherit",
    transition:       "border-color 0.15s, box-shadow 0.15s",
    ...extra,
  }), [c]);

  // ── Button style ──────────────────────────────────────────────
  const btn = useCallback((type = "ghost", extra = {}) => {
    const styles = {
      primary: {
        background:   c.accent,
        color:        "#fff",
        border:       "none",
        fontWeight:   600,
        boxShadow:    dark
          ? `0 4px 14px rgba(129,140,248,0.3)`
          : `0 4px 14px rgba(109,40,217,0.25)`,
      },
      ghost: {
        background:   "transparent",
        color:        c.sub,
        border:       `1px solid ${c.border}`,
        fontWeight:   400,
      },
      soft: {
        background:   c.accentLt,
        color:        c.accentTxt,
        border:       `1px solid ${dark ? c.border : "#c4b5fd"}`,
        fontWeight:   500,
      },
      danger: {
        background:   dark ? "rgba(248,113,113,0.15)" : "rgba(220,38,38,0.08)",
        color:        c.bad,
        border:       `1px solid ${dark ? "rgba(248,113,113,0.3)" : "rgba(220,38,38,0.2)"}`,
        fontWeight:   500,
      },
      success: {
        background:   dark ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.08)",
        color:        c.ok,
        border:       `1px solid ${dark ? "rgba(52,211,153,0.3)" : "rgba(5,150,105,0.2)"}`,
        fontWeight:   500,
      },
    };

    return {
      fontSize:     14,
      padding:      "8px 16px",
      borderRadius: 10,
      cursor:       "pointer",
      outline:      "none",
      fontFamily:   "inherit",
      lineHeight:   1.4,
      transition:   "all 0.15s ease",
      display:      "inline-flex",
      alignItems:   "center",
      gap:          6,
      whiteSpace:   "nowrap",
      ...(styles[type] || styles.ghost),
      ...extra,
    };
  }, [c, dark]);

  // --- App state
  const [screen, setScreen] = useState("login");
  const [tab, setTab] = useState("calculator");
  const [saveMsg, setSaveMsg] = useState("");

  const [branch, setBranchState] = useState(null);
  const [hist, setHist] = useState({});
  const [backlogs, setBacklogs] = useState({});
  const [electiveNames, setElectiveNames] = useState({});
  const [lbOptIn, setLbOptInState] = useState(false);
  const [lbData, setLbData] = useState([]);

  const [selSem, setSelSem] = useState(null);
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);

  const [qSem, setQSem] = useState(null);
  const [qVal, setQVal] = useState("");
  const [qErr, setQErr] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [targetCGPA, setTargetCGPA] = useState("");
  const [targetResult, setTargetResult] = useState(null);

  const [predSem, setPredSem] = useState(null);
  const [predInt, setPredInt] = useState({});
  const [predDesiredSGPA, setPredDesiredSGPA] = useState("");

  const [customSubjects,  setCustomSubjects]  = useState({}); 
  const [hiddenSubjects,  setHiddenSubjects]  = useState({}); 

  const bCustomSubjects = useMemo(() => branch ? (customSubjects[branch] || {}) : {}, [branch, customSubjects]);
  const bHiddenSubjects = useMemo(() => branch ? (hiddenSubjects[branch] || {}) : {}, [branch, hiddenSubjects]);

  function flashSave(msg = "Saved!") {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 2500);
  }

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      if (screen === "app") {
        setScreen("login");
        setHist({});
        setBacklogs({});
        setElectiveNames({});
        setBranchState(null);
        setSelSem(null);
        setMarks({});
      }
      return;
    }

    async function loadUserData() {
      try {
        setHist({});
        setBacklogs({});
        setElectiveNames({});
        setBranchState(user.branch || null);
        setLbOptInState(user.lbOptIn || false);

        if (user.branch) {
          const { semesters } = await apiGetSemesters(user.branch);
          const histMap    = { [user.branch]: {} };
          const backlogMap = { [user.branch]: {} };
          const electiveMap = { [user.branch]: {} };

          for (const sem of semesters) {
            const marksObj = {};
            for (const m of (sem.marks || [])) {
              marksObj[m.code] = { int: m.int, ext: m.ext };
            }
            const electiveNamesObj = sem.electiveNames
              ? (sem.electiveNames instanceof Map
                  ? Object.fromEntries(sem.electiveNames)
                  : sem.electiveNames)
              : {};

            histMap[user.branch][sem.semNumber] = {
              marks:         marksObj,
              sgpa:          sem.sgpa,
              credits:       sem.credits,
              isPartial:     sem.isPartial,
              mode:          sem.mode,
              savedAt:       sem.savedAt
                ? new Date(sem.savedAt).toLocaleDateString("en-IN")
                : "",
              electiveNames: electiveNamesObj,
              backlogs:      sem.backlogs || [],
            };

            backlogMap[user.branch][sem.semNumber] = sem.backlogs || [];

            for (const [code, name] of Object.entries(electiveNamesObj)) {
              electiveMap[user.branch][code] = name;
            }
          }

          const customMap = { [user.branch]: {} };
          const hiddenMap = { [user.branch]: {} };
          for (const sem of semesters) {
            customMap[user.branch][sem.semNumber] = sem.customSubjects || [];
            hiddenMap[user.branch][sem.semNumber] = sem.hiddenSubjects || [];
          }
          setCustomSubjects(customMap);
          setHiddenSubjects(hiddenMap);

          setHist(histMap);
          setBacklogs(backlogMap);
          setElectiveNames(electiveMap);
        }

        await Promise.allSettled([
          user.branch ? apiGetSemesters(user.branch) : Promise.resolve(null),
          apiGetLeaderboard("ALL"),
        ]);

        setScreen("app");
      } catch (err) {
        console.error("Failed to load user data:", err.message, err);
        setScreen("app");
      }
    }

    loadUserData();
  }, [user, authLoading, screen]);

  async function setBranch(key) {
    if (!BRANCHES[key]) return;
    setBranchState(key);
    setSelSem(null);
    setMarks({});
    setSaveMsg("");

    try {
      await apiUpdateBranch(key);
      const { semesters } = await apiGetSemesters(key);
      const histMap = {};
      histMap[key] = {};
      for (const sem of semesters) {
        const electiveNamesObj = sem.electiveNames
          ? (sem.electiveNames instanceof Map
              ? Object.fromEntries(sem.electiveNames)
              : sem.electiveNames)
          : {};

        histMap[key][sem.semNumber] = {
          marks:     Object.fromEntries(
            (sem.marks || []).map(m => [m.code, { int: m.int, ext: m.ext }])
          ),
          sgpa:          sem.sgpa,
          credits:       sem.credits,
          isPartial:     sem.isPartial,
          mode:          sem.mode,
          savedAt:       sem.savedAt
            ? new Date(sem.savedAt).toLocaleDateString("en-IN")
            : "",
          electiveNames: electiveNamesObj,
          backlogs:      sem.backlogs || [],
        };
      }
      const electiveMapForBranch = {};
      for (const sem of semesters) {
        const names = sem.electiveNames
          ? (sem.electiveNames instanceof Map
              ? Object.fromEntries(sem.electiveNames)
              : sem.electiveNames)
          : {};
        for (const [code, name] of Object.entries(names)) {
          electiveMapForBranch[code] = name;
        }
      }
      setElectiveNames(prev => ({
        ...prev,
        [key]: { ...(prev[key] || {}), ...electiveMapForBranch },
      }));
      setHist(prev => ({ ...prev, ...histMap }));

    } catch (err) {
      console.error("setBranch error:", err);
    }
  }

  function selectSem(s) {
    setSelSem(s);
    const saved = branch ? (hist[branch]?.[s]?.marks || {}) : {};
    setMarks(saved);
    setSaveMsg("");
  }

  function changeMark(code, field, val, type) {
    let sub = (selSem && branch)
      ? BRANCHES[branch].semesters[selSem].subjects.find((s) => s.code === code)
      : null;

    if (!sub && selSem && branch) {
      sub = (bCustomSubjects[selSem] || []).find(s => s.code === code);
    }
    if (!sub) return;

    const mx = field === "int"
      ? (sub.type === "lab" ? 60 : 40)
      : (sub.type === "lab" ? 40 : 60);

    if (val !== "" && (isNaN(val) || Number(val) < 0 || Number(val) > mx)) return;

    setMarks((prev) => ({
      ...prev,
      [code]: { ...prev[code], [field]: val },
    }));
  }

  async function saveSem() {
    if (!selSem || !branch) return;
    setSaving(true);
    try {
      const hiddenCodes   = bHiddenSubjects[selSem] || [];
      const hardcodedSubs = BRANCHES[branch].semesters[selSem].subjects
        .filter(s => !hiddenCodes.includes(s.code));
      const customSubs    = bCustomSubjects[selSem] || [];
      const subs          = [...hardcodedSubs, ...customSubs];

      const res = calcSGPA(subs, marks);

      const marksArray = subs.map(sub => ({
        code: sub.code,
        int:  marks[sub.code]?.int ?? null,
        ext:  marks[sub.code]?.ext ?? null,
      }));

      const { semester } = await apiSaveSemester(
        branch,
        selSem,
        {
          branch,
          semNumber: selSem,
          marks:     marksArray,
          sgpa:      res?.sgpa    || null,
          credits:   res?.credits || 0,
          isPartial: res?.isPartial || false,
          mode:      "detailed",
        }
      );

      const newBranchHist = {
        ...(hist[branch] || {}),
        [selSem]: {
          marks:     Object.fromEntries(
            marksArray.map(m => [m.code, { int: m.int, ext: m.ext }])
          ),
          sgpa:      semester.sgpa,
          credits:   semester.credits,
          isPartial: semester.isPartial,
          mode:      "detailed",
          savedAt:   new Date(semester.savedAt).toLocaleDateString("en-IN"),
        },
      };
      setHist(prev => ({ ...prev, [branch]: newBranchHist }));

      toast.success("Semester saved!");
    } catch (err) {
      toast.error("Save failed — try again");
      console.error("saveSem error:", err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteSemRecord(sem = selSem) {
    if (!branch || !sem) return;

    const oldBranchHist = hist[branch] || {};
    const newBranchHist = { ...oldBranchHist };

    delete newBranchHist[sem];

    const newHist = {
      ...hist,
      [branch]: newBranchHist,
    };

    try {
      await apiDeleteSemester(branch, sem);
      setHist(newHist);
      setMarks({});
      toast.success("Semester deleted");
    } catch (err) {
      console.error("deleteSemRecord error:", err);
      toast.error("Delete failed");
    }
  }

  function openQuick(s) {
    const bHistLocal = branch ? (hist[branch] || {}) : {};
    setQSem(s);
    setQVal(bHistLocal[s]?.sgpa || "");
    setQErr("");
  }

  function closeQuick() {
    setQSem(null);
    setQVal("");
    setQErr("");
  }

  async function saveQuick() {
    const v = parseFloat(qVal);
    if (isNaN(v) || v < 0 || v > 10) {
      setQErr("Enter a valid SGPA between 0.00 and 10.00.");
      return;
    }
    try {
      const hiddenCodes   = bHiddenSubjects[qSem] || [];
      const hardcodedSubs = BRANCHES[branch].semesters[qSem].subjects
        .filter(s => !hiddenCodes.includes(s.code));
      const customSubs    = bCustomSubjects[qSem] || [];
      const totalCr       = [...hardcodedSubs, ...customSubs]
        .reduce((s, sub) => s + sub.credits, 0);

      const { semester } = await apiSaveQuickSgpa(branch, qSem, v, totalCr);

      const newBranchHist = {
        ...(hist[branch] || {}),
        [qSem]: {
          marks:     hist[branch]?.[qSem]?.marks || {},
          sgpa:      semester.sgpa,
          credits:   semester.credits,
          isPartial: false,
          mode:      "quick",
          savedAt:   new Date(semester.savedAt).toLocaleDateString("en-IN"),
        },
      };
      setHist(prev => ({ ...prev, [branch]: newBranchHist }));

      closeQuick();
      toast.success("SGPA saved!");
    } catch (err) {
      setQErr("Failed to save — try again");
      console.error("saveQuick error:", err);
    }
  }

  async function deleteQuick() {
    if (!branch || !qSem) return;

    const oldBranchHist = hist[branch] || {};
    const newBranchHist = { ...oldBranchHist };

    delete newBranchHist[qSem];

    const newHist = {
      ...hist,
      [branch]: newBranchHist,
    };

    try {
      await apiDeleteSemester(branch, qSem);
      setHist(newHist);
      closeQuick();
      flashSave("SGPA deleted!");
    } catch (err) {
      console.error("deleteQuick error:", err);
      setQErr("Failed to delete - try again");
    }
  }

  async function toggleBacklog(sem, code) {
    try {
      const updatedBacklogs = await apiToggleBacklog(branch, sem, code);

      setBacklogs(prev => ({
        ...prev,
        [branch]: {
          ...(prev[branch] || {}),
          [sem]: updatedBacklogs,
        },
      }));
    } catch (err) {
      console.error("toggleBacklog error:", err);
    }
  }

  async function setElectiveName(code, name) {
    try {
      await apiUpdateElective(branch, selSem, code, name);

      setElectiveNames(prev => ({
        ...prev,
        [branch]: {
          ...(prev[branch] || {}),
          [code]: name,
        },
      }));
    } catch (err) {
      console.error("setElectiveName error:", err);
    }
  }

  async function toggleLbOptIn() {
    try {
      const next   = !lbOptIn;
      await apiUpdateLbOptIn(next);
      setLbOptInState(next);

      const lb = await apiGetLeaderboard("ALL");
      setLbData(lb.entries || []);
    } catch (err) {
      console.error("toggleLbOptIn error:", err?.message || err?.status || JSON.stringify(err));
      throw err;
    }
  }

  function runCalcTarget() {
    if (!branch || !targetCGPA) return;
    const semKeysLocal = Object.keys(BRANCHES[branch].semesters).map(Number);
    const bHistLocal   = hist[branch] || {};

    const semCreditsOverride = {};
    for (const s of semKeysLocal) {
      const hiddenCodes   = (bHiddenSubjects[s] || []);
      const hardcodedSubs = BRANCHES[branch].semesters[s].subjects
        .filter(sub => !hiddenCodes.includes(sub.code));
      const customSubs    = bCustomSubjects[s] || [];
      semCreditsOverride[s] = [...hardcodedSubs, ...customSubs]
        .reduce((total, sub) => total + sub.credits, 0);
    }

    const result = calcTarget(branch, semKeysLocal, bHistLocal, targetCGPA, semCreditsOverride);
    setTargetResult(result);
  }

  const semKeys = useMemo(() => branch ? Object.keys(BRANCHES[branch].semesters).map(Number) : [], [branch]);
  const bHist = useMemo(() => branch ? (hist[branch] || {}) : {}, [branch, hist]);
  const bBacklogs = useMemo(() => branch ? (backlogs[branch] || {}) : {}, [branch, backlogs]);
  const bElectiveNames = useMemo(() => branch ? (electiveNames[branch] || {}) : {}, [branch, electiveNames]);

  const cgpa = useMemo(() => branch ? calcCGPA(semKeys.map((s) => bHist[s] || {})) : null, [branch, semKeys, bHist]);

  const doneSems = useMemo(() => branch ? semKeys.filter((s) => bHist[s]?.sgpa).length : 0, [branch, semKeys, bHist]);

  const totalBacklogs = useMemo(() => Object.values(bBacklogs).reduce((a, arr) => a + (arr?.length || 0), 0), [bBacklogs]);

  const curSubs = useMemo(() => (selSem && branch)
    ? [
        ...BRANCHES[branch].semesters[selSem].subjects
          .filter(s => !(bHiddenSubjects[selSem] || []).includes(s.code)),
        ...(bCustomSubjects[selSem] || []),
      ]
    : [], [selSem, branch, bHiddenSubjects, bCustomSubjects]);

  const liveRes = useMemo(() => (selSem && branch) ? calcSGPA(curSubs, marks) : null, [selSem, branch, curSubs, marks]);

  function subDisplayName(sub) {
    return bElectiveNames[sub.code] || sub.name;
  }

  async function addCustomSubject(semNumber, subject) {
    try {
      const { customSubjects: updated } = await apiAddCustomSubject(branch, semNumber, subject);
      setCustomSubjects(prev => ({
        ...prev,
        [branch]: {
          ...(prev[branch] || {}),
          [semNumber]: updated,
        },
      }));
    } catch (err) {
      console.error("addCustomSubject error:", err);
      throw err;
    }
  }

  async function removeCustomSubject(semNumber, code) {
    try {
      const { customSubjects: updated } = await apiRemoveCustomSubject(branch, semNumber, code);
      setCustomSubjects(prev => ({
        ...prev,
        [branch]: {
          ...(prev[branch] || {}),
          [semNumber]: updated,
        },
      }));
    } catch (err) {
      console.error("removeCustomSubject error:", err);
      throw err;
    }
  }

  async function toggleHiddenSubject(semNumber, code, hidden) {
    const getUpdatedHidden = (prev) => {
      const current = prev[branch]?.[semNumber] || [];
      const updated  = hidden
        ? [...current.filter(c => c !== code), code]
        : current.filter(c => c !== code);
      return {
        ...prev,
        [branch]: { ...(prev[branch] || {}), [semNumber]: updated },
      };
    };

    setHiddenSubjects(prev => getUpdatedHidden(prev));

    if (bHist[semNumber]?.marks) {
      const newHiddenCodes = hidden
        ? [...(bHiddenSubjects[semNumber] || []).filter(c => c !== code), code]
        : (bHiddenSubjects[semNumber] || []).filter(c => c !== code);

      const newSubs = BRANCHES[branch].semesters[semNumber].subjects
        .filter(s => !newHiddenCodes.includes(s.code));
      const customSubs = bCustomSubjects[semNumber] || [];
      const allSubs    = [...newSubs, ...customSubs];

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
        const reverted = hidden
          ? current.filter(c => c !== code)
          : [...current, code];
        return {
          ...prev,
          [branch]: { ...(prev[branch] || {}), [semNumber]: reverted },
        };
      });
      console.error("toggleHiddenSubject error:", err);
      throw err;
    }
  }

  const value = useMemo(
    () => ({
      screen,
      setScreen,
      tab,
      setTab,
      saveMsg,
      branch,
      setBranch,
      hist,
      bHist,
      backlogs,
      bBacklogs,
      electiveNames,
      bElectiveNames,
      lbOptIn,
      toggleLbOptIn,
      lbData,
      selSem,
      selectSem,
      marks,
      changeMark,
      saving,
      saveSem,
      deleteSemRecord,
      curSubs,
      liveRes,
      qSem,
      qVal,
      setQVal,
      qErr,
      openQuick,
      closeQuick,
      saveQuick,
      deleteQuick,
      showDisclaimer,
      setShowDisclaimer,
      targetCGPA,
      setTargetCGPA,
      targetResult,
      setTargetResult,
      runCalcTarget,
      predSem,
      setPredSem,
      predInt,
      setPredInt,
      predDesiredSGPA,
      setPredDesiredSGPA,
      semKeys,
      cgpa,
      doneSems,
      totalBacklogs,
      subDisplayName,
      toggleBacklog,
      setElectiveName,
      flashSave,
      c,
      dark,
      toggleDark,
      scoreClr,
      cardSty,
      inp,
      btn,
      user,
      setUser,
      logout,
      authErr,
      setAuthErr,
      authLoading,
      clearForm,
      googleLogin,
      bCustomSubjects,
      bHiddenSubjects,
      addCustomSubject,
      removeCustomSubject,
      toggleHiddenSubject,
    }),
    [
      screen, tab, saveMsg,
      branch, hist, bHist,
      backlogs, bBacklogs,
      electiveNames, bElectiveNames,
      lbOptIn, lbData,
      selSem, marks, saving,
      qSem, qVal, qErr,
      showDisclaimer,
      targetCGPA, targetResult,
      predSem, predInt, predDesiredSGPA,
      semKeys, cgpa, doneSems, totalBacklogs,
      user, setUser, logout,
      authErr, setAuthErr,
      authLoading, clearForm, googleLogin,
      dark, scoreClr, toggleDark, c,
      cardSty, inp, btn,
      bCustomSubjects, bHiddenSubjects,
      addCustomSubject, removeCustomSubject,
      toggleHiddenSubject,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}