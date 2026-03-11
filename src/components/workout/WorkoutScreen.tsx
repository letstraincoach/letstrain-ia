'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { GeneratedWorkout, WorkoutExercise } from '@/lib/ai/workout-schemas'
import { isNewFormat } from '@/lib/ai/workout-schemas'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { getExerciseVideoUrl } from '@/lib/training/exercise-videos'

// ---- Tipos ----
type SecaoNova = 'Preparação' | 'Força' | 'Circuito' | 'Cardio' | 'Finisher'
type SecaoLegacy = 'Aquecimento' | 'Principal' | 'Cooldown'
type Secao = SecaoNova | SecaoLegacy

interface SetGroupInfo {
  round: number
  totalRounds: number
  position: number      // 1-based: 1 ou 2 (biset) ou 1, 2, 3 (triset)
  totalInGroup: number  // 2 = biset, 3 = triset
  nextName: string | null // nome do próximo exercício do grupo (null se último)
  isLast: boolean       // true = último do grupo neste round → dispara rest
}

interface FlatExercise extends WorkoutExercise {
  secao: Secao
  indexGlobal: number
  totalGlobal: number
  setGroup?: SetGroupInfo
}

function buildFlatList(workout: GeneratedWorkout): FlatExercise[] {
  const sections: { ex: WorkoutExercise; secao: Secao }[] = []

  if (isNewFormat(workout)) {
    ;(workout.preparacao ?? []).forEach((e) => sections.push({ ex: e, secao: 'Preparação' }))
    ;(workout.forca ?? []).forEach((e) => sections.push({ ex: e, secao: 'Força' }))
    ;(workout.circuito ?? []).forEach((e) => sections.push({ ex: e, secao: 'Circuito' }))
    ;(workout.cardio ?? []).forEach((e) => sections.push({ ex: e, secao: 'Cardio' }))
    ;(workout.finisher ?? []).forEach((e) => sections.push({ ex: e, secao: 'Finisher' }))
  } else {
    ;(workout.aquecimento ?? []).forEach((e) => sections.push({ ex: e, secao: 'Aquecimento' }))
    ;(workout.principal ?? []).forEach((e) => sections.push({ ex: e, secao: 'Principal' }))
    ;(workout.cooldown ?? []).forEach((e) => sections.push({ ex: e, secao: 'Cooldown' }))
  }

  // Expandir bi-sets e tri-sets em rounds intercalados
  const result: Omit<FlatExercise, 'indexGlobal' | 'totalGlobal'>[] = []
  let i = 0

  while (i < sections.length) {
    const { ex, secao } = sections[i]

    // ── Bi-set: A(biset=true) + B(biset=false) ────────────────────────────
    if (ex.biset) {
      const partner = sections[i + 1]
      if (partner && !partner.ex.biset && !partner.ex.triset) {
        const rounds = ex.series
        for (let r = 1; r <= rounds; r++) {
          result.push({
            ...ex,
            secao,
            series: 1,
            descanso_segundos: 0,
            setGroup: { round: r, totalRounds: rounds, position: 1, totalInGroup: 2, nextName: partner.ex.nome, isLast: false },
          })
          result.push({
            ...partner.ex,
            secao: partner.secao,
            series: 1,
            setGroup: { round: r, totalRounds: rounds, position: 2, totalInGroup: 2, nextName: null, isLast: true },
          })
        }
        i += 2
        continue
      }
    }

    // ── Tri-set: A(triset=true) + B(triset=true) + C(triset=false) ─────────
    if (ex.triset) {
      const p2 = sections[i + 1]
      const p3 = sections[i + 2]
      if (p2?.ex.triset && p3 && !p3.ex.triset && !p3.ex.biset) {
        const rounds = ex.series
        for (let r = 1; r <= rounds; r++) {
          result.push({
            ...ex,
            secao,
            series: 1,
            descanso_segundos: 0,
            setGroup: { round: r, totalRounds: rounds, position: 1, totalInGroup: 3, nextName: p2.ex.nome, isLast: false },
          })
          result.push({
            ...p2.ex,
            secao: p2.secao,
            series: 1,
            descanso_segundos: 0,
            setGroup: { round: r, totalRounds: rounds, position: 2, totalInGroup: 3, nextName: p3.ex.nome, isLast: false },
          })
          result.push({
            ...p3.ex,
            secao: p3.secao,
            series: 1,
            setGroup: { round: r, totalRounds: rounds, position: 3, totalInGroup: 3, nextName: null, isLast: true },
          })
        }
        i += 3
        continue
      }
    }

    // ── Exercício normal ───────────────────────────────────────────────────
    result.push({ ...ex, secao })
    i++
  }

  const total = result.length
  return result.map((item, idx) => ({ ...item, indexGlobal: idx, totalGlobal: total }))
}

