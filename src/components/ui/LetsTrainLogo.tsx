interface LetsTrainLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  xs: { text: 'text-sm'  },
  sm: { text: 'text-base' },
  md: { text: 'text-xl'   },
  lg: { text: 'text-2xl'  },
  xl: { text: 'text-4xl'  },
}

export default function LetsTrainLogo({
  size = 'md',
  className = '',
}: LetsTrainLogoProps) {
  const { text } = SIZES[size]

  return (
    <span className={`font-bold tracking-tight leading-none ${text} ${className}`}>
      <span className="text-white">Lets</span>
      <span className="text-[#FF8C00]"> Train</span>
    </span>
  )
}
