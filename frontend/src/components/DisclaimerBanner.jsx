import { useAppData } from "../context/AppDataContext";

export default function DisclaimerBanner() {
  const { dark, setShowDisclaimer, c } = useAppData();

  return (
    <footer style={{
      marginTop: 28,
      padding: "18px 1.25rem 22px",
      borderTop: `1px solid ${
        dark ? "rgba(255,255,255,0.07)" : "rgba(109,40,217,0.10)"
      }`,
      background: dark
        ? "rgba(255,255,255,0.018)"
        : "rgba(109,40,217,0.025)",
    }}>
      <div style={{
        maxWidth: 1080,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexWrap: "wrap",
        textAlign: "center",
      }}>
        <span style={{
          fontSize: 11,
          color: dark ? "rgba(255,255,255,0.42)" : c.muted,
          lineHeight: 1.6,
        }}>
          Unofficial academic tool. Verify final results with official marksheets.
        </span>

        <button
          type="button"
          onClick={e => {
            e.currentTarget.blur();
            setShowDisclaimer(true);
          }}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            fontSize: 11,
            color: dark ? "rgba(255,255,255,0.62)" : c.accent,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 700,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            outline: "none",
            boxShadow: "none",
          }}
        >
          Read full disclaimer
        </button>
      </div>
    </footer>
  );
}