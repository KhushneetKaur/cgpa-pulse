export default function MRSPTULogo({ size = 44 }) {
  return (
    <img
      src="https://mrsptu.ac.in/images/mrslogo.png"
      alt="MRSPTU Logo"
      width={size}
      height={size}
      style={{
        objectFit:  "contain",
        flexShrink: 0,
        display:    "block",
      }}
      onError={e => {
        e.currentTarget.style.display = "none";
        const fallback = document.createElement("div");
        fallback.style.cssText = `
          width:${size}px;height:${size}px;
          border-radius:${size * 0.22}px;
          background:linear-gradient(135deg,#6d28d9,#a78bfa);
          display:flex;align-items:center;justify-content:center;
          font-size:${size * 0.28}px;font-weight:800;color:#fff;
        `;
        fallback.textContent = "MRS";
        e.currentTarget.parentNode.insertBefore(
          fallback, e.currentTarget.nextSibling
        );
      }}
    />
  );
}