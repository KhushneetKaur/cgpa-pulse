import { AuthProvider }    from "./context/AuthContext";
import { ThemeProvider }   from "./context/ThemeContext";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import { BRANCHES }        from "./data/branches";
import { Toaster } from "react-hot-toast";

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
  const { screen, authLoading, c } = useAppData();

  // Show nothing while checking cookie session
  // prevents flash of login screen on refresh
  if (authLoading) {
    return (
      <div style={{
        minHeight:      "100vh",
        background:     c.bg,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexDirection:  "column",
        gap:            16,
      }}>
        <div style={{
          width:        40,
          height:       40,
          borderRadius: "50%",
          border:       `3px solid ${c.border}`,
          borderTop:    `3px solid ${c.accent}`,
          animation:    "spin 0.8s linear infinite",
        }} />
        <p style={{ color: c.muted, fontSize: 13 }}>
          Loading...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (screen === "login") return <LoginPage />;
  return <AppLayout />;
}

function AppLayout() {
  const { branch, tab, c, dark } = useAppData(); // ← add dark

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
