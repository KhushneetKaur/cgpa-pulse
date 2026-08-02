import { memo, useEffect, useCallback } from "react";

// ── Static data ───────────────────────────────────────────────────────────────
const TECH_STACK = [
  "React.js (SPA)",
  "Node.js Runtime",
  "REST Architecture",
  "NoSQL BSON Modeling",
  "State Management",
  "Stateless Auth (JWT)",
  "Google OAuth 2.0",
  "PWA / Service Worker",
];

const SYSTEM_STATS = [
  { label: "Branches Supported", value: "7" },
  { label: "Semesters Tracked",  value: "8" },
  { label: "Core Modules",       value: "7+" },
];

const LINKS = [
  {
    icon:       "⌥",
    label:      "GitHub",
    sub:        "View source / repos",
    href:       "https://github.com/khushneetkaur",
    colorDark:  "#67e8f9",
    colorLight: "#0ea5e9",
  },
  {
    icon:       "in",
    label:      "LinkedIn",
    sub:        "Professional profile",
    href:       "https://www.linkedin.com/in/khushneet",
    colorDark:  "#a78bfa",
    colorLight: "#8b5cf6",
  },
];

// Static terminal chrome — never recreated
const TerminalDots = (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginLeft: 10, letterSpacing: 0.5 }}>
      dev_console.sh
    </span>
  </div>
);

// ── Link row — memoized, color computed once ─────────────────────────────────
const LinkRow = memo(function LinkRow({ link, dark }) {
  const color = dark ? link.colorDark : link.colorLight;
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            12,
        padding:        "11px 14px",
        borderRadius:   10,
        background:     "rgba(255,255,255,0.02)",
        border:         "1px solid rgba(255,255,255,0.08)",
        textDecoration: "none",
        transition:     "all 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background   = "rgba(255,255,255,0.05)";
        e.currentTarget.style.borderColor  = color;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background  = "rgba(255,255,255,0.02)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <span style={{
        width:          26, height: 26, borderRadius: 6,
        background:     `${color}15`, border: `1px solid ${color}40`,
        display:        "flex", alignItems: "center", justifyContent: "center",
        fontSize:       12, fontWeight: 700, color, flexShrink: 0,
      }}>
        {link.icon}
      </span>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color }}>{link.label}</p>
        <p style={{ margin: "1px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{link.sub}</p>
      </div>
      <span style={{ marginLeft: "auto", fontSize: 13, color: "rgba(255,255,255,0.2)" }}>→</span>
    </a>
  );
});

// ── Command prompt line ────────────────────────────────────────────
function CmdLine({ cmd }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
      <span style={{ color: "#10b981", fontSize: 13 }}>$</span>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{cmd}</span>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function AboutModal({ onClose, dark }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position:             "fixed",
        inset:                0,
        zIndex:               400,
        background:           "rgba(0,0,0,0.7)",
        backdropFilter:       "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display:              "flex",
        alignItems:           "center",
        justifyContent:       "center",
        padding:              "1rem",
        animation:            "fadeUp 0.2s ease both",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position:        "relative",
          maxWidth:        480,
          width:           "100%",
          borderRadius:    18,
          background:      "#0a0c16",
          border:          "1px solid rgba(16,185,129,0.3)",
          boxShadow:       "0 30px 90px rgba(0,0,0,0.6)",
          maxHeight:       "90vh",
          overflowY:       "auto",
          scrollbarWidth:  "none",
          fontFamily:      "monospace",
        }}
      >
        {/* Scoped scrollbar hide — only targets this element */}
        <style>{`
          .about-modal-inner::-webkit-scrollbar { display: none; }
        `}</style>

        {/* Terminal header */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "12px 18px",
          borderBottom:   "1px solid rgba(255,255,255,0.08)",
          background:     "rgba(255,255,255,0.02)",
        }}>
          {TerminalDots}
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none",
              color: "rgba(255,255,255,0.5)", fontSize: 18,
              cursor: "pointer", lineHeight: 1,
              fontFamily: "inherit", padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="about-modal-inner" style={{ padding: "28px 26px" }}>

          {/* whoami */}
          <CmdLine cmd="whoami" />
          <h2 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 800, letterSpacing: 0.5, color: "#10b981", textTransform: "uppercase" }}>
            System Architect: Khushneet Kaur
          </h2>
          <p style={{ margin: "0 0 22px", fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.6)" }}>
            Designed and engineered as a secure, responsive analytics engine to
            eliminate fragmented grade tracking across 7 engineering branches at
            MRSPTU, Bathinda.
          </p>

          {/* System stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 24 }}>
            {SYSTEM_STATS.map(s => (
              <div key={s.label} style={{ textAlign: "center", padding: "12px 8px", background: "rgba(16,185,129,0.06)", borderRadius: 10, border: "1px solid rgba(16,185,129,0.15)" }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#10b981", letterSpacing: -0.5 }}>{s.value}</p>
                <p style={{ margin: "3px 0 0", fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tech stack */}
          <CmdLine cmd="cat tech_stack.json" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 26 }}>
            {TECH_STACK.map(tech => (
              <span key={tech} style={{ fontSize: 11, fontWeight: 600, color: "#67e8f9", background: "rgba(103,232,249,0.08)", border: "1px solid rgba(103,232,249,0.22)", borderRadius: 6, padding: "4px 10px", letterSpacing: 0.2 }}>
                {tech}
              </span>
            ))}
          </div>

          {/* Links */}
          <CmdLine cmd="netstat --ports" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LINKS.map(link => (
              <LinkRow key={link.label} link={link} dark={dark} />
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
            connection secure · session encrypted · build v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}