import React, { useState, useEffect, Suspense, useCallback } from "react";
import { AuthProvider }             from "./context/AuthContext";
import { ThemeProvider, useTheme }  from "./context/ThemeContext";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import { Toaster }                  from "react-hot-toast";

import NavBar              from "./components/NavBar";
import DisclaimerModal     from "./components/DisclaimerModal";
import QuickSGPAModal      from "./components/QuickSGPAModal";
import BranchSelect        from "./components/BranchSelect";
import SummaryCards        from "./components/SummaryCards";
import UsernameSetupModal  from "./components/UsernameSetupModal";
import BottomTabBar        from "./components/BottomTabBar";
import OnboardingModal     from "./components/OnboardingModal";
import InstallPromptToast  from "./components/InstallPromptToast";

const LoginPage      = React.lazy(() => import("./pages/login/LoginPage"));
const CalculatorPage = React.lazy(() => import("./pages/CalculatorPage"));
const HistoryPage    = React.lazy(() => import("./pages/HistoryPage"));
const TargetPage     = React.lazy(() => import("./pages/TargetPage"));
const PredictorPage  = React.lazy(() => import("./pages/PredictorPage"));
const BacklogsPage   = React.lazy(() => import("./pages/BacklogsPage"));
const LeaderboardPage = React.lazy(() => import("./pages/LeaderboardPage"));
const GradeTablePage = React.lazy(() => import("./pages/GradeTablePage"));

// ── Spinner — extracted so it's not recreated on every render ─────────────────
function Spinner({ bg }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg || "#0a0c16" }}>
      <svg width="36" height="36" viewBox="0 0 38 38" stroke="#7c3aed" style={{ animation: "spin 0.8s linear infinite" }}>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        <g fill="none" fillRule="evenodd">
          <g transform="translate(1 1)" strokeWidth="3">
            <circle strokeOpacity=".2" cx="18" cy="18" r="18"/>
            <path d="M36 18c0-9.94-8.06-18-18-18"/>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppDataProvider>
          <Shell />
        </AppDataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function Shell() {
  const { screen, authLoading, user } = useAppData();
  const { c } = useTheme();

  // Show spinner while:
  // 1. Auth is resolving (authLoading)
  // 2. User is set but AppDataContext hasn't finished loadUserData yet (user && screen !== "app")
  if (authLoading || (user && screen !== "app")) {
    return <Spinner bg={c?.bg} />;
  }

  return (
    <Suspense fallback={null}>
      {screen === "app" ? <AppLayout /> : <LoginPage />}
    </Suspense>
  );
}

function AppLayout() {
  const { user, branch, tab, setUser, setBranch, selectSem } = useAppData();
  const { c, dark }  = useTheme();

  const [showOnboarding,     setShowOnboarding]     = useState(false);
  const [showUsernameModal,  setShowUsernameModal]  = useState(false);
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);

  // Trigger onboarding for new users — branch is null until onboarding completes
  useEffect(() => {
    if (!user || hasShownOnboarding) return;
    if (!user.branch) {
      setShowOnboarding(true);
      setHasShownOnboarding(true);
    }
  }, [user, hasShownOnboarding]);

  const handleOnboardingDone = useCallback(async (chosenUsername, chosenBranch, chosenSem) => {
    if (chosenBranch) setBranch(chosenBranch);
    if (chosenSem)    selectSem(chosenSem);
    try {
      const { apiGetProfile } = await import("./services/user.api.js");
      const updatedUser = await apiGetProfile();
      if (updatedUser) setUser(updatedUser);
    } catch (e) {
      console.error("Failed to refetch profile after onboarding:", e);
    } finally {
      setShowOnboarding(false);
    }
  }, [setBranch, selectSem, setUser]);

  const handleUsernameDone = useCallback((updatedUser) => {
    setShowUsernameModal(false);
    if (updatedUser) setUser(updatedUser);
  }, [setUser]);

  return (
    <div style={{ minHeight: "100vh", background: c?.bg, color: c?.text, display: "flex", flexDirection: "column" }}>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontFamily:   "inherit",
            fontSize:     "14px",
            fontWeight:   500,
            background:   dark ? "#0f1424" : "#fff",
            color:        dark ? "#eceef8" : "#1e1b4b",
            border:       `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`,
            boxShadow:    dark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(109,40,217,0.1)",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" }, duration: 3000 },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" }, duration: 4000 },
        }}
      />

      <DisclaimerModal />
      <QuickSGPAModal />
      <NavBar />

      {showOnboarding && (
        <OnboardingModal user={user} onDone={handleOnboardingDone} />
      )}

      {showUsernameModal && (
        <UsernameSetupModal user={user} onDone={handleUsernameDone} isChange={true} />
      )}

      <main style={{ flex: 1, maxWidth: 1080, margin: "0 auto", width: "100%", padding: "1.5rem 1.25rem 2rem" }}>
        {!branch ? (
          <BranchSelect />
        ) : (
          <>
            <SummaryCards />
            <Suspense fallback={null}>
              <TabContent tab={tab} />
            </Suspense>
          </>
        )}
      </main>

      <InstallPromptToast />
      <BottomTabBar />
    </div>
  );
}

function TabContent({ tab }) {
  switch (tab) {
    case "calculator":  return <CalculatorPage />;
    case "history":     return <HistoryPage />;
    case "target":      return <TargetPage />;
    case "predictor":   return <PredictorPage />;
    case "backlogs":    return <BacklogsPage />;
    case "leaderboard": return <LeaderboardPage />;
    case "grade table": return <GradeTablePage />;
    default:            return <CalculatorPage />;
  }
}