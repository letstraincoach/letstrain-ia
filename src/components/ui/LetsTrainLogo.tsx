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

/**
 * Logo mark da Lets Train:
 * 3 arcos concêntricos com origem no canto superior-direito (100, 0).
 * Os 3 arcos compartilham o mesmo centro — raios 93, 67 e 41.
 * Espaçamento entre arcos = largura do traço = 14 unidades (proporção uniforme).
 *
 * Geometria verificada:
 *   Arco 1 (r=93): (7,0) → (100,93)   borda externa toca x=0 (esquerda)
 *   Arco 2 (r=67): (33,0) → (100,67)
 *   Arco 3 (r=41): (59,0) → (100,41)  borda interna em x≈66
 */
export default function LetsTrainLogo({
  size = 'md',
  className = '',
  iconOnly = false,
}: LetsTrainLogoProps) {
  const { icon, text, gap } = SIZES[size]

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        overflow="hidden"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Arco externo — raio 93, centro (100, 0) */}
        <path
          d="M 7 0 A 93 93 0 0 1 100 93"
          stroke="#FF8C00"
          strokeWidth="14"
          strokeLinecap="butt"
        />
        {/* Arco médio — raio 67, centro (100, 0) */}
        <path
          d="M 33 0 A 67 67 0 0 1 100 67"
          stroke="#FF8C00"
          strokeWidth="14"
          strokeLinecap="butt"
        />
        {/* Arco interno — raio 41, centro (100, 0) */}
        <path
          d="M 59 0 A 41 41 0 0 1 100 41"
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
