'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import LevelUpScreen from '@/components/gamification/LevelUpScreen'
import AchievementBanner, { type NewAchievement } from '@/components/gamification/AchievementBanner'
import type { TrainingLevel } from '@/types/database.types'

type Feedback = 'muito_facil' | 'na_medida' | 'muito_dificil' | 'nao_gostei'
type Screen = 'form' | 'levelup' | 'achievements' | 'celebration'

const FEEDBACK_OPTIONS: { value: Feedback; label: string; emoji: string }[] = [
  { value: 'muito_facil', label: 'Muito fácil', emoji: '😴' },
  { value: 'na_medida', label: 'Na medida', emoji: '😊' },
  { value: 'muito_dificil', label: 'Muito difícil', emoji: '🥵' },
  { value: 'nao_gostei', label: 'Não gostei', emoji: '😐' },
]

const STAR_EMOJIS = ['😞', '😕', '😐', '😊', '🤩']

function CelebrationScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.span
          className="text-7xl"
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          🏆
        </motion.span>
        <div>
          <h2 className="text-2xl font-bold mb-2">Treino concluído!</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Mais um treino no banco. Você está construindo algo real aqui. Orgulho total!
          </p>
        </div>
        <motion.div className="flex gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {['🔥', '💪', '⚡', '🌟', '🔥'].map((e, i) => (
            <motion.span key={i} className="text-2xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.08 }}>
              {e}
            </motion.span>
          ))}
        </motion.div>
        <Button fullWidth onClick={onClose} className="mt-4">
          Voltar para o Dashboard
        </Button>
      </motion.div>
    </div>
  )
}

export default function AvaliacaoPage() {
  const router = useRouter()
  const { id: workoutId } = useParams<{ id: string }>()

  const [rating, setRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [comentario, setComentario] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [screen, setScreen] = useState<Screen>('form')
  const [levelUpData, setLevelUpData] = useState<{ previous: TrainingLevel; next: TrainingLevel } | null>(null)
  const [achievements, setAchievements] = useState<NewAchievement[]>([])

  async function handleSubmit() {
    if (!rating) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // 1. Salvar avaliação
    const { error: dbError } = await supabase
      .from('workout_evaluations')
      .insert({
        workout_id: workoutId,
        user_id: user.id,
        rating,
        feedback_rapido: feedback,
        comentario: comentario.trim() || null,
      })

    if (dbError && !dbError.message.includes('unique')) {
      setError('Erro ao salvar avaliação. Tente novamente.')
      setSaving(false)
      return
    }

    // 2. Obter nível atual (para animar transição)
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('nivel_atual')
      .eq('id', user.id)
      .single()
    const currentLevel = (profileData?.nivel_atual ?? 'adaptacao') as TrainingLevel

    // 3. Chamar post-complete (level-up + achievements) — best-effort
    let leveledUp = false
    let newLevel: TrainingLevel | null = null
    let newAchievements: NewAchievement[] = []

    try {
      const res = await fetch(`/api/workout/${workoutId}/post-complete`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json() as {
          leveledUp: boolean
          newLevel: TrainingLevel | null
          newAchievements: NewAchievement[]
        }
        leveledUp = data.leveledUp
        newLevel = data.newLevel
        newAchievements = data.newAchievements ?? []
      }
    } catch {
      // sem bloqueio — segue para celebração
    }

    setSaving(false)

    // 4. Navegar pelo fluxo de telas
    if (leveledUp && newLevel) {
      setLevelUpData({ previous: currentLevel, next: newLevel })
      setAchievements(newAchievements)
      setScreen('levelup')
    } else if (newAchievements.length > 0) {
      setAchievements(newAchievements)
      setScreen('achievements')
    } else {
      setScreen('celebration')
    }
  }

  // ── Telas pós-avaliação ──────────────────────────────────────────────────
  if (screen === 'levelup' && levelUpData) {
    return (
      <LevelUpScreen
        previousLevel={levelUpData.previous}
        newLevel={levelUpData.next}
        onContinue={() => achievements.length > 0 ? setScreen('achievements') : router.push('/atualizar-medidas')}
      />
    )
  }

  if (screen === 'achievements') {
    return (
      <AchievementBanner
        achievements={achievements}
        onDone={() => levelUpData ? router.push('/atualizar-medidas') : setScreen('celebration')}
      />
    )
  }

  if (screen === 'celebration') {
    return <CelebrationScreen onClose={() => router.push('/dashboard')} />
  }

  // ── Formulário ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-8">

        <div>
          <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-1">
            Treino concluído 💪
          </p>
          <h1 className="text-2xl font-bold">Como foi o treino?</h1>
          <p className="mt-1 text-sm text-white/50">
            Conta pra gente como foi. Isso ajuda a deixar o próximo ainda melhor.
          </p>
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white/70">Nota geral</p>
          <div className="flex gap-3 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="flex flex-col items-center gap-1 transition-transform active:scale-90"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={star <= (rating ?? 0) ? 'filled' : 'empty'}
                    className="text-3xl"
                    initial={{ scale: 0.7 }}
                    animate={{ scale: star === rating ? 1.2 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    {star <= (rating ?? 0) ? '⭐' : '☆'}
                  </motion.span>
                </AnimatePresence>
              </button>
            ))}
          </div>
          {rating && (
            <p className="text-center text-sm text-white/50">
              {STAR_EMOJIS[rating - 1]}{' '}
              {['Muito ruim', 'Ruim', 'Ok', 'Bom', 'Incrível!'][rating - 1]}
            </p>
          )}
        </div>

        {/* Feedback rápido */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white/70">Como você se sentiu?</p>
          <div className="grid grid-cols-2 gap-2">
            {FEEDBACK_OPTIONS.map((opt) => {
              const selected = feedback === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFeedback(selected ? null : opt.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all duration-150 active:scale-[0.97]
                    ${selected
                      ? 'border-[#FF8C00] bg-[#FF8C00]/10 text-white'
                      : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20'
                    }`}
                >
                  <span>{opt.emoji}</span>
                  <span className="font-medium text-xs">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Comentário */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-white/70">
            Comentário <span className="text-white/30">(opcional)</span>
          </p>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Fique à vontade para contar como foi. Qualquer detalhe ajuda!"
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 pb-8">
          <Button fullWidth loading={saving} disabled={!rating} onClick={handleSubmit}>
            Salvar avaliação
          </Button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            Pular avaliação
          </button>
        </div>
      </div>
    </div>
  )
}
