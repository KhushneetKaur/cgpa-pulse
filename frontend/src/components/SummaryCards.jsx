import { useAppData } from "../context/AppDataContext";
import { cgpaToPercentage } from "../utils/calculations";
import SkeletonCard from "./SkeletonCard";

// The 4 stat cards shown at the top of the app dashboard.
// Updates live as the student enters marks.

export default function SummaryCards() {
  const {
    cgpa,
    doneSems,
    selSem,
    liveRes,
    totalBacklogs,
    c,
    dark,
    scoreClr,
    authLoading,
  } = useAppData();

  const percentage = cgpaToPercentage(cgpa);

  if (authLoading) {
    return (
      <div
        className="summary-cards-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[1, 2, 3, 4].map(i => (
          <SkeletonCard key={i} dark={dark} rows={2} height={88} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Overall CGPA",
      value: cgpa || "—",
      sub: cgpa ? `${percentage}% equivalent` : null,
      hi: cgpa ? true : false,
      hiColor: cgpa ? scoreClr(cgpa) : c.text,
    },
    {
      label: "Semesters Saved",
      value: `${doneSems} / 8`,
      sub: doneSems === 8 ? "All semesters complete 🎉" : null,
      hi: false,
    },
    {
      label: "Backlogs",
      value: totalBacklogs > 0 ? totalBacklogs : "None",
      sub: totalBacklogs > 0 ? "Tap Backlogs tab to view" : "Clean record ✓",
      hi: false,
      red: totalBacklogs > 0,
    },
    {
      label: "Live SGPA",
      value: liveRes
        ? liveRes.isPartial
          ? `~${liveRes.sgpa}`
          : liveRes.sgpa
        : "—",
      sub: liveRes?.isPartial
        ? `${liveRes.filled}/${liveRes.total} subjects filled`
        : liveRes
        ? "All subjects filled"
        : selSem
        ? "Enter marks to preview"
        : "Select a semester",
      hi: liveRes?.sgpa ? true : false,
      hiColor: liveRes ? scoreClr(liveRes.sgpa) : c.text,
      partial: liveRes?.isPartial,
    },
  ];

  return (
    <div
      className="summary-cards-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
        gap: 10,
        marginBottom: 20,
      }}
    >
      {cards.map((card) => (
        <Card key={card.label} card={card} c={c} />
      ))}
    </div>
  );
}

// ─── Individual card ──────────────────────────────────────────────────────────
function Card({ card, c }) {
  // Dynamically matches the background boundary to the text's score color
  const borderColor = card.red
    ? `${c.bad}44`
    : card.hi
    ? `${card.hiColor}33`
    : c.border;

  // Gives CGPA and SGPA distinct background glows based on performance
  const bgColor = card.red
    ? `${c.bad}11`
    : card.hi
    ? `${card.hiColor}0c` // Elegant 4-5% alpha tint matching their actual grade score color
    : c.hover;

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 10,
        padding: "12px 14px",
        border: `1px solid ${borderColor}`,
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* Label */}
      <p
        style={{
          fontSize: 11,
          color: c.sub,
          margin: "0 0 4px",
          fontWeight: 500,
        }}
      >
        {card.label}
      </p>

      {/* Main value */}
      <p
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: 0,
          color: card.red ? c.bad : card.hiColor || c.text,
        }}
      >
        {card.value}
      </p>

      {/* Sub text */}
      {card.sub && (
        <p
          style={{
            margin: "3px 0 0",
            fontSize: 11,
            color: card.red
              ? c.bad
              : card.partial
              ? c.accentTxt // Replaced bad/purple with your crisp, readable theme accent text
              : card.hi
              ? card.hiColor // Subtext follows score color for perfect matching
              : c.muted,
            fontWeight: card.hi ? 500 : 400,
          }}
        >
          {card.sub}
        </p>
      )}
    </div>
  );
}