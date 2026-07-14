import { AuthProvider }    from "./context/AuthContext";
import { ThemeProvider }   from "./context/ThemeContext";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import { BRANCHES }        from "./data/branches";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";

// Pages
import LoginPage       from "./pages/login/LoginPage";
import CalculatorPage  from "./pages/CalculatorPage";
import HistoryPage     from "./pages/HistoryPage";
import TargetPage      from "./pages/TargetPage";
import PredictorPage   from "./pages/PredictorPage";
import BacklogsPage    from "./pages/BacklogsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import GradeTablePage  from "./pages/GradeTablePage";

// Components
import NavBar            from "./components/NavBar";
import DisclaimerBanner  from "./components/DisclaimerBanner";
import DisclaimerModal   from "./components/DisclaimerModal";
import QuickSGPAModal    from "./components/QuickSGPAModal";
import BranchSelect      from "./components/BranchSelect";
import SummaryCards      from "./components/SummaryCards";
import MRSPTULogo        from "./components/MRSPTULogo";
import UsernameSetupModal from "./components/UsernameSetupModal";

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
        minHeight:      "100vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        background:     c.bg,
      }}>
        <div style={{
          width:        36,
          height:       36,
          borderRadius: "50%",
          border:       "3px solid rgba(124,58,237,0.2)",
          borderTop:    "3px solid #7c3aed",
          animation:    "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  if (screen === "login") return <LoginPage />;
  return <AppLayout />;
}

function AppLayout() {
   const { user, branch, tab, c, dark, inp, btn, setUser } = useAppData();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
const [hasShownUsernameModal, setHasShownUsernameModal] = useState(false);
 
useEffect(() => {
  if (
    user &&
    user.googleId &&        // only Google users
    !user.usernameSetAt &&  // who haven't set username yet
    !hasShownUsernameModal
  ) {
    setShowUsernameModal(true);
    setHasShownUsernameModal(true);
  }
}, [user]);

  function handleUsernameDone(updatedUser) {
  setShowUsernameModal(false);
  if (updatedUser) setUser(updatedUser);  // ← update context immediately
}

  return (
    <div style={{
      minHeight:     "100vh",
      background:    c.bg,
      color:         c.text,
      display:       "flex",
      flexDirection: "column",
    }}>

      {/* Toast container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontFamily:   "inherit",
            fontSize: "15px",
            padding:  "14px 18px",
            fontWeight:   500,
            background:   dark ? "#0f1424" : "#fff",
            color:        dark ? "#eceef8" : "#1e1b4b",
            border:       `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`,
            boxShadow:    dark
              ? "0 8px 32px rgba(0,0,0,0.4)"
              : "0 8px 32px rgba(109,40,217,0.1)",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
            duration:  3000,
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
            duration:  4000,
          },
        }}
      />

      <DisclaimerModal />
      <QuickSGPAModal />
      <NavBar />

  {/* Username setup for new Google users */}
      {showUsernameModal && (
        <UsernameSetupModal
          dark={dark}
          c={c}
          btn={btn}
          inp={inp}
          user={user}
          onDone={handleUsernameDone}
          isChange={false}
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
            <TabContent tab={tab} />
          </>
        )}
      </main>
    </div>
  );
}

function TabContent({ tab }) {
  switch (tab) {
    case "calculator":  return <CalculatorPage  />;
    case "history":     return <HistoryPage     />;
    case "target":      return <TargetPage      />;
    case "predictor":   return <PredictorPage   />;
    case "backlogs":    return <BacklogsPage    />;
    case "leaderboard": return <LeaderboardPage />;
    case "grade table": return <GradeTablePage  />;
    default:            return <CalculatorPage  />;
  }
}
