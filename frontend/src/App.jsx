import React, { useState, useEffect, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import { BRANCHES } from "./data/branches";
import { Toaster } from "react-hot-toast";

// Core Layout Components
import NavBar from "./components/NavBar";
import DisclaimerBanner from "./components/DisclaimerBanner";
import DisclaimerModal from "./components/DisclaimerModal";
import QuickSGPAModal from "./components/QuickSGPAModal";
import BranchSelect from "./components/BranchSelect";
import SummaryCards from "./components/SummaryCards";
import MRSPTULogo from "./components/MRSPTULogo";
import UsernameSetupModal from "./components/UsernameSetupModal";
import BottomTabBar from "./components/BottomTabBar";
import OnboardingModal from "./components/OnboardingModal";

// Code Splitting Definitions
const LoginPage = React.lazy(() => import("./pages/login/LoginPage"));
const CalculatorPage = React.lazy(() => import("./pages/CalculatorPage"));
const HistoryPage = React.lazy(() => import("./pages/HistoryPage"));
const TargetPage = React.lazy(() => import("./pages/TargetPage"));
const PredictorPage = React.lazy(() => import("./pages/PredictorPage"));
const BacklogsPage = React.lazy(() => import("./pages/BacklogsPage"));
const LeaderboardPage = React.lazy(() => import("./pages/LeaderboardPage"));
const GradeTablePage = React.lazy(() => import("./pages/GradeTablePage"));

// Background Preloading Utility Function
const preloadComponent = (importFn) => {
  importFn().catch(() => {});
};

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
  const { screen, authLoading, user, googleProcessing, c } = useAppData();

  if (authLoading || (user && screen === "login")) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: c.bg,
      }}>
        {/* Lighter, zero-dependency inline loader definition */}
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

  return (
    <Suspense fallback={null}>
      {screen === "login" ? <LoginPage /> : <AppLayout />}
    </Suspense>
  );
}

function AppLayout() {
  const {
    user, branch, tab,
    c, dark, inp, btn,
    setUser, setBranch, selectSem,
  } = useAppData();

  const [showOnboarding,     setShowOnboarding]     = useState(false);
  const [showUsernameModal,  setShowUsernameModal]  = useState(false);
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);

  useEffect(() => {
    if (user && user.googleId && !user.usernameSetAt && !hasShownOnboarding) {
      setShowOnboarding(true);
      setHasShownOnboarding(true);
    }
  }, [user]);

  async function handleOnboardingDone(chosenUsername, chosenBranch) {
    setShowOnboarding(false);
    try {
      const { apiGetProfile } = await import("./services/user.api.js");
      const updatedUser = await apiGetProfile();
      setUser(updatedUser);
      setBranch(chosenBranch);
      if (chosenSem) selectSem(chosenSem);
    } catch {
      // will refresh on next load
    }
  }

  return (
    <div style={{
      minHeight:     "100vh",
      background:    c.bg,
      color:         c.text,
      display:       "flex",
      flexDirection: "column",
    }}>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontFamily:   "inherit",
            fontSize:     "15px",
            padding:      "14px 18px",
            fontWeight:   500,
            background:   dark ? "#0f1424" : "#fff",
            color:        dark ? "#eceef8" : "#1e1b4b",
            border:       `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`,
            boxShadow:    dark
              ? "0 8px 32px rgba(0,0,0,0.4)"
              : "0 8px 32px rgba(109,40,217,0.1)",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" }, duration: 3000 },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" }, duration: 4000 },
        }}
      />

      <DisclaimerModal />
      <QuickSGPAModal />
      <NavBar />

      {/* Onboarding — new Google users only, first login */}
      {showOnboarding && (
        <OnboardingModal
          dark={dark}
          c={c}
          btn={btn}
          inp={inp}
          user={user}
          onDone={handleOnboardingDone}
        />
      )}

      {/* Username change — existing users via navbar */}
      {showUsernameModal && (
        <UsernameSetupModal
          dark={dark}
          c={c}
          btn={btn}
          inp={inp}
          user={user}
          onDone={updatedUser => {
            setShowUsernameModal(false);
            if (updatedUser) setUser(updatedUser);
          }}
          isChange={true}
        />
      )}

      <main style={{
        flex:     1,
        maxWidth: 1080,
        margin:   "0 auto",
        width:    "100%",
        padding:  "1.5rem 1.25rem 2rem",
      }}>
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