interface GoldCoinProps {
  size?: number
  className?: string
}

export default function GoldCoin({ size = 24, className = '' }: GoldCoinProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sombra */}
      <ellipse cx="16" cy="28" rx="10" ry="2.5" fill="rgba(0,0,0,0.25)" />

      {/* Corpo da moeda — gradiente dourado */}
      <circle cx="16" cy="15" r="13" fill="url(#coinGrad)" />

      {/* Borda mais escura */}
      <circle cx="16" cy="15" r="13" stroke="#A0660A" strokeWidth="1" fill="none" />

      {/* Brilho interno */}
      <circle cx="16" cy="15" r="10" fill="url(#innerGrad)" opacity="0.6" />

      {/* Reflexo superior */}
      <ellipse cx="13" cy="10" rx="4" ry="2.5" fill="white" opacity="0.25" transform="rotate(-20 13 10)" />

      {/* Letra L centralizada */}
      <text
        x="16"
        y="20"
        textAnchor="middle"
        fill="#7A4A00"
        fontSize="13"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        L
      </text>

      <defs>
        <radialGradient id="coinGrad" cx="40%" cy="35%" r="65%" fx="40%" fy="35%">
          <stop offset="0%"   stopColor="#FFE066" />
          <stop offset="40%"  stopColor="#F5C518" />
          <stop offset="100%" stopColor="#C8860A" />
        </radialGradient>
        <radialGradient id="innerGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFF3A0" />
          <stop offset="100%" stopColor="#F5C518" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}
