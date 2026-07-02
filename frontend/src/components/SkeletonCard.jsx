export default function SkeletonCard({ dark, rows = 3, height = 180 }) {
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
        position:   "absolute",
        inset:      0,
        background: dark
          ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)"
          : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation:  "shimmer 1.5s infinite",
      }} />

      {/* Fake content rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height:       14,
          borderRadius: 7,
          marginBottom: 14,
          width:        i === 0 ? "60%" : i === rows - 1 ? "40%" : "90%",
          background:   dark
            ? "rgba(255,255,255,0.07)"
            : "rgba(0,0,0,0.07)",
        }} />
      ))}
    </div>
  );
}