import { memo, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";

const SkeletonCard = memo(function SkeletonCard({ rows = 3, height = 180 }) {
  const { dark } = useTheme();

  // Memoize row widths — only recomputes when rows changes
  const rowWidths = useMemo(
    () => Array.from({ length: rows }, (_, i) =>
      i === 0 ? "60%" : i === rows - 1 ? "40%" : "90%"
    ),
    [rows]
  );

  return (
    <div style={{
      background:   dark ? "#0f1424" : "#ffffff",
      border:       `1px solid ${dark ? "#1e2540" : "#e4e2f0"}`,
      borderRadius: 16,
      padding:      "20px 22px",
      height,
      overflow:     "hidden",
      position:     "relative",
    }}>
      {/* Shimmer overlay */}
      <div style={{
        position:       "absolute",
        inset:          0,
        background:     dark
          ? "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)"
          : "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.6) 50%,transparent 100%)",
        backgroundSize: "200% 100%",
        animation:      "shimmer 1.5s infinite",
      }} />

      {/* Fake rows */}
      {rowWidths.map((width, i) => (
        <div key={i} style={{
          height:       14,
          borderRadius: 7,
          marginBottom: 14,
          width,
          background:   dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
        }} />
      ))}
    </div>
  );
});

export default SkeletonCard;