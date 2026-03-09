'use client'

import Link from 'next/link'

interface Props {
  calorias: number
  metaCalorias: number
  proteina: number
  metaProteina: number
}

export default function NutritionWidget({ calorias, metaCalorias, proteina, metaProteina }: Props) {
  const pctCal = metaCalorias > 0 ? Math.min((calorias / metaCalorias) * 100, 100) : 0
  const semRegistro = calorias === 0

  return (
    <Link
      href="/nutricao"
      className="block rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 hover:border-white/[0.12] transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🍽</span>
          <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Registro alimentar</p>
        </div>
        <span className="text-[10px] text-white/20">→</span>
      </div>

      {semRegistro ? (
        <p className="text-sm text-white/30">Nenhum registro hoje. Comece agora →</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-black text-white">{calorias.toLocaleString('pt-BR')}</span>
              <span className="text-sm text-white/30 ml-1">/ {metaCalorias.toLocaleString('pt-BR')} kcal</span>
            </div>
            <span className="text-xs text-white/30">{Math.round(pctCal)}%</span>
          </div>

          {/* Barra de calorias */}
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pctCal}%`,
                background: pctCal < 95 ? '#FF8C00' : '#22c55e',
              }}
            />
          </div>

          {/* Macros linha */}
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span>
              <span className="text-orange-400 font-semibold">{Math.round(proteina)}g</span> prot
            </span>
            <span className="text-white/15">·</span>
            <span>meta {metaProteina}g</span>
          </div>
        </div>
      )}
    </Link>
  )
}
