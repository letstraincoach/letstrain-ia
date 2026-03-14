'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

// ── Milestones + benefits ────────────────────────────────────────────────────
const MILESTONES = [
  {
    horas: 12,
    titulo: '12h de jejum',
    desc: 'Glicogênio zerado! Corpo iniciando queima de gordura como combustível.',
    emoji: '⚡',
  },
  {
    horas: 14,
    titulo: 'Autofagia iniciando!',
    desc: 'Células começando a se limpar — processo anti-aging ativado!',
    emoji: '🔬',
  },
  {
    horas: 16,
    titulo: 'Queima de gordura máxima',
    desc: 'Pico de lipólise! Você está queimando gordura no ritmo máximo agora.',
    emoji: '🔥',
  },
  {
    horas: 18,
    titulo: 'Anti-inflamatório natural',
    desc: 'Marcadores inflamatórios em queda. Menos dor, mais saúde.',
    emoji: '💚',
  },
  {
    horas: 20,
    titulo: 'GH em alta!',
    desc: 'Hormônio do crescimento até 5× acima do normal. Músculo protegido!',
    emoji: '💪',
  },
  {
    horas: 24,
    titulo: 'Renovação celular plena',
    desc: '24 horas! Autofagia total, limpeza celular intensa. Isso é épico!',
    emoji: '🧬',
  },
  {
    horas: 36,
    titulo: 'Cetose profunda',
    desc: 'Cérebro operando 100% em cetonas. Clareza mental no pico!',
    emoji: '🧠',
  },
  {
    horas: 48,
    titulo: 'Mestre do Jejum!',
    desc: '48 horas — Reset metabólico completo. Você está em outro nível.',
    emoji: '🏆',
  },
]

type Milestone = (typeof MILESTONES)[0]

// ── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatElapsed(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return { h, m, s }
}

function formatRemaining(horasLeft: number): string {
  if (horasLeft >= 1) {
    const h = Math.floor(horasLeft)
    const m = Math.round((horasLeft - h) * 60)
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }
  return `${Math.round(horasLeft * 60)}min`
}

// ── Types ────────────────────────────────────────────────────────────────────
interface NewAchievement {
  codigo: string
  nome: string
  icone_emoji: string
}

type JejumState = 'idle' | 'active' | 'ended'

interface JejumTimerProps {
  jejumInicio: string | null
}

