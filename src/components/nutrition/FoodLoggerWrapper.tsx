'use client'

import { useState } from 'react'
import FoodLogger from './FoodLogger'

export default function FoodLoggerWrapper({ defaultTipo }: { defaultTipo?: string }) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full h-12 rounded-2xl bg-[#FF8C00] hover:bg-[#E07000] text-black font-bold text-sm transition-colors flex items-center justify-center gap-2"
      >
        <span>+</span>
        <span>Registrar refeição</span>
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold">Nova refeição</p>
        <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 text-sm">✕</button>
      </div>
      <FoodLogger
        defaultTipo={defaultTipo as Parameters<typeof FoodLogger>[0]['defaultTipo']}
        onSuccess={() => setOpen(false)}
      />
    </div>
  )
}
