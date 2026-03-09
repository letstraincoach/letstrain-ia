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

  // Biometrics
  const [pesoHoje, setPesoHoje] = useState('')
  const [showBio, setShowBio] = useState(false)
  const [fcMedia, setFcMedia] = useState('')
  const [fcMaxima, setFcMaxima] = useState('')
  const [caloriasReais, setCaloriasReais] = useState('')

  const [screen, setScreen] = useState<Screen>('form')
  const [levelUpData, setLevelUpData] = useState<{ previous: TrainingLevel; next: TrainingLevel } | null>(null)
  const [achievements, setAchievements] = useState<NewAchievement[]>([])
  const [postWorkoutRegistered, setPostWorkoutRegistered] = useState(false)
  const [registeringPosTreino, setRegisteringPosTreino] = useState<string | null>(null)

  async function registrarPosTreino(foodId: string, nome: string, icone: string, calorias: number, proteina_g: number, carbo_g: number, gordura_g: number) {
    setRegisteringPosTreino(foodId)
    try {
      await fetch('/api/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'pos_treino',
          items: [{ food_id: foodId, nome, icone, quantidade: 1, calorias, proteina_g, carbo_g, gordura_g }],
        }),
      })
      setPostWorkoutRegistered(true)
    } finally {
      setRegisteringPosTreino(null)
    }
  }

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

    // 1b. Salvar dados biométricos (best-effort, não bloqueia)
    const pesoVal = parseFloat(pesoHoje)
    const fcM = parseInt(fcMedia)
    const fcX = parseInt(fcMaxima)
    const cal = parseInt(caloriasReais)
    if (pesoVal > 0 || fcM > 0 || fcX > 0 || cal > 0) {
      fetch(`/api/workout/${workoutId}/biometrics`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peso_treino: pesoVal > 0 ? pesoVal : null,
          fc_media: fcM > 0 ? fcM : null,
          fc_maxima: fcX > 0 ? fcX : null,
          calorias_reais: cal > 0 ? cal : null,
        }),
      }).catch(() => {/* best-effort */})
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

        {/* Peso hoje */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-white/70">
            Seu peso hoje <span className="text-white/30">(opcional)</span>
          </p>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="decimal"
                min={30} max={300} step={0.1}
                value={pesoHoje}
                onChange={(e) => setPesoHoje(e.target.value)}
                placeholder="ex: 78.5"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
              />
            </div>
            <span className="text-sm font-semibold text-white/40 shrink-0">kg</span>
          </div>
          <p className="text-xs text-white/30 leading-relaxed">
            Registrar o peso mantém o seu Lets Body Score sempre atualizado.
          </p>
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

        {/* Dados do relógio (opcional) */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowBio((v) => !v)}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm transition-all hover:border-white/20 active:scale-[0.98]"
          >
            <span className="flex items-center gap-2 font-medium text-white/70">
              ⌚ Dados do smartwatch
              <span className="text-xs text-white/30 font-normal">(FC e calorias)</span>
            </span>
            <span className="text-white/30 text-xs">{showBio ? '▲' : '▼'}</span>
          </button>

          {showBio && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-4"
            >
              <p className="text-xs text-white/40 leading-relaxed">
                Informe os dados do seu treino registrados pelo smartwatch. Eles ficam salvos no seu histórico.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">FC Média</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={40} max={220}
                      value={fcMedia}
                      onChange={(e) => setFcMedia(e.target.value)}
                      placeholder="—"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-sm text-center text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#FF8C00] focus:ring-offset-0"
                    />
                    <span className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-white/25">bpm</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">FC Máxima</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={40} max={250}
                      value={fcMaxima}
                      onChange={(e) => setFcMaxima(e.target.value)}
                      placeholder="—"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-sm text-center text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#FF8C00] focus:ring-offset-0"
                    />
                    <span className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-white/25">bpm</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">Calorias</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0} max={5000}
                      value={caloriasReais}
                      onChange={(e) => setCaloriasReais(e.target.value)}
                      placeholder="—"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-sm text-center text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#FF8C00] focus:ring-offset-0"
                    />
                    <span className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-white/25">kcal</span>
                  </div>
                </div>
              </div>
              <div className="h-4" />
            </motion.div>
          )}
        </div>

        {/* Prompt pós-treino: refeição rápida */}
        <div className={`rounded-2xl border p-4 flex flex-col gap-3 transition-colors ${postWorkoutRegistered ? 'border-green-400/20 bg-green-400/5' : 'border-white/[0.07] bg-white/[0.02]'}`}>
          {postWorkoutRegistered ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <p className="text-sm text-green-400 font-medium">Refeição pós-treino registrada!</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-0.5">Refeição pós-treino</p>
                <p className="text-sm text-white/60">Já fez sua refeição? Registre em 1 clique:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'banana', nome: 'Banana', icone: '🍌', calorias: 89, proteina_g: 1.1, carbo_g: 23.0, gordura_g: 0.3 },
                  { id: 'whey', nome: 'Whey', icone: '🥤', calorias: 110, proteina_g: 23.0, carbo_g: 3.0, gordura_g: 1.5 },
                  { id: 'ovo', nome: 'Ovos', icone: '🥚', calorias: 72, proteina_g: 6.3, carbo_g: 0.4, gordura_g: 4.8 },
                  { id: 'frango', nome: 'Frango', icone: '🍗', calorias: 165, proteina_g: 31.0, carbo_g: 0.0, gordura_g: 3.6 },
                ].map((f) => (
                  <button
                    key={f.id}
                    disabled={!!registeringPosTreino}
                    onClick={() => registrarPosTreino(f.id, f.nome, f.icone, f.calorias, f.proteina_g, f.carbo_g, f.gordura_g)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white/60 hover:border-[#FF8C00]/30 hover:text-white/80 transition-colors disabled:opacity-50"
                  >
                    <span>{f.icone}</span>
                    <span>{registeringPosTreino === f.id ? '...' : f.nome}</span>
                  </button>
                ))}
              </div>
              <a href="/calorias" className="text-xs text-white/25 hover:text-[#FF8C00] transition-colors">
                Registrar refeição completa →
              </a>
            </>
          )}
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
