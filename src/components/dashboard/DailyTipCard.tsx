'use client'

import { useEffect, useState } from 'react'

interface DailyTipCardProps {
  initialTip: { tip: string; categoria: string } | null
  trainerEmoji: string
  trainerNome: string
}

const CATEGORIA_CONFIG: Record<string, { label: string; cor: string; icon: string }> = {
  treino:      { label: 'Treino',      cor: '#FF8C00', icon: '💪' },
  nutrição:    { label: 'Nutrição',    cor: '#4ADE80', icon: '🥗' },
  recuperacao: { label: 'Recuperação', cor: '#60A5FA', icon: '😴' },
  mindset:     { label: 'Mindset',     cor: '#A855F7', icon: '🧠' },
}

export default function DailyTipCard({ initialTip, trainerEmoji, trainerNome }: DailyTipCardProps) {
  const [tip, setTip] = useState<{ tip: string; categoria: string } | null>(initialTip)
  const [loading, setLoading] = useState(!initialTip)

  useEffect(() => {
    if (initialTip) return
    fetch('/api/daily-tip')
      .then((r) => r.json())
      .then((data: { tip?: string; categoria?: string }) => {
        if (data.tip) setTip({ tip: data.tip, categoria: data.categoria ?? 'treino' })
      })
      .catch(() => {/* silently ignore */})
      .finally(() => setLoading(false))
  }, [initialTip])

  const catConfig = tip ? (CATEGORIA_CONFIG[tip.categoria] ?? CATEGORIA_CONFIG['treino']) : null

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{trainerEmoji}</span>
          <div>
            <p className="text-[10px] text-white/30 leading-none">Dica de hoje</p>
            <p className="text-xs font-semibold text-white/60 leading-tight">
              {trainerNome.replace('Personal ', '')}
            </p>
          </div>
        </div>
        {catConfig && (
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
            style={{ color: catConfig.cor, backgroundColor: catConfig.cor + '18' }}
          >
            {catConfig.icon} {catConfig.label}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex flex-col gap-2">
          <div className="h-3 rounded-full bg-white/[0.06] animate-pulse w-full" />
          <div className="h-3 rounded-full bg-white/[0.06] animate-pulse w-4/5" />
        </div>
      ) : tip ? (
        <p className="text-sm text-white/70 leading-relaxed">{tip.tip}</p>
      ) : (
        <p className="text-xs text-white/30 italic">Dica indisponível no momento.</p>
      )}
    </div>
  )
}