const SECAO_COLOR: Record<Secao, string> = {
  'Preparação': '#F59E0B',
  'Força':      '#FF8C00',
  'Circuito':   '#A855F7',
  'Cardio':     '#22C55E',
  'Finisher':   '#EF4444',
  'Aquecimento': '#F59E0B',
  'Principal':   '#FF8C00',
  'Cooldown':    '#3B82F6',
}

const BLOCO_ICON: Record<string, string> = {
  'Preparação': 'sunrise',
  'Força':      'dumbbell',
  'Circuito Metabólico': 'bolt',
  'Cardio':     'running',
  'Finisher':   'trophy',
  'Aquecimento': 'sunrise',
  'Principal':   'dumbbell',
  'Cooldown':    'moon',
}

const SECAO_TO_KEY: Record<string, string> = {
  'Preparação': 'preparacao',
  'Força':      'forca',
  'Circuito':   'circuito',
  'Cardio':     'cardio',
  'Finisher':   'finisher',
  'Aquecimento': 'aquecimento',
  'Principal':   'principal',
  'Cooldown':    'cooldown',
}

function estimarTempo(exs: WorkoutExercise[], tipo: string): number {
  if (exs.length === 0) return 0
  switch (tipo) {
    case 'preparacao': return Math.max(1, Math.round(exs.length * 1.5))
    case 'forca':      return Math.max(1, Math.round(exs.reduce((acc, e) => acc + e.series * (0.6 + e.descanso_segundos / 60), 0)))
    case 'circuito':   return Math.max(1, Math.round(exs.length * 1.5 + 2))
    case 'cardio':     return Math.max(1, Math.round(exs.length * 5))
    case 'finisher':   return Math.max(1, Math.round(exs.length * 2))
    default:           return Math.max(1, Math.round(exs.length * 2))
  }
}

