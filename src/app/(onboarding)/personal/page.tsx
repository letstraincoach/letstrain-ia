'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TRAINERS, type TrainerSlug } from '@/lib/trainers/config'

export default function PersonalPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [selected, setSelected] = useState<TrainerSlug | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('user_profiles')
        .select('personal_slug')
        .eq('id', user.id)
        .single()

      setUserId(user.id)
      setSelected((data?.personal_slug as TrainerSlug) ?? null)
      setLoading(false)
    }
    loadProfile()
  }, [router])

  async function handleConfirm() {
    if (!userId || !selected) return
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from('user_profiles')
      .update({ personal_slug: selected })
      .eq('id', userId)

    router.push('/dashboard')
  }

  if (loading || !userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[#FF8C00] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full max-w-sm gap-6 pt-2 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-black">Escolha seu Personal</h1>
        <p className="text-sm text-white/45 leading-relaxed">
          Todos seguem a mesma metodologia Lets Train.<br />
          Cada um tem seu jeito de te motivar.
        </p>
      </div>

      {/* Cards dos trainers */}
      <div className="flex flex-col gap-3">
        {TRAINERS.map((trainer) => {
          const isSelected = selected === trainer.slug
          return (
            <button
              key={trainer.slug}
              type="button"
              onClick={() => setSelected(trainer.slug)}
              className={[
                'w-full rounded-2xl border p-4 flex items-start gap-4 text-left transition-all',
                isSelected
                  ? 'border-[#FF8C00] bg-[#FF8C00]/[0.08]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20',
              ].join(' ')}
            >
              {/* Emoji / avatar */}
              <div
                className={[
                  'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                  isSelected
                    ? 'bg-[#FF8C00]/20 border border-[#FF8C00]/30'
                    : 'bg-white/[0.04] border border-white/[0.06]',
                ].join(' ')}
              >
                {trainer.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="font-bold text-sm text-white">{trainer.nome}</p>
                  {isSelected && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#FF8C00] flex items-center justify-center text-black text-xs font-black">
                      ✓
                    </span>
                  )}
                </div>
                <p className={[
                  'text-xs font-semibold mb-1',
                  isSelected ? 'text-[#FF8C00]' : 'text-white/40',
                ].join(' ')}>
                  {trainer.estilo}
                </p>
                <p className="text-xs text-white/40 leading-relaxed">{trainer.estiloDesc}</p>
                <p className="text-[10px] text-white/20 font-mono mt-1.5">{trainer.cref}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selected || saving}
        className="w-full h-14 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors disabled:opacity-40"
      >
        {saving ? (
          <span className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        ) : (
          '💪 Começar com este personal'
        )}
      </button>

      <button
        type="button"
        onClick={() => router.push('/equipamentos')}
        className="text-sm text-white/30 hover:text-white/60 transition-colors text-center"
      >
        ← Voltar
      </button>
    </div>
  )
}
