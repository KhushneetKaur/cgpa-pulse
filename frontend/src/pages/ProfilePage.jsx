import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import UsernameSetupModal from "../components/UsernameSetupModal";

export default function ProfilePage() {
  const {
    user, setUser, logout, setScreen,
    cgpa, doneSems, totalBacklogs,
    lbOptIn, branch,
    c, dark, btn, inp, cardSty, scoreClr,
  } = useAppData();

  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day:   "numeric",
        month: "long",
        year:  "numeric",
      })
    : "—";

  // Safe fallback calculation for profile username cooling cycles
  const daysLeft = user?.usernameSetAt
    ? Math.max(0, 30 - Math.floor(
        (Date.now() - new Date(user.usernameSetAt).getTime())
        / (1000 * 60 * 60 * 24)
      ))
    : 0;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", paddingBottom: 24 }}>

      {/* ── Profile header card ───────────────────────────────── */}
      <div style={{
        ...cardSty(),
        marginBottom:   16,
        display:        "flex",
        alignItems:     "center",
        gap:            20,
        flexWrap:       "wrap",
      }}>
        {/* Avatar */}
        <div style={{
          width:          72,
          height:         72,
          borderRadius:   "50%",
          background:     "linear-gradient(135deg,#6d28d9,#a78bfa)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       28,
          fontWeight:     900,
          color:          "#fff",
          flexShrink:     0,
          boxShadow:      "0 8px 24px rgba(109,40,217,0.35)",
        }}>
          {user?.username?.[0]?.toUpperCase() || "?"}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin:       "0 0 2px",
            fontSize:     22,
            fontWeight:   800,
            color:        c.text,
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}>
            {user?.username || "Anonymous Student"}
          </p>
          <p style={{
            margin:   "0 0 8px",
            fontSize: 13,
            color:    c.sub,
          }}>
            {user?.email}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize:     11,
              padding:      "2px 8px",
              borderRadius: 99,
              background:   dark
                ? "rgba(124,131,245,0.15)"
                : "rgba(109,40,217,0.08)",
              color:        c.accent,
              fontWeight:   600,
            }}>
              {branch || "No branch set"}
            </span>
            <span style={{
              fontSize:     11,
              padding:      "2px 8px",
              borderRadius: 99,
              background:   dark
                ? "rgba(45,212,170,0.1)"
                : "rgba(5,150,105,0.07)",
              color:        c.ok,
              fontWeight:   500,
            }}>
              Joined {joinDate}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap:                 10,
        marginBottom:        16,
      }}>
        {[
          {
            label: "Overall CGPA",
            value: cgpa || "—",
            color: cgpa ? scoreClr(cgpa) : c.muted,
            icon:  "🎯",
          },
          {
            label: "Semesters Done",
            value: `${doneSems || 0}/8`,
            color: doneSems === 8 ? c.ok : c.accent,
            icon:  "📚",
          },
          {
            label: "Backlogs",
            value: totalBacklogs || "0",
            color: totalBacklogs > 0 ? c.bad : c.ok,
            icon:  totalBacklogs > 0 ? "⚠️" : "✓",
          },
        ].map(s => (
          <div key={s.label} style={{
            ...cardSty(),
            padding:   "14px 12px",
            textAlign: "center",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 18 }}>{s.icon}</p>
            <p style={{
              margin:     0,
              fontSize:   22,
              fontWeight: 800,
              color:      s.color,
            }}>
              {s.value}
            </p>
            <p style={{
              margin:   "2px 0 0",
              fontSize: 10,
              color:    c.muted,
              textTransform: "uppercase",
              letterSpacing: 0.3,
            }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Account settings ──────────────────────────────────── */}
      <div style={{ ...cardSty(), marginBottom: 16 }}>
        <p style={{
          margin:        "0 0 14px",
          fontSize:      11,
          fontWeight:    700,
          color:         c.muted,
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}>
          Account Settings
        </p>

        {/* Username row */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "12px 0",
          borderBottom:   `1px solid ${c.border}`,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: c.text }}>
              Username
            </p>
            <p style={{ margin: 0, fontSize: 12, color: c.sub }}>
              @{user?.username || "setup_needed"}
              {daysLeft > 0 && (
                <span style={{ color: c.muted, marginLeft: 6 }}>
                  · Change in {daysLeft}d
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowUsernameModal(true)}
            disabled={daysLeft > 0}
            style={{
              ...btn("ghost"),
              fontSize: 12,
              opacity:  daysLeft > 0 ? 0.4 : 1,
              cursor:   daysLeft > 0 ? "not-allowed" : "pointer",
            }}
          >
            {daysLeft > 0 ? `${daysLeft}d left` : "Change"}
          </button>
        </div>

        {/* Leaderboard row */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "12px 0",
          borderBottom:   `1px solid ${c.border}`,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: c.text }}>
              Leaderboard status
            </p>
            <p style={{ margin: 0, fontSize: 12, color: c.sub }}>
              {lbOptIn
                ? "Your CGPA is visible to others"
                : "Your CGPA is private"}
            </p>
          </div>
          <span style={{
            fontSize:     12,
            padding:      "4px 10px",
            borderRadius: 99,
            background:   lbOptIn
              ? dark ? "rgba(45,212,170,0.12)" : "rgba(5,150,105,0.08)"
              : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            color:        lbOptIn ? c.ok : c.muted,
            fontWeight:   600,
          }}>
            {lbOptIn ? "Opted in" : "Private"}
          </span>
        </div>

        {/* Google account row */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "12px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: c.text }}>
                Google Account
              </p>
              <p style={{ margin: 0, fontSize: 12, color: c.sub }}>
                {user?.email}
              </p>
            </div>
          </div>
          <span style={{
            fontSize:     11,
            color:        c.ok,
            fontWeight:   600,
          }}>
            ✓ Connected
          </span>
        </div>
      </div>

      {/* ── Danger zone ───────────────────────────────────────── */}
      <div style={{ ...cardSty(), marginBottom: 16 }}>
        <p style={{
          margin:        "0 0 14px",
          fontSize:      11,
          fontWeight:    700,
          color:         c.muted,
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}>
          Session
        </p>
        <button
          onClick={() => { logout(); setScreen("login"); }}
          style={{
            ...btn("danger"),
            width:   "100%",
            padding: "12px",
            justifyContent: "center",
          }}
        >
          Sign out of CGPA Pulse
        </button>
      </div>

      {/* ── About section ─────────────────────────────────────── */}
      <div style={{
        ...cardSty(),
        textAlign:  "center",
        padding:    "20px",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, color: c.muted }}>
          Built with ✨ by
        </p>
        <p style={{
          margin:     "0 0 2px",
          fontSize:   16,
          fontWeight: 800,
          color:      c.accent,
        }}>
          Khushneet Kaur
        </p>
        <p style={{
          margin:   "0 0 12px",
          fontSize: 11,
          color:    c.sub,
        }}>
          CSE · GZSCCET · MRSPTU Bathinda
        </p>
        <p style={{
          margin:   0,
          fontSize: 10,
          color:    c.muted,
          lineHeight: 1.7,
        }}>
          Unofficial · Not affiliated with MRSPTU · Free forever
        </p>
      </div>

      {/* Username modal */}
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
    </div>
  );
}