// ---- Thumbnail de vídeo ----
function ExerciseVideoThumb({ nome, size = 'sm', onClick }: { nome: string; size?: 'sm' | 'lg'; onClick?: () => void }) {
  const url = getExerciseVideoUrl(nome)
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const videoRef = useRef<HTMLVideoElement>(null)
  const dim = size === 'lg' ? 'w-20 h-20' : 'w-12 h-12'

  return (
    <div
      className={`relative ${dim} rounded-xl overflow-hidden shrink-0 bg-white/[0.06] border border-white/10 ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
      onClick={onClick}
    >
      {status !== 'error' && (
        <video
          ref={videoRef}
          src={url + '#t=0.5'}
          preload="metadata"
          muted
          playsInline
          onLoadedData={() => setStatus('ok')}
          onError={() => setStatus('error')}
          className={`absolute inset-0 w-full h-full object-cover ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white/20 animate-pulse" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/20 text-base">▶</span>
        </div>
      )}
      {onClick && status === 'ok' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
            <span className="text-black text-[9px] pl-0.5">▶</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Bloco accordion ----
function BlocoCard({ label, cor, desc, icon, exs, tempoMin, expanded, onToggle, onVideoClick, isCardio }: {
  label: string; cor: string; desc: string; icon: string; exs: WorkoutExercise[]
  tempoMin: number; expanded: boolean; onToggle: () => void; onVideoClick: (nome: string) => void
  isCardio?: boolean
}) {
  if (exs.length === 0) return null
  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
      style={{ borderLeftColor: cor, borderLeftWidth: 3 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3 border-b border-white/[0.06] active:bg-white/[0.03] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon name={icon} className="text-lg shrink-0" />
          <div className="text-left min-w-0">
            <span className="text-sm font-bold block" style={{ color: cor }}>{label}</span>
            <p className="text-[11px] text-white/35 mt-0.5">{desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-[11px] text-white/30">~{tempoMin} min</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: cor, backgroundColor: cor + '20' }}>
            {exs.length}×
          </span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-white/30 text-xs ml-1">▼</motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2 flex flex-col divide-y divide-white/[0.04]">
              {exs.map((ex, j) => (
                <div key={j} className="flex items-center gap-3 py-2.5">
                  <ExerciseVideoThumb nome={ex.nome} size="sm" onClick={() => onVideoClick(ex.nome)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(ex.biset || ex.triset) && (
                        <span className="text-[9px] text-[#FF8C00] font-bold uppercase tracking-wider bg-[#FF8C00]/10 border border-[#FF8C00]/20 px-1.5 py-0.5 rounded shrink-0">
                          {ex.triset ? 'TRI-SET' : 'BI-SET'}
                        </span>
                      )}
                      <span className="text-sm text-white/80 truncate font-medium">{ex.nome}</span>
                    </div>
                    {ex.grupo_muscular && ex.grupo_muscular.length > 0 && (
                      <p className="text-[11px] text-white/30 mt-0.5 truncate">{ex.grupo_muscular.join(' · ')}</p>
                    )}
                  </div>
                  <span className="text-xs text-white/40 shrink-0 font-medium">
                    {isCardio ? ex.repeticoes : `${ex.series}× ${ex.repeticoes}`}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---- Modal de confirmação ----
function ConfirmModal({ onConfirm, onCancel, loading }: { onConfirm: () => void; onCancel: () => void; loading: boolean }) {
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
        <p className="text-sm text-white/50 text-center mb-6">Ótimo trabalho! Confirme para registrar o treino e avaliar.</p>
        <div className="flex flex-col gap-2">
          <Button fullWidth loading={loading} onClick={onConfirm}>Sim, concluir!</Button>
          <Button variant="ghost" fullWidth onClick={onCancel} disabled={loading}>Continuar treinando</Button>
        </div>
      </motion.div>
    </div>
  )
}

// ---- Biometrics badge ----
function BiometricsBadge({ biometrics }: { biometrics: { fc_media?: number; fc_maxima?: number; calorias_reais?: number; peso_treino?: number } }) {
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

// ---- Modal de substituição ----
function SubstituteModal({ alternatives, loading, saving, subsRestantes, onSelect, onClose }: {
  alternatives: { nome: string; instrucoes: string; equipamentos: string[] }[]
  loading: boolean
  saving: string | null
  subsRestantes: number
  onSelect: (alt: { nome: string; instrucoes: string }) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 px-4 pb-6 sm:pb-0" onClick={onClose}>
      <motion.div
        className="bg-[#111] border border-white/10 rounded-3xl p-5 w-full max-w-sm"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold">Trocar exercício</h3>
          <span className="text-xs text-white/40">{subsRestantes}/3 restantes</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-6 h-6 border-2 border-[#FF8C00] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-white/40">Buscando alternativas...</p>
          </div>
        ) : alternatives.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-white/50">Nenhuma alternativa disponível.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {alternatives.map((alt) => (
              <button
                key={alt.nome}
                onClick={() => onSelect(alt)}
                disabled={saving !== null}
                className="text-left rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-[#FF8C00]/40 hover:bg-[#FF8C00]/[0.04] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium flex-1">{alt.nome}</span>
                  {saving === alt.nome && (
                    <div className="w-4 h-4 border-2 border-[#FF8C00] border-t-transparent rounded-full animate-spin shrink-0" />
                  )}
                </div>
                {alt.equipamentos.length > 0 && (
                  <p className="text-[11px] text-white/30 mt-1">{alt.equipamentos.join(' · ')}</p>
                )}
              </button>
            ))}
          </div>
        )}

        <button onClick={onClose} className="mt-4 w-full text-center text-sm text-white/30 hover:text-white/60 py-2 transition-colors">
          Cancelar
        </button>
      </motion.div>
    </div>
  )
}

// ---- Timer de descanso ----
function RestTimer({
  remaining, target, nextExerciseName, nextLabel, onSkip,
}: {
  remaining: number
  target: number
  nextExerciseName: string
  nextLabel: { header: string; counter: string }
  onSkip: () => void
}) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = target > 0 ? remaining / target : 0
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-[#0a0a0a]/96 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <p className="text-xs text-white/35 uppercase tracking-[0.2em] font-semibold">Descanso</p>

        <div className="relative">
          <svg width="148" height="148" viewBox="0 0 148 148">
            <circle cx="74" cy="74" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
            <circle
              cx="74" cy="74" r={radius}
              fill="none" stroke="#FF8C00" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 74 74)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums leading-none">{remaining}</span>
            <span className="text-xs text-white/30 mt-1.5">segundos</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-white/35 mb-1">{nextLabel.header}</p>
          <p className="text-xl font-bold leading-tight">{nextExerciseName}</p>
          <p className="text-sm text-[#FF8C00] font-semibold mt-2">{nextLabel.counter}</p>
        </div>

        <button
          onClick={onSkip}
          className="text-sm text-white/30 hover:text-white/60 transition-colors border border-white/[0.1] rounded-full px-7 py-2.5 active:scale-95"
        >
          Pular descanso →
        </button>
      </div>
    </motion.div>
  )
}

// ---- Overview screen ----
function WorkoutOverview({ workout, nivel, onStart, onVideoClick }: {
  workout: GeneratedWorkout; nivel: string; onStart: () => void; onVideoClick: (nome: string) => void
}) {
  const newFormat = isNewFormat(workout)

  const blocos = newFormat
    ? [
        { label: 'Preparação',          tipo: 'preparacao', cor: '#F59E0B', icon: BLOCO_ICON['Preparação'],          exs: workout.preparacao ?? [], desc: 'Mobilidade · Ativação · Cardio leve' },
        { label: 'Força',               tipo: 'forca',      cor: '#FF8C00', icon: BLOCO_ICON['Força'],               exs: workout.forca ?? [],       desc: 'Força guiada ou funcional' },
        ...(workout.cardio?.length
          ? [{ label: 'Cardio',              tipo: 'cardio',     cor: '#22C55E', icon: BLOCO_ICON['Cardio'],              exs: workout.cardio,            desc: 'Condicionamento aeróbico' }]
          : [{ label: 'Circuito Metabólico', tipo: 'circuito',   cor: '#A855F7', icon: BLOCO_ICON['Circuito Metabólico'], exs: workout.circuito ?? [],    desc: 'HIIT · Sem descanso entre exercícios' }]),
        { label: 'Finisher',            tipo: 'finisher',   cor: '#EF4444', icon: BLOCO_ICON['Finisher'],            exs: workout.finisher ?? [],    desc: 'Estímulo final curto e intenso' },
      ]
    : [
        { label: 'Aquecimento', tipo: 'preparacao', cor: '#F59E0B', icon: BLOCO_ICON['Aquecimento'], exs: workout.aquecimento ?? [], desc: 'Preparação do corpo' },
        { label: 'Principal',   tipo: 'forca',      cor: '#FF8C00', icon: BLOCO_ICON['Principal'],   exs: workout.principal   ?? [], desc: 'Treino principal' },
        { label: 'Cooldown',    tipo: 'finisher',   cor: '#3B82F6', icon: BLOCO_ICON['Cooldown'],    exs: workout.cooldown    ?? [], desc: 'Desaceleração e alongamento' },
      ]

  const totalExs = blocos.reduce((acc, b) => acc + b.exs.length, 0)
  const blocoForca = blocos.find((b) => b.tipo === 'forca')
  const musculosPrincipais = blocoForca ? [...new Set(blocoForca.exs.flatMap((e) => e.grupo_muscular ?? []))] : []

  const initialExpanded = Object.fromEntries(blocos.map((b) => [b.label, b.tipo === 'forca']))
  const [expanded, setExpanded] = useState<Record<string, boolean>>(initialExpanded)

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="flex-1 px-6 pt-10 pb-6 overflow-y-auto">
        <div className="max-w-sm mx-auto flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-xs text-[#FF8C00] font-semibold uppercase tracking-widest mb-2">A Lets Train preparou para você</p>
            <h1 className="text-2xl font-bold leading-tight">{workout.nome}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
              <span><Icon name="clock" className="inline" /> {workout.duracao_estimada} min</span><span>·</span>
              <span className="capitalize">{nivel.replace(/_/g, ' ')}</span><span>·</span>
              <span>{totalExs} exercícios</span>
            </div>
            {musculosPrincipais.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Icon name="dumbbell" className="text-[11px] text-white/30 self-center mr-0.5" />
                {musculosPrincipais.map((m) => (
                  <span key={m} className="text-[11px] px-2.5 py-1 rounded-full bg-[#FF8C00]/10 border border-[#FF8C00]/20 text-[#FF8C00]/80 font-medium capitalize">{m}</span>
                ))}
              </div>
            )}
          </motion.div>

          <div className="flex flex-col gap-3">
            {blocos.map((bloco, i) => (
              <motion.div key={bloco.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 + i * 0.07 }}>
                <BlocoCard
                  label={bloco.label} cor={bloco.cor} desc={bloco.desc} icon={bloco.icon}
                  exs={bloco.exs} tempoMin={estimarTempo(bloco.exs, bloco.tipo)}
                  expanded={expanded[bloco.label] ?? false}
                  onToggle={() => setExpanded((prev) => ({ ...prev, [bloco.label]: !prev[bloco.label] }))}
                  onVideoClick={onVideoClick}
                  isCardio={bloco.tipo === 'cardio'}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div className="px-6 pb-10 pt-4 border-t border-white/[0.05]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.3 }}>
        <div className="max-w-sm mx-auto">
          <Button fullWidth onClick={onStart}>Começar Treino →</Button>
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
  const [workoutData, setWorkoutData] = useState(workout)
  const flatList = buildFlatList(workoutData)
  const total = flatList.length

  // ── Substitute state ──
  const [subModalOpen, setSubModalOpen] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const [subSaving, setSubSaving] = useState<string | null>(null)
  const [subAlternatives, setSubAlternatives] = useState<{ nome: string; instrucoes: string; equipamentos: string[] }[]>([])
  const [subsRestantes, setSubsRestantes] = useState(() => {
    const subs = (workout as Record<string, unknown>).substituicoes
    return 3 - (typeof subs === 'number' ? subs : 0)
  })

  const [view, setView] = useState<'overview' | 'exercise'>(jaExecutado ? 'exercise' : 'overview')
  const [current, setCurrent] = useState(jaExecutado ? total - 1 : 0)
  const [direction, setDirection] = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [videoExercise, setVideoExercise] = useState<string | null>(null)

  // ── Rest timer state ────────────────────────────────────────────────────
  const [currentSet, setCurrentSet] = useState(1)
  const [restActive, setRestActive] = useState(false)
  const [restRemaining, setRestRemaining] = useState(0)
  const [restTarget, setRestTarget] = useState(0)
  const [restNextLabel, setRestNextLabel] = useState<{ header: string; counter: string }>({ header: 'Próxima série', counter: '' })
  const [restNextName, setRestNextName] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onRestCompleteRef = useRef<() => void>(() => {})

  useEffect(() => { setCurrentSet(1) }, [current])
  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [])

  function playBeep(type: 'start' | 'end') {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const gain = ctx.createGain()
      gain.gain.value = 0.25
      gain.connect(ctx.destination)
      if (type === 'start') {
        const osc = ctx.createOscillator()
        osc.frequency.value = 440
        osc.connect(gain)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.18)
      } else {
        ;[440, 550, 660].forEach((freq, i) => {
          const osc = ctx.createOscillator()
          osc.frequency.value = freq
          osc.connect(gain)
          osc.start(ctx.currentTime + i * 0.18)
          osc.stop(ctx.currentTime + i * 0.18 + 0.14)
        })
      }
      setTimeout(() => ctx.close(), 2000)
    } catch { /* ignore */ }
  }

  function startRest(
    seconds: number,
    onComplete: () => void,
    nextName: string,
    nextLabel: { header: string; counter: string },
  ) {
    if (seconds <= 0) { onComplete(); return }
    playBeep('start')
    onRestCompleteRef.current = onComplete
    setRestTarget(seconds)
    setRestRemaining(seconds)
    setRestNextName(nextName)
    setRestNextLabel(nextLabel)
    setRestActive(true)

    let remaining = seconds
    timerRef.current = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        setRestRemaining(0)
        setRestActive(false)
        playBeep('end')
        onComplete()
      } else {
        setRestRemaining(remaining)
      }
    }, 1000)
  }

  function skipRest() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setRestActive(false)
    setRestRemaining(0)
    onRestCompleteRef.current()
  }

  if (view === 'overview') {
    return (
      <>
        <WorkoutOverview workout={workoutData} nivel={nivel} onStart={() => setView('exercise')} onVideoClick={setVideoExercise} />
        <VideoModal nome={videoExercise} onClose={() => setVideoExercise(null)} />
      </>
    )
  }

  const ex = flatList[current]
  const isLast = current === total - 1
  const progressPct = Math.round(((current + 1) / total) * 100)

  function advance() {
    setDirection(1)
    setCurrent((c) => c + 1)
  }

  function goNext() {
    if (jaExecutado) {
      if (!isLast) advance()
      return
    }

    // ── Bi-set / tri-set (expanded rounds) ──────────────────────────────
    if (ex.setGroup) {
      if (!ex.setGroup.isLast) {
        // Ir direto para próximo exercício do grupo, sem timer
        advance()
        return
      }
      // Último do grupo — descanso após o par/trio completo
      if (isLast) { setShowConfirm(true); return }
      const nextEx = flatList[current + 1]
      const nextRound = ex.setGroup.round + 1
      const isLastRound = ex.setGroup.round === ex.setGroup.totalRounds
      startRest(
        ex.descanso_segundos,
        advance,
        isLastRound ? (nextEx?.nome ?? '') : flatList[current + 1]?.nome ?? '',
        isLastRound
          ? { header: 'Próximo exercício', counter: '' }
          : { header: 'Próximo round', counter: `Round ${nextRound} de ${ex.setGroup.totalRounds}` },
      )
      return
    }

    // ── Cardio machine: sem séries nem descanso, avança direto ──────────────
    if (ex.secao === 'Cardio') {
      if (isLast) { setShowConfirm(true); return }
      advance()
      return
    }

    // ── Exercício normal: tracking de séries ─────────────────────────────
    if (currentSet < ex.series) {
      startRest(
        ex.descanso_segundos,
        () => setCurrentSet((s) => s + 1),
        ex.nome,
        { header: 'Próxima série', counter: `Série ${currentSet + 1} de ${ex.series}` },
      )
      return
    }

    if (isLast) { setShowConfirm(true); return }
    advance()
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

  async function fetchAlternatives() {
    const grupoMuscular = ex.grupo_muscular?.[0]
    if (!grupoMuscular) return
    setSubModalOpen(true)
    setSubLoading(true)
    setSubAlternatives([])
    try {
      const res = await fetch(`/api/workout/${workoutId}/substitute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupoMuscular }),
      })
      const data = await res.json()
      if (res.ok) {
        setSubAlternatives(data.alternatives)
        setSubsRestantes(data.substituicoesRestantes)
      }
    } catch { /* ignore */ }
    setSubLoading(false)
  }

  async function applySubstitute(alt: { nome: string; instrucoes: string }) {
    const secaoKey = SECAO_TO_KEY[ex.secao]
    const secaoArr = (workoutData as Record<string, unknown>)[secaoKey]
    if (!Array.isArray(secaoArr)) return
    const exerciseIndex = secaoArr.findIndex((e: { nome: string }) => e.nome === ex.nome)
    if (exerciseIndex === -1) return

    setSubSaving(alt.nome)
    try {
      const res = await fetch(`/api/workout/${workoutId}/substitute`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secao: secaoKey, exerciseIndex, novoExercicio: alt }),
      })
      const data = await res.json()
      if (res.ok) {
        setWorkoutData((prev) => {
          const updated = JSON.parse(JSON.stringify(prev)) as GeneratedWorkout
          const arr = (updated as Record<string, unknown>)[secaoKey]
          if (Array.isArray(arr) && arr[exerciseIndex]) {
            arr[exerciseIndex] = { ...arr[exerciseIndex], nome: alt.nome, instrucoes: alt.instrucoes }
          }
          return updated
        })
        setSubsRestantes(data.substituicoesRestantes)
        setSubModalOpen(false)
      }
    } catch { /* ignore */ }
    setSubSaving(null)
  }

  const variants = {
    enter:  (dir: number) => ({ x: dir > 0 ?  60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir > 0 ? -60 :  60, opacity: 0 }),
  }

  // ── Calcular label do botão ──────────────────────────────────────────
  function buttonLabel(): string {
    if (ex.secao === 'Cardio') {
      if (isLast) return '🏁 Concluir Treino'
      return 'Concluído → Próximo Exercício'
    }
    if (ex.setGroup) {
      if (!ex.setGroup.isLast) return `→ ${ex.setGroup.nextName}`
      if (isLast) return '🏁 Concluir Treino'
      return ex.setGroup.round === ex.setGroup.totalRounds ? 'Próximo Exercício →' : `Descanso → Round ${ex.setGroup.round + 1}`
    }
    if (currentSet < ex.series) return `✓ Série ${currentSet} de ${ex.series} concluída`
    if (isLast) return '🏁 Concluir Treino'
    return 'Próximo Exercício →'
  }

  return (
    <>
      {showConfirm && <ConfirmModal onConfirm={handleComplete} onCancel={() => setShowConfirm(false)} loading={completing} />}
      {subModalOpen && (
        <SubstituteModal
          alternatives={subAlternatives}
          loading={subLoading}
          saving={subSaving}
          subsRestantes={subsRestantes}
          onSelect={applySubstitute}
          onClose={() => setSubModalOpen(false)}
        />
      )}

      <AnimatePresence>
        {restActive && (
          <RestTimer
            remaining={restRemaining}
            target={restTarget}
            nextExerciseName={restNextName}
            nextLabel={restNextLabel}
            onSkip={skipRest}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-10 pb-4">
          <div className="max-w-sm mx-auto">
            <button
              onClick={() => jaExecutado ? router.push('/dashboard') : setView('overview')}
              className="text-sm text-white/40 hover:text-white/70 transition-colors mb-4 flex items-center gap-1"
            >
              {jaExecutado ? '← Dashboard' : '← Visão geral'}
            </button>
            <h1 className="text-lg font-bold leading-tight truncate">{workout.nome}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
              <span><Icon name="clock" className="inline" /> {workout.duracao_estimada} min</span><span>·</span>
              <span className="capitalize">{nivel}</span><span>·</span>
              <span>{current + 1} / {total}</span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full bg-[#FF8C00]" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
            </div>
            {jaExecutado && biometrics && <BiometricsBadge biometrics={biometrics} />}
          </div>
        </div>

        {/* Card */}
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
                className="flex flex-col gap-4"
              >
                {/* Badge de seção */}
                <span
                  className="self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                  style={{ color: SECAO_COLOR[ex.secao], backgroundColor: SECAO_COLOR[ex.secao] + '20' }}
                >
                  {ex.secao}
                </span>

                {/* Card principal */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 flex flex-col gap-4">

                  {/* Banner bi-set/tri-set com setGroup info */}
                  {ex.setGroup && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#FF8C00]/25 bg-[#FF8C00]/[0.06]">
                      <span className="text-[#FF8C00] text-xs font-bold shrink-0">
                        {ex.setGroup.totalInGroup === 3 ? <><Icon name="link" /> TRI-SET</> : <><Icon name="link" /> BI-SET</>}
                        {' '}· {ex.setGroup.position}/{ex.setGroup.totalInGroup}
                      </span>
                      {ex.setGroup.nextName
                        ? <span className="text-white/40 text-xs ml-auto shrink-0">→ {ex.setGroup.nextName}</span>
                        : <span className="text-white/40 text-xs ml-auto shrink-0">Execute e descanse</span>
                      }
                    </div>
                  )}

                  {/* Banner bi-set/tri-set legacy (sem setGroup) */}
                  {!ex.setGroup && (ex.biset || ex.triset) && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#FF8C00]/25 bg-[#FF8C00]/[0.06]">
                      <span className="text-[#FF8C00] text-xs font-bold flex items-center gap-1">{ex.triset ? <><Icon name="link" /> TRI-SET</> : <><Icon name="link" /> BI-SET</>}</span>
                      <span className="text-white/40 text-xs">Execute em seguida, sem descanso</span>
                      {flatList[current + 1] && <span className="text-white/55 text-xs font-semibold ml-auto shrink-0">→ {flatList[current + 1].nome}</span>}
                    </div>
                  )}

                  {/* Nome + thumbnail */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold leading-tight">{ex.nome}</h2>
                      {ex.grupo_muscular && ex.grupo_muscular.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {ex.grupo_muscular.map((g) => (
                            <span key={g} className="px-2.5 py-1 rounded-full text-xs bg-white/8 text-white/60 border border-white/10">{g}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ExerciseVideoThumb nome={ex.nome} size="lg" onClick={() => setVideoExercise(ex.nome)} />
                  </div>

                  {/* Séries / Reps / Descanso — cardio só mostra duração */}
                  {ex.secao === 'Cardio' ? (
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] py-4 px-10">
                        <span className="text-2xl font-bold text-[#FF8C00]">{ex.repeticoes}</span>
                        <span className="text-xs text-white/40">Duração</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Séries',   value: ex.setGroup ? `${ex.setGroup.totalRounds}×` : String(ex.series) },
                        { label: 'Reps',     value: ex.repeticoes },
                        { label: 'Descanso', value: ex.setGroup?.isLast && ex.descanso_segundos > 0 ? `${ex.descanso_segundos}s` : ex.setGroup ? '—' : ex.descanso_segundos > 0 ? `${ex.descanso_segundos}s` : '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3">
                          <span className="text-xl font-bold text-[#FF8C00]">{value}</span>
                          <span className="text-xs text-white/40">{label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progresso de rounds (setGroup) */}
                  {!jaExecutado && ex.setGroup && (
                    <div className="flex items-center justify-center gap-2">
                      {Array.from({ length: ex.setGroup.totalRounds }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-full transition-all duration-300 ${
                            i < ex.setGroup!.round - 1 ? 'w-2.5 h-2.5 bg-[#FF8C00]' :
                            i === ex.setGroup!.round - 1 ? 'w-3 h-3 bg-[#FF8C00] ring-2 ring-[#FF8C00]/35' :
                            'w-2 h-2 bg-white/15'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-white/35 ml-1">Round {ex.setGroup.round}/{ex.setGroup.totalRounds}</span>
                    </div>
                  )}

                  {/* Progresso de séries (exercício normal — hidden para cardio) */}
                  {!jaExecutado && !ex.setGroup && ex.series > 1 && ex.secao !== 'Cardio' && (
                    <div className="flex items-center justify-center gap-2">
                      {Array.from({ length: ex.series }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-full transition-all duration-300 ${
                            i < currentSet - 1 ? 'w-2.5 h-2.5 bg-[#FF8C00]' :
                            i === currentSet - 1 ? 'w-3 h-3 bg-[#FF8C00] ring-2 ring-[#FF8C00]/35' :
                            'w-2 h-2 bg-white/15'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-white/35 ml-1">Série {currentSet}/{ex.series}</span>
                    </div>
                  )}

                  {/* Instruções */}
                  {ex.instrucoes && <p className="text-sm text-white/60 leading-relaxed">{ex.instrucoes}</p>}

                  {/* Botão trocar exercício */}
                  {!jaExecutado && subsRestantes > 0 && ex.grupo_muscular && ex.grupo_muscular.length > 0 && (
                    <button
                      onClick={fetchAlternatives}
                      className="self-end flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors py-1"
                    >
                      <Icon name="refresh" /> Trocar
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navegação */}
        <div className="px-6 pb-10 pt-4">
          {jaExecutado ? (
            <div className="max-w-sm mx-auto flex gap-3">
              {current > 0 && <Button variant="outline" onClick={goPrev} className="flex-none w-14">←</Button>}
              {!isLast && <Button fullWidth onClick={goNext}>Próximo →</Button>}
              {isLast && <Button fullWidth onClick={() => router.push('/dashboard')}>🏠 Ir para o Dashboard</Button>}
            </div>
          ) : (
            <div className="max-w-sm mx-auto flex gap-3">
              {current > 0 && <Button variant="outline" onClick={goPrev} className="flex-none w-14">←</Button>}
              <Button fullWidth onClick={goNext}>{buttonLabel()}</Button>
            </div>
          )}
        </div>
      </div>

      <VideoModal nome={videoExercise} onClose={() => setVideoExercise(null)} />
    </>
  )
}

// ---- Modal de vídeo ----
function VideoModal({ nome, onClose }: { nome: string | null; onClose: () => void }) {
  if (!nome) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <motion.div
        className="w-full max-w-sm bg-[#111] rounded-2xl overflow-hidden"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <p className="text-sm font-semibold truncate pr-2">{nome}</p>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-lg shrink-0">✕</button>
        </div>
        <video key={nome} src={getExerciseVideoUrl(nome)} controls autoPlay playsInline className="w-full aspect-video bg-black" />
      </motion.div>
    </div>
  )
}
