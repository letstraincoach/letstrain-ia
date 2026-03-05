'use client'

interface ProgressBarProps {
  current: number  // 0-based
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round(((current + 1) / total) * 100)

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40">
          {current + 1} de {total}
        </span>
        <span className="text-xs font-medium text-[#FF8C00]">{percent}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#FF8C00] transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
