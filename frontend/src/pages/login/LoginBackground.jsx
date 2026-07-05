export default function LoginBackground({ dark }) {
  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%;   }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%;   }
        }
        @keyframes orbFloat0 {
          0%,100% { transform: translate(0, 0) scale(1);       }
          33%      { transform: translate(30px, -40px) scale(1.08); }
          66%      { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes orbFloat1 {
          0%,100% { transform: translate(0, 0) scale(1.05);    }
          33%      { transform: translate(-35px, 25px) scale(0.93); }
          66%      { transform: translate(20px, -30px) scale(1.1);  }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0, -10px) scale(0.97); }
          50%      { transform: translate(25px, 15px) scale(1.06);  }
        }
        @keyframes orbFloat3 {
          0%,100% { transform: translate(0, 0) scale(1);        }
          40%      { transform: translate(-20px, -35px) scale(1.1); }
          80%      { transform: translate(30px, 15px) scale(0.94);  }
        }
        @keyframes neonPulse {
          0%,100% { opacity: 0.6; filter: blur(60px); }
          50%      { opacity: 1;   filter: blur(40px); }
        }

        @media (max-width: 640px), (prefers-reduced-motion: reduce) {
          .login-bg-gradient {
            animation: none !important;
            background-size: 100% 100% !important;
          }

          .login-bg-orb {
            animation: none !important;
            filter: blur(32px) !important;
            opacity: 0.45;
          }

          .login-bg-orb:nth-of-type(n + 5) {
            display: none;
          }
        }
      `}</style>

      {/*Animated gradient base */}
      <div className="login-bg-gradient" style={{
        position:           "fixed",
        inset:              0,
        zIndex:             0,
        background:         dark
          // dark: deep navy â†’ purple â†’ dark teal
          ? "linear-gradient(-45deg, #050814, #0d0621, #071a14, #0d0621, #100520)"
          // light: soft peach â†’ lavender â†’ mint â†’ lilac
          : "linear-gradient(-45deg, #fde8f0, #ede9ff, #d8f5ec, #f5e6ff, #fde8f0)",
        backgroundSize:     "400% 400%",
        animation:          "gradientShift 12s ease infinite",
      }} />

     
      {dark ? (
        // Dark mode neon glows
        <>
          <Orb size={500} top="-120px" left="-100px"
            color="rgba(124,63,245,0.35)" blur={100} anim="orbFloat0 14s ease-in-out infinite" pulse />
          <Orb size={400} top="30%" right="-80px"
            color="rgba(0,255,180,0.2)" blur={90} anim="orbFloat1 18s ease-in-out infinite" pulse />
          <Orb size={350} bottom="0" left="25%"
            color="rgba(180,0,255,0.25)" blur={90} anim="orbFloat2 16s ease-in-out infinite" pulse />
          <Orb size={250} top="55%" left="5%"
            color="rgba(0,180,255,0.2)" blur={70} anim="orbFloat3 11s ease-in-out infinite" pulse />
          <Orb size={200} bottom="10%" right="15%"
            color="rgba(255,60,120,0.18)" blur={65} anim="orbFloat0 13s ease-in-out infinite reverse" pulse />

          {/* Neon grid overlay */}
          <div style={{
            position:        "fixed",
            inset:           0,
            zIndex:          0,
            backgroundImage: `
              linear-gradient(rgba(124,63,245,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,63,245,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            pointerEvents:  "none",
          }} />
        </>
      ) : (
        // Light mode soft pastel orbs
        <>
          <Orb size={500} top="-80px" left="-80px"
            color="rgba(192,132,252,0.4)" blur={100} anim="orbFloat0 14s ease-in-out infinite" />
          <Orb size={380} top="35%" right="-60px"
            color="rgba(110,231,183,0.45)" blur={90} anim="orbFloat1 17s ease-in-out infinite" />
          <Orb size={320} bottom="5%" left="20%"
            color="rgba(249,168,212,0.5)" blur={85} anim="orbFloat2 15s ease-in-out infinite" />
          <Orb size={260} top="50%" left="8%"
            color="rgba(167,139,250,0.35)" blur={70} anim="orbFloat3 12s ease-in-out infinite" />
          <Orb size={220} bottom="15%" right="10%"
            color="rgba(134,239,172,0.4)" blur={65} anim="orbFloat1 10s ease-in-out infinite reverse" />
        </>
      )}

     
      <div style={{
        position:   "fixed",
        inset:      0,
        zIndex:     0,
        opacity:    dark ? 0.06 : 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter 
        id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'
         stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' 
         filter='url(%23noise)'/%3E%3C/svg%3E")`,
        pointerEvents: "none",
      }} />
    </>
  );
}

function Orb({ size, top, left, right, bottom, color, blur, anim, pulse }) {
  return (
    <div className="login-bg-orb" style={{
      position:     "fixed",
      width:        size,
      height:       size,
      borderRadius: "50%",
      background:   color,
      filter:       `blur(${blur}px)`,
      top, left, right, bottom,
      zIndex:       0,
      animation:    pulse
        ? `${anim}, neonPulse 4s ease-in-out infinite`
        : anim,
      pointerEvents: "none",
    }} />
  );
}

