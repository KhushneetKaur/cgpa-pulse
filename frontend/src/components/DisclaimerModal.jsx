import { useAppData } from "../context/AppDataContext";

export default function DisclaimerModal() {
  const { showDisclaimer, setShowDisclaimer, dark, c, btn } = useAppData();

  if (!showDisclaimer) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: dark
          ? "rgba(0,0,0,0.72)"
          : "rgba(30,27,75,0.34)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 500,
      }}
      onClick={() => setShowDisclaimer(false)}
    >
      <div
        style={{
          padding: "22px 24px",
          border: `1px solid ${c.border}`,
          borderRadius: 14,
          background: c.card,
          color: c.text,
          boxShadow: dark
            ? "0 18px 56px rgba(0,0,0,0.55)"
            : "0 18px 56px rgba(109,40,217,0.16)",
          maxWidth: 560,
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          margin: "0 0 12px",
          fontSize: 18,
          fontWeight: 700,
          color: c.text,
        }}>
          Disclaimer
        </h3>

        <p style={{ margin: "8px 0", fontSize: 14, lineHeight: 1.65, color: c.sub }}>
          This calculator helps estimate your SGPA / CGPA based on marks and
          branch structure. It is <strong style={{ color: c.text }}>not official data</strong>{" "}
          from MRSPTU and should be used for guidance only.
        </p>

        <p style={{ margin: "8px 0", fontSize: 14, lineHeight: 1.65, color: c.sub }}>
          Please verify final SGPA / CGPA with your official result on the
          university portal before making academic or career decisions.
        </p>

        <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.65, color: c.sub }}>
          By using this app, you accept that the developer is not responsible for
          decisions based on calculated values.
        </p>

        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 20,
        }}>
          <button
            type="button"
            style={{
              ...btn("primary"),
              padding: "9px 18px",
              borderRadius: 8,
              outline: "none",
              boxShadow: "none",
            }}
            onClick={(e) => {
              e.currentTarget.blur();
              setShowDisclaimer(false);
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}