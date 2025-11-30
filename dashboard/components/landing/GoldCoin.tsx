// Gold coin SVG component for landing page
export const GoldCoin = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="coinGradientTicker"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFB300" />
        <stop offset="100%" stopColor="#FF8F00" />
      </linearGradient>
      <radialGradient id="coinShadowTicker" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stopColor="#FFD700" stopOpacity="1" />
        <stop offset="100%" stopColor="#B8860B" stopOpacity="1" />
      </radialGradient>
    </defs>
    <ellipse cx="50" cy="52" rx="42" ry="42" fill="#B8860B" />
    <circle cx="50" cy="50" r="42" fill="url(#coinShadowTicker)" />
    <circle cx="50" cy="50" r="38" fill="url(#coinGradientTicker)" />
    <ellipse cx="35" cy="35" rx="15" ry="12" fill="rgba(255,255,255,0.3)" />
    <circle
      cx="50"
      cy="50"
      r="30"
      fill="none"
      stroke="#B8860B"
      strokeWidth="2"
    />
    <text
      x="50"
      y="58"
      textAnchor="middle"
      fontSize="28"
      fontWeight="bold"
      fill="#B8860B"
      fontFamily="Arial, sans-serif"
    >
      $
    </text>
  </svg>
);
