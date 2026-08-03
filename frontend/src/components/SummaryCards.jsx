import { memo, useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { useTheme } from "../context/ThemeContext";
import { cgpaToPercentage } from "../utils/calculations";
import SkeletonCard from "./SkeletonCard";

const SKELETON_KEYS   = [1, 2, 3, 4];
const GRID_STYLE = {
  display:             "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
  gap:                 10,
  marginBottom:        20,
};

export default function SummaryCards() {
  const {
    cgpa, doneSems, selSem,
    liveRes, totalBacklogs, authLoading,
  } = useAppData();

  const { c, dark, scoreClr } = useTheme();

  // Memoize derived values
  const percentage = useMemo(() => cgpaToPercentage(cgpa), [cgpa]);

  const cards = useMemo(() => [
    {
      label:   "Overall CGPA",
      value:   cgpa || "—",
      sub:     cgpa ? `${percentage}% equivalent` : null,
      hi:      !!cgpa,
      hiColor: cgpa ? scoreClr(cgpa) : c.text,
    },
    {
      label: "Semesters Saved",
      value: `${doneSems} / 8`,
      sub:   doneSems === 8 ? "All semesters complete 🎉" : null,
      hi:    false,
    },
    {
      label: "Backlogs",
      value: totalBacklogs > 0 ? totalBacklogs : "None",
      sub:   totalBacklogs > 0 ? "Tap Backlogs tab to view" : "Clean record ✓",
      hi:    false,
      red:   totalBacklogs > 0,
    },
    {
      label:   "Live SGPA",
      value:   liveRes
        ? liveRes.isPartial ? `~${liveRes.sgpa}` : liveRes.sgpa
        : "—",
      sub:     liveRes?.isPartial
        ? `${liveRes.filled}/${liveRes.total} subjects filled`
        : liveRes ? "All subjects filled"
        : selSem ? "Enter marks to preview"
        : "Select a semester",
      hi:      !!liveRes?.sgpa,
      hiColor: liveRes ? scoreClr(liveRes.sgpa) : c.text,
      partial: liveRes?.isPartial,
    },
  ], [cgpa, percentage, doneSems, totalBacklogs, liveRes, selSem, c, scoreClr]);

  if (authLoading) {
    return (
      <div className="summary-cards-grid" style={GRID_STYLE}>
        {SKELETON_KEYS.map(i => (
          <SkeletonCard key={i}  rows={2} height={88} />
        ))}
      </div>
    );
  }

  return (
    <div className="summary-cards-grid" style={GRID_STYLE}>
      {cards.map(card => <Card key={card.label} card={card} />)}
    </div>
  );
}

// ── Individual card  ────────────────────────────
const Card = memo(function Card({ card }) {
  const { c } = useTheme();

  const borderColor = card.red
    ? `${c.bad}44`
    : card.hi
    ? `${card.hiColor}33`
    : c.border;

  const bgColor = card.red
    ? `${c.bad}11`
    : card.hi
    ? `${card.hiColor}0c`
    : c.hover;

  return (
    <div style={{
      background:   bgColor,
      borderRadius: 10,
      padding:      "12px 14px",
      border:       `1px solid ${borderColor}`,
      transition:   "all 0.2s ease-in-out",
    }}>
      <p style={{ fontSize: 11, color: c.sub, margin: "0 0 4px", fontWeight: 500 }}>
        {card.label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: card.red ? c.bad : card.hiColor || c.text }}>
        {card.value}
      </p>
      {card.sub && (
        <p style={{
          margin:     "3px 0 0",
          fontSize:   11,
          fontWeight: card.hi ? 500 : 400,
          color:      card.red
            ? c.bad
            : card.partial
            ? c.accentTxt
            : card.hi
            ? card.hiColor
            : c.muted,
        }}>
          {card.sub}
        </p>
      )}
    </div>
  );
});