// ── Component ────────────────────────────────────────────────────────────────
export default function JejumTimer({ jejumInicio: initialJejumInicio }: JejumTimerProps) {
  const [jejumInicio, setJejumInicio] = useState<string | null>(initialJejumInicio)
  const [state, setState] = useState<JejumState>(initialJejumInicio ? 'active' : 'idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [loading, setLoading] = useState(false)
  const [milestoneAlert, setMilestoneAlert] = useState<Milestone | null>(null)
  const [endedHoras, setEndedHoras] = useState(0)
  const [endedAchievements, setEndedAchievements] = useState<NewAchievement[]>([])
  const shownRef = useRef<Set<number>>(new Set())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load shown milestones from localStorage (keyed by fast start time)
  useEffect(() => {
    if (!jejumInicio) return
    try {
      const stored = JSON.parse(localStorage.getItem(`jm_${jejumInicio}`) ?? '[]') as number[]
      shownRef.current = new Set(stored)
    } catch {
      shownRef.current = new Set()
    }
  }, [jejumInicio])

  // Live timer
  useEffect(() => {
    if (state !== 'active' || !jejumInicio) return

    const tick = () => {
      const elapsed = Date.now() - new Date(jejumInicio).getTime()
      setElapsedMs(elapsed)

      const horasDecorridas = elapsed / (1000 * 60 * 60)
      for (const ms of MILESTONES) {
        if (horasDecorridas >= ms.horas && !shownRef.current.has(ms.horas)) {
          shownRef.current.add(ms.horas)
          try {
            localStorage.setItem(`jm_${jejumInicio}`, JSON.stringify([...shownRef.current]))
          } catch { /* ignore */ }
          setMilestoneAlert(ms)
          break // show one at a time
        }
      }
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [state, jejumInicio])

  async function handleStart() {
    setLoading(true)
    try {
      const res = await fetch('/api/jejum/start', { method: 'POST' })
      const data = (await res.json()) as { ok?: boolean; jejum_inicio?: string }
      if (res.ok && data.jejum_inicio) {
        setJejumInicio(data.jejum_inicio)
        setElapsedMs(0)
        shownRef.current = new Set()
        setState('active')
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  async function handleEnd() {
    setLoading(true)
    try {
      const res = await fetch('/api/jejum/end', { method: 'POST' })
      const data = (await res.json()) as {
        ok?: boolean
        duracao_horas?: number
        newAchievements?: NewAchievement[]
      }
      if (res.ok) {
        if (jejumInicio) {
          try { localStorage.removeItem(`jm_${jejumInicio}`) } catch { /* ignore */ }
        }
        setEndedHoras(data.duracao_horas ?? 0)
        setEndedAchievements(data.newAchievements ?? [])
        setJejumInicio(null)
        setMilestoneAlert(null)
        setState('ended')
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  // Derived values for active state
  const horasDecorridas = elapsedMs / (1000 * 60 * 60)
  const currentMilestone = [...MILESTONES].reverse().find((m) => horasDecorridas >= m.horas) ?? null
  const nextMilestoneIdx = currentMilestone
    ? MILESTONES.findIndex((m) => m.horas === currentMilestone.horas) + 1
    : 0
  const nextMilestone = MILESTONES[nextMilestoneIdx] ?? null
  const prevHoras = currentMilestone?.horas ?? 0
  const nextHoras = nextMilestone?.horas ?? prevHoras
  const progressToNext = nextMilestone
    ? Math.min(((horasDecorridas - prevHoras) / (nextHoras - prevHoras)) * 100, 100)
    : 100

  const { h, m, s } = formatElapsed(elapsedMs)

  // ── ENDED ──────────────────────────────────────────────────────────────────
  if (state === 'ended') {
    return (
      <motion.div
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex flex-col items-center gap-3 text-center py-1">
          <span className="text-4xl">🎉</span>
          <div>
            <p className="font-bold text-base">Jejum encerrado!</p>
            <p className="text-sm text-white/50 mt-0.5">
              Duração: <span className="text-white/70 font-semibold">{endedHoras.toFixed(1)}h</span>
            </p>
          </div>

          {endedAchievements.length > 0 && (
            <div className="flex flex-col gap-2 w-full mt-1">
              <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold">
                Conquistas desbloqueadas!
              </p>
              {endedAchievements.map((ach) => (
                <div
                  key={ach.codigo}
                  className="flex items-center gap-3 rounded-xl border border-[#FF8C00]/20 bg-[#FF8C00]/5 px-3 py-2"
                >
                  <span className="text-xl">{ach.icone_emoji}</span>
                  <span className="text-sm font-medium">{ach.nome}</span>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => { setState('idle'); setEndedAchievements([]) }}
            className="mt-1 w-full"
          >
            Fechar
          </Button>
        </div>
      </motion.div>
    )
  }

  // ── IDLE ───────────────────────────────────────────────────────────────────
  if (state === 'idle') {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Icon name="moon" className="text-2xl text-white/50" />
          <div>
            <p className="font-semibold text-sm">Jejum Intermitente</p>
            <p className="text-xs text-white/40">Inicie e monitore sua jornada</p>
          </div>
        </div>

        <p className="text-xs text-white/50 leading-relaxed border border-white/10 rounded-xl px-3 py-2.5 bg-white/[0.02]">
          ✅ <span className="text-white/70">Permitido:</span> água, café, chá, creatina<br />
          ❌ <span className="text-white/70">Proibido:</span> qualquer alimento com calorias
        </p>

        <Button fullWidth loading={loading} onClick={handleStart}>
          Iniciar Jejum
        </Button>
      </div>
    )
  }

  // ── ACTIVE ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {/* Milestone alert */}
      <AnimatePresence>
        {milestoneAlert && (
          <motion.div
            key={milestoneAlert.horas}
            className="rounded-2xl border border-[#FF8C00]/30 bg-[#FF8C00]/10 p-4 flex items-start gap-3"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.span
              className="text-2xl shrink-0"
              animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {milestoneAlert.emoji}
            </motion.span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#FF8C00]">{milestoneAlert.titulo}</p>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{milestoneAlert.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => setMilestoneAlert(null)}
              className="text-white/30 hover:text-white/60 transition-colors text-sm shrink-0"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer card */}
      <div className="rounded-3xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.04] p-5 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="moon" className="text-xl text-white/50" />
            <p className="font-semibold text-sm">Jejum Ativo</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            ATIVO
          </span>
        </div>

        {/* Timer display */}
        <div className="flex items-end justify-center gap-1.5">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold tabular-nums text-[#FF8C00]">{pad(h)}</span>
            <span className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">horas</span>
          </div>
          <span className="text-3xl font-bold text-white/20 pb-5">:</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold tabular-nums text-[#FF8C00]">{pad(m)}</span>
            <span className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">min</span>
          </div>
          <span className="text-3xl font-bold text-white/20 pb-5">:</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold tabular-nums text-white/40">{pad(s)}</span>
            <span className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">seg</span>
          </div>
        </div>

        {/* Current milestone benefit */}
        {currentMilestone && (
          <div className="flex items-start gap-2.5 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5">
            <span className="text-lg mt-0.5 shrink-0">{currentMilestone.emoji}</span>
            <div>
              <p className="text-xs font-bold text-[#FF8C00]">{currentMilestone.titulo}</p>
              <p className="text-xs text-white/50 leading-relaxed mt-0.5">{currentMilestone.desc}</p>
            </div>
          </div>
        )}

        {/* Progress to next milestone */}
        {nextMilestone && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">
                Próximo: {nextMilestone.emoji} {nextMilestone.titulo}
              </span>
              <span className="text-white/30 shrink-0 ml-2">
                em {formatRemaining(nextHoras - horasDecorridas)}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#FF8C00] transition-all duration-1000 ease-linear"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        )}

        {/* End button */}
        <Button
          fullWidth
          variant="outline"
          loading={loading}
          onClick={handleEnd}
          className="border-red-500/30 text-red-400 hover:bg-red-500/5 hover:border-red-400/50"
        >
          Encerrar Jejum
        </Button>
      </div>
    </div>
  )
}
