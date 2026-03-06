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
      {/* Haltere SVG — baseado no icon.svg do projeto */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Barra central */}
        <rect x="176" y="236" width="160" height="40" rx="8" fill="#FF8C00" />
        {/* Peso esquerdo superior */}
        <rect x="96" y="184" width="96" height="48" rx="10" fill="#FF8C00" />
        {/* Peso esquerdo inferior */}
        <rect x="96" y="280" width="96" height="48" rx="10" fill="#FF8C00" />
        {/* Conector esquerdo */}
        <rect x="148" y="184" width="32" height="144" rx="6" fill="#E07000" />
        {/* Peso direito superior */}
        <rect x="320" y="184" width="96" height="48" rx="10" fill="#FF8C00" />
        {/* Peso direito inferior */}
        <rect x="320" y="280" width="96" height="48" rx="10" fill="#FF8C00" />
        {/* Conector direito */}
        <rect x="332" y="184" width="32" height="144" rx="6" fill="#E07000" />
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
