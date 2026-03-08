'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { GeneratedWorkout, WorkoutExercise } from '@/lib/ai/workout-schemas'
import { isNewFormat } from '@/lib/ai/workout-schemas'
import Button from '@/components/ui/Button'

// Achata todas as seções em uma lista linear com separadores de seção
type SecaoNova = 'Preparação' | 'Força' | 'Circuito' | 'Finisher'
type SecaoLegacy = 'Aquecimento' | 'Principal' | 'Cooldown'
type Secao = SecaoNova | SecaoLegacy

interface FlatExercise extends WorkoutExercise {
  secao: Secao
  indexGlobal: number
  totalGlobal: number
}

function buildFlatList(workout: GeneratedWorkout): FlatExercise[] {
  const items: { ex: WorkoutExercise; secao: Secao }[] = []

  if (isNewFormat(workout)) {
    // Nova estrutura 4 blocos
    ;(workout.preparacao ?? []).forEach((e) => items.push({ ex: e, secao: 'Preparação' }))
    ;(workout.forca ?? []).forEach((e) => items.push({ ex: e, secao: 'Força' }))
    ;(workout.circuito ?? []).forEach((e) => items.push({ ex: e, secao: 'Circuito' }))
    ;(workout.finisher ?? []).forEach((e) => items.push({ ex: e, secao: 'Finisher' }))
  } else {
    // Legacy 3 blocos (treinos antigos no banco)
    ;(workout.aquecimento ?? []).forEach((e) => items.push({ ex: e, secao: 'Aquecimento' }))
    ;(workout.principal ?? []).forEach((e) => items.push({ ex: e, secao: 'Principal' }))
    ;(workout.cooldown ?? []).forEach((e) => items.push({ ex: e, secao: 'Cooldown' }))
  }

  const total = items.length
  return items.map(({ ex, secao }, i) => ({ ...ex, secao, indexGlobal: i, totalGlobal: total }))
}

const SECAO_COLOR: Record<Secao, string> = {
  // Nova estrutura
  'Preparação': '#F59E0B',
  'Força':      '#FF8C00',
  'Circuito':   '#A855F7',
  'Finisher':   '#EF4444',
  // Legacy
  'Aquecimento': '#F59E0B',
  'Principal':   '#FF8C00',
  'Cooldown':    '#3B82F6',
}

