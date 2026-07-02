export default function LeaderboardOptInModal({ dark, c, btn, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position:             "fixed",
        inset:                0,
        zIndex:               500,
        background:           "rgba(0,0,0,0.65)",
        backdropFilter:       "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display:              "flex",
        alignItems:           "center",
        justifyContent:       "center",
        padding:              "1rem",
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:   c.card,
          border:       `1px solid ${c.border}`,
          borderRadius: 16,
          padding:      "28px 24px",
          maxWidth:     440,
          width:        "100%",
          boxShadow:    dark
            ? "0 20px 60px rgba(0,0,0,0.6)"
            : "0 20px 60px rgba(109,40,217,0.15)",
        }}
      >
        {/* Header */}
        <p style={{
          margin:     "0 0 6px",
          fontSize:   18,
          fontWeight: 800,
          color:      c.text,
        }}>
          🏆 Join the Leaderboard
        </p>
        <p style={{
          margin:   "0 0 20px",
          fontSize: 13,
          color:    c.sub,
        }}>
          Your CGPA will be visible to all CGPA Pulse users.
        </p>

        {/* Disclaimer box */}
        <div style={{
          padding:      "14px 16px",
          background:   dark
            ? "rgba(148,163,184,0.08)"
            : "rgba(217,119,6,0.05)",
          border:       `1px solid ${dark
            ? "rgba(148,163,184,0.2)"
            : "rgba(217,119,6,0.15)"}`,
          borderRadius: 10,
          marginBottom: 20,
        }}>
          <p style={{
            margin:     "0 0 10px",
            fontSize:   13,
            fontWeight: 700,
            color:      dark ? "#94a3b8" : "#92400e",
          }}>
            Before you opt in, please read:
          </p>
          <ul style={{
            margin:      0,
            paddingLeft: 18,
            fontSize:    13,
            color:       c.sub,
            lineHeight:  1.8,
          }}>
            <li>
              Your <strong style={{ color: c.text }}>username</strong> and{" "}
              <strong style={{ color: c.text }}>CGPA</strong> will be
              visible to all students using CGPA Pulse.
            </li>
            <li>
              Your branch will also be shown alongside your CGPA.
            </li>
            <li style={{ color: dark ? "#94a3b8" : "#92400e", fontWeight: 600 }}>
           Once opted in, you cannot opt out for{" "}
             <strong>30 days</strong>. After that, click the same
            button again to opt out.
            </li>
           
          </ul>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              ...btn("ghost"),
              flex: 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...btn("primary"),
              flex:    2,
              padding: "10px 16px",
            }}
          >
            ✓ I understand — Opt In
          </button>
        </div>
      </div>
    </div>
  );
}