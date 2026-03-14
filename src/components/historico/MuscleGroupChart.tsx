'use client'

import { useMemo } from 'react'

interface Props {
  /** Map of muscle group → count of exercises trained */
  grupoContagem: Record<string, number>
}

const GRUPO_EMOJI: Record<string, string> = {
  quadríceps: '🦵',
  glúteos: '🍑',
  posterior: '🦵',
  panturrilha: '🦶',
  peito: '💪',
  costas: '🔙',
  ombros: '🤸',
  bíceps: '💪',
  tríceps: '💪',
  core: '🎯',
}

export default function MuscleGroupChart({ grupoContagem }: Props) {
  const sorted = useMemo(() => {
    return Object.entries(grupoContagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [grupoContagem])

  if (sorted.length === 0) return null

  const max = sorted[0][1]

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          Músculos Treinados
        </p>
        <span className="text-[10px] text-white/25">últimos 30 dias</span>
      </div>

      <div className="flex flex-col gap-2">
        {sorted.map(([grupo, count]) => {
          const pct = max > 0 ? (count / max) * 100 : 0
          const emoji = GRUPO_EMOJI[grupo] ?? '💪'

          return (
            <div key={grupo} className="flex items-center gap-2">
              <span className="text-xs w-4 text-center shrink-0">{emoji}</span>
              <span className="text-[11px] text-white/50 w-20 shrink-0 capitalize truncate">
                {grupo}
              </span>
              <div className="flex-1 h-3 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct >= 80 ? '#FF8C00' : pct >= 50 ? '#FF8C00aa' : '#FF8C0055',
                  }}
                />
              </div>
              <span className="text-[11px] text-white/30 w-6 text-right tabular-nums shrink-0">
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
