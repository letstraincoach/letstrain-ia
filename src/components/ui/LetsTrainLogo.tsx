interface LetsTrainLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  /** Mostrar só o ícone sem o texto */
  iconOnly?: boolean
}

const SIZES = {
  xs: { icon: 16, text: 'text-sm',  gap: 'gap-1.5' },
  sm: { icon: 22, text: 'text-base', gap: 'gap-2'   },
  md: { icon: 28, text: 'text-xl',   gap: 'gap-2.5' },
  lg: { icon: 40, text: 'text-2xl',  gap: 'gap-3'   },
  xl: { icon: 56, text: 'text-4xl',  gap: 'gap-4'   },
}

export default function LetsTrainLogo({
  size = 'md',
  className = '',
  iconOnly = false,
}: LetsTrainLogoProps) {
  const { icon, text, gap } = SIZES[size]

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {/* Logo mark — 3 arcos concêntricos (símbolo registrado Lets Train) */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        overflow="hidden"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Arco externo */}
        <path
          d="M 0 7 H 73 A 20 20 0 0 1 93 27 V 100"
          stroke="#FF8C00"
          strokeWidth="14"
          strokeLinecap="butt"
        />
        {/* Arco médio */}
        <path
          d="M 0 33 H 47 A 20 20 0 0 1 67 53 V 100"
          stroke="#FF8C00"
          strokeWidth="14"
          strokeLinecap="butt"
        />
        {/* Arco interno */}
        <path
          d="M 0 59 H 21 A 20 20 0 0 1 41 79 V 100"
          stroke="#FF8C00"
          strokeWidth="14"
          strokeLinecap="butt"
        />
      </svg>

      {!iconOnly && (
        <span className={`font-bold tracking-tight leading-none ${text}`}>
          <span className="text-white">Lets</span>
          <span className="text-[#FF8C00]"> Train</span>
        </span>
      )}
    </div>
  )
}
