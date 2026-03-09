'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { GeneratedWorkout, WorkoutExercise } from '@/lib/ai/workout-schemas'
import { isNewFormat } from '@/lib/ai/workout-schemas'
import Button from '@/components/ui/Button'
import { getExerciseVideoUrl } from '@/lib/training/exercise-videos'

// Achata todas as seções em uma lista linear com separadores de seção
type SecaoNova = 'Preparação' | 'Força' | 'Circuito' | 'Cardio' | 'Finisher'
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
    ;(workout.cardio ?? []).forEach((e) => items.push({ ex: e, secao: 'Cardio' }))
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
  'Cardio':     '#22C55E',
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

// ---- Overview screen — resumo dos 4 blocos ----
function WorkoutOverview({
  workout,
  nivel,
  onStart,
}: {
  workout: GeneratedWorkout
  nivel: string
  onStart: () => void
}) {
  const newFormat = isNewFormat(workout)

  const blocos = newFormat
    ? [
        { label: 'Preparação',          cor: '#F59E0B', exs: workout.preparacao ?? [], desc: 'Mobilidade · Ativação · Cardio leve' },
        { label: 'Força',               cor: '#FF8C00', exs: workout.forca      ?? [], desc: 'Força guiada ou funcional' },
        ...(workout.cardio?.length
          ? [{ label: 'Cardio',              cor: '#22C55E', exs: workout.cardio,            desc: 'Condicionamento aeróbico' }]
          : [{ label: 'Circuito Metabólico', cor: '#A855F7', exs: workout.circuito ?? [],   desc: 'HIIT · Sem descanso entre exercícios' }]),
        { label: 'Finisher',            cor: '#EF4444', exs: workout.finisher   ?? [], desc: 'Estímulo final curto e intenso' },
      ]
    : [
        { label: 'Aquecimento', cor: '#F59E0B', exs: workout.aquecimento ?? [], desc: 'Preparação do corpo' },
        { label: 'Principal',   cor: '#FF8C00', exs: workout.principal   ?? [], desc: 'Treino principal' },
        { label: 'Cooldown',    cor: '#3B82F6', exs: workout.cooldown    ?? [], desc: 'Desaceleração e alongamento' },
      ]

  const totalExs = blocos.reduce((acc, b) => acc + b.exs.length, 0)

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="flex-1 px-6 pt-10 pb-6 overflow-y-auto">
        <div className="max-w-sm mx-auto flex flex-col gap-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-xs text-[#FF8C00] font-semibold uppercase tracking-widest mb-2">
              A Lets Train preparou para você
            </p>
            <h1 className="text-2xl font-bold leading-tight">{workout.nome}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
              <span>⏱ {workout.duracao_estimada} min</span>
              <span>·</span>
              <span className="capitalize">{nivel.replace(/_/g, ' ')}</span>
              <span>·</span>
              <span>{totalExs} exercícios</span>
            </div>
          </motion.div>

          {/* Blocos */}
          <div className="flex flex-col gap-3">
            {blocos.map((bloco, i) => (
              bloco.exs.length > 0 && (
                <motion.div
                  key={bloco.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                >
                  {/* Bloco header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
                    style={{ borderLeftColor: bloco.cor, borderLeftWidth: 3 }}
                  >
                    <div>
                      <span className="text-sm font-bold" style={{ color: bloco.cor }}>{bloco.label}</span>
                      <p className="text-[11px] text-white/35 mt-0.5">{bloco.desc}</p>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: bloco.cor, backgroundColor: bloco.cor + '20' }}
                    >
                      {bloco.exs.length}×
                    </span>
                  </div>

                  {/* Lista de exercícios */}
                  <div className="px-4 py-2 flex flex-col gap-1.5">
                    {bloco.exs.map((ex, j) => (
                      <div key={j} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {ex.biset && (
                            <span className="shrink-0 text-[9px] text-[#FF8C00] font-bold uppercase tracking-wider bg-[#FF8C00]/10 border border-[#FF8C00]/20 px-1.5 py-0.5 rounded">
                              BI-SET
                            </span>
                          )}
                          <span className="text-sm text-white/70 truncate">{ex.nome}</span>
                        </div>
                        <span className="text-xs text-white/35 ml-2 shrink-0">
                          {ex.series}× {ex.repeticoes}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <motion.div
        className="px-6 pb-10 pt-4 border-t border-white/[0.05]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <div className="max-w-sm mx-auto">
          <Button fullWidth onClick={onStart}>
            Começar Treino →
          </Button>
        </div>
      </motion.div>
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

  const [view, setView] = useState<'overview' | 'exercise'>(jaExecutado ? 'exercise' : 'overview')
  const [current, setCurrent] = useState(jaExecutado ? total - 1 : 0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [showConfirm, setShowConfirm] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [videoExercise, setVideoExercise] = useState<string | null>(null)

  if (view === 'overview') {
    return <WorkoutOverview workout={workout} nivel={nivel} onStart={() => setView('exercise')} />
  }

  const ex = flatList[current]
  const isLast = current === total - 1
  const progressPct = Math.round(((current + 1) / total) * 100)

  function goNext() {
    if (isLast && !jaExecutado) { setShowConfirm(true); return }
    if (isLast) return
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
              {jaExecutado ? '← Dashboard' : '← Sair'}
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
                  {/* Bi-set banner */}
                  {ex.biset && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#FF8C00]/25 bg-[#FF8C00]/[0.06]">
                      <span className="text-[#FF8C00] text-xs font-bold">🔗 BI-SET</span>
                      <span className="text-white/40 text-xs">Execute em seguida, sem descanso</span>
                      {flatList[current + 1] && (
                        <span className="text-white/55 text-xs font-semibold ml-auto shrink-0">
                          → {flatList[current + 1].nome}
                        </span>
                      )}
                    </div>
                  )}

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
                  <button
                    type="button"
                    onClick={() => setVideoExercise(ex.nome)}
                    className="flex items-center justify-center gap-2 h-10 w-full rounded-xl border border-[#FF8C00]/30 bg-[#FF8C00]/[0.06] text-sm text-[#FF8C00] hover:bg-[#FF8C00]/[0.12] transition-all"
                  >
                    <span>▶</span> Visualizar vídeo
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navegação */}
        <div className="px-6 pb-10 pt-4">
          {jaExecutado ? (
            <div className="max-w-sm mx-auto flex gap-3">
              {current > 0 && (
                <Button variant="outline" onClick={goPrev} className="flex-none w-14">
                  ←
                </Button>
              )}
              {!isLast && (
                <Button fullWidth onClick={goNext}>
                  Próximo →
                </Button>
              )}
              {isLast && (
                <Button fullWidth onClick={() => router.push('/dashboard')}>
                  🏠 Ir para o Dashboard
                </Button>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* Modal de vídeo */}
      {videoExercise && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setVideoExercise(null)}
        >
          <div
            className="w-full max-w-sm bg-[#111] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-sm font-semibold truncate pr-2">{videoExercise}</p>
              <button
                onClick={() => setVideoExercise(null)}
                className="text-white/40 hover:text-white transition-colors text-lg shrink-0"
              >
                ✕
              </button>
            </div>
            <video
              key={videoExercise}
              src={getExerciseVideoUrl(videoExercise)}
              controls
              autoPlay
              playsInline
              className="w-full aspect-video bg-black"
            />
          </div>
        </div>
      )}
    </>
  )
}