// ---- Modal de confirmação ----
function ConfirmModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 px-4 pb-6 sm:pb-0">
      <motion.div
        className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-sm"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <p className="text-2xl text-center mb-2">🏁</p>
        <h3 className="text-lg font-bold text-center mb-1">Concluir treino?</h3>
        <p className="text-sm text-white/50 text-center mb-6">
          Ótimo trabalho! Confirme para registrar o treino e avaliar.
        </p>
        <div className="flex flex-col gap-2">
          <Button fullWidth loading={loading} onClick={onConfirm}>
            Sim, concluir!
          </Button>
          <Button variant="ghost" fullWidth onClick={onCancel} disabled={loading}>
            Continuar treinando
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ---- Biometrics badge (shown when jaExecutado + data exists) ----
function BiometricsBadge({
  biometrics,
}: {
  biometrics: { fc_media?: number; fc_maxima?: number; calorias_reais?: number; peso_treino?: number }
}) {
  const items = [
    biometrics.peso_treino    && { label: 'Peso',     value: `${biometrics.peso_treino} kg`,      icon: '⚖️' },
    biometrics.fc_media       && { label: 'FC Média', value: `${biometrics.fc_media} bpm`,        icon: '❤️' },
    biometrics.fc_maxima      && { label: 'FC Máx',   value: `${biometrics.fc_maxima} bpm`,       icon: '📈' },
    biometrics.calorias_reais && { label: 'Calorias', value: `${biometrics.calorias_reais} kcal`, icon: '🔥' },
  ].filter(Boolean) as { label: string; value: string; icon: string }[]

  if (items.length === 0) return null

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 flex items-center gap-3 flex-wrap">
      <span className="text-[10px] text-white/30 uppercase tracking-wider mr-1">📊 Biometria</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <span className="text-xs">{item.icon}</span>
          <span className="text-xs font-semibold text-white/70">{item.value}</span>
          <span className="text-[10px] text-white/30 ml-0.5">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ---- Componente principal ----
interface WorkoutScreenProps {
  workoutId: string
  workout: GeneratedWorkout
  nivel: string
  jaExecutado?: boolean
  biometrics?: { fc_media?: number; fc_maxima?: number; calorias_reais?: number; peso_treino?: number }
}

export default function WorkoutScreen({ workoutId, workout, nivel, jaExecutado = false, biometrics }: WorkoutScreenProps) {
  const router = useRouter()
  const flatList = buildFlatList(workout)
  const total = flatList.length

  const [current, setCurrent] = useState(jaExecutado ? total - 1 : 0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [showConfirm, setShowConfirm] = useState(false)
  const [completing, setCompleting] = useState(false)

  const ex = flatList[current]
  const isLast = current === total - 1
  const progressPct = Math.round(((current + 1) / total) * 100)

  function goNext() {
    if (isLast) { setShowConfirm(true); return }
    setDirection(1)
    setCurrent((c) => c + 1)
  }

  function goPrev() {
    if (current === 0) return
    setDirection(-1)
    setCurrent((c) => c - 1)
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      const res = await fetch(`/api/workout/${workoutId}/complete`, { method: 'POST' })
      if (!res.ok) throw new Error('Erro ao concluir')
      router.push(`/workout/${workoutId}/avaliacao`)
    } catch {
      setCompleting(false)
      setShowConfirm(false)
    }
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleComplete}
          onCancel={() => setShowConfirm(false)}
          loading={completing}
        />
      )}

      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-10 pb-4">
          <div className="max-w-sm mx-auto">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-white/40 hover:text-white/70 transition-colors mb-4 flex items-center gap-1"
            >
              ← Sair
            </button>
            <h1 className="text-lg font-bold leading-tight truncate">{workout.nome}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
              <span>⏱ {workout.duracao_estimada} min</span>
              <span>·</span>
              <span className="capitalize">{nivel}</span>
              <span>·</span>
              <span>{current + 1} / {total}</span>
            </div>

            {/* Barra de progresso */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#FF8C00]"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Biometrics badge — only when jaExecutado */}
            {jaExecutado && biometrics && <BiometricsBadge biometrics={biometrics} />}
          </div>
        </div>

        {/* Card do exercício */}
        <div className="flex-1 px-6 py-2 overflow-hidden">
          <div className="max-w-sm mx-auto h-full flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="flex flex-col gap-5"
              >
                {/* Badge de seção */}
                <span
                  className="self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                  style={{
                    color: SECAO_COLOR[ex.secao],
                    backgroundColor: SECAO_COLOR[ex.secao] + '20',
                  }}
                >
                  {ex.secao}
                </span>

                {/* Card principal */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 flex flex-col gap-4">
                  {/* Nome */}
                  <h2 className="text-2xl font-bold leading-tight">{ex.nome}</h2>

                  {/* Grupos musculares */}
                  {ex.grupo_muscular && ex.grupo_muscular.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {ex.grupo_muscular.map((g) => (
                        <span
                          key={g}
                          className="px-2.5 py-1 rounded-full text-xs bg-white/8 text-white/60 border border-white/10"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Séries / Reps / Descanso */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Séries', value: String(ex.series) },
                      { label: 'Reps', value: ex.repeticoes },
                      {
                        label: 'Descanso',
                        value: ex.descanso_segundos > 0 ? `${ex.descanso_segundos}s` : '—',
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3"
                      >
                        <span className="text-xl font-bold text-[#FF8C00]">{value}</span>
                        <span className="text-xs text-white/40">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Instruções */}
                  {ex.instrucoes && (
                    <p className="text-sm text-white/60 leading-relaxed">{ex.instrucoes}</p>
                  )}

                  {/* Ver vídeo */}
                  {ex.youtube_url && (
                    <a
                      href={ex.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 h-10 rounded-xl border border-white/15 text-sm text-white/70 hover:border-white/30 hover:text-white transition-all"
                    >
                      <span className="text-red-500">▶</span> Ver demonstração no YouTube
                    </a>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navegação */}
        <div className="px-6 pb-10 pt-4">
          <div className="max-w-sm mx-auto flex gap-3">
            {current > 0 && (
              <Button variant="outline" onClick={goPrev} className="flex-none w-14">
                ←
              </Button>
            )}
            <Button fullWidth onClick={goNext}>
              {isLast ? '🏁 Concluir Treino' : 'Próximo →'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
