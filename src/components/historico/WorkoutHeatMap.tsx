'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WorkoutDay {
  data: string          // YYYY-MM-DD
  rating: number | null // 1-5
}

interface Props {
  workoutDates: WorkoutDay[]
  streakAtual: number
}

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function getHoje(): string {
  const d = new Date(Date.now() - 3 * 60 * 60 * 1000) // UTC-3 Brasília
  return d.toISOString().split('T')[0]
}

function getCellColor(rating: number | null): string {
  if (rating === null) return 'bg-orange-500/50'
  if (rating >= 4) return 'bg-orange-500'
  if (rating >= 3) return 'bg-orange-500/60'
  return 'bg-orange-400/40'
}

export default function WorkoutHeatMap({ workoutDates, streakAtual }: Props) {
  const hoje = getHoje()
  const [mesAtual, setMesAtual] = useState(() => {
    const d = new Date(Date.now() - 3 * 60 * 60 * 1000)
    return { ano: d.getFullYear(), mes: d.getMonth() }
  })

  const workoutMap = useMemo(() => {
    const map = new Map<string, number | null>()
    for (const w of workoutDates) {
      map.set(w.data, w.rating)
    }
    return map
  }, [workoutDates])

  // Gera dias do mês selecionado
  const diasDoMes = useMemo(() => {
    const primeiroDia = new Date(mesAtual.ano, mesAtual.mes, 1)
    const ultimoDia = new Date(mesAtual.ano, mesAtual.mes + 1, 0)
    const diaSemanaInicio = primeiroDia.getDay() // 0=Dom

    const dias: (string | null)[] = []

    // Padding para alinhar com dia da semana
    for (let i = 0; i < diaSemanaInicio; i++) dias.push(null)

    // Dias do mês
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const data = `${mesAtual.ano}-${String(mesAtual.mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      dias.push(data)
    }

    return dias
  }, [mesAtual])

  // Stats do mês
  const stats = useMemo(() => {
    const treinosNoMes = diasDoMes.filter((d) => d && workoutMap.has(d)).length
    const diasNoMes = new Date(mesAtual.ano, mesAtual.mes + 1, 0).getDate()
    const semanasNoMes = Math.ceil(diasNoMes / 7)
    const freqSemanal = semanasNoMes > 0 ? (treinosNoMes / semanasNoMes).toFixed(1) : '0'
    return { treinosNoMes, freqSemanal }
  }, [diasDoMes, workoutMap, mesAtual])

  const navMes = (dir: -1 | 1) => {
    setMesAtual((prev) => {
      let m = prev.mes + dir
      let a = prev.ano
      if (m < 0) { m = 11; a-- }
      if (m > 11) { m = 0; a++ }
      return { ano: a, mes: m }
    })
  }

  // Não navegar além do mês atual
  const hojeDate = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const podeAvancar = mesAtual.ano < hojeDate.getFullYear() ||
    (mesAtual.ano === hojeDate.getFullYear() && mesAtual.mes < hojeDate.getMonth())

  const handleDayClick = (data: string) => {
    const el = document.getElementById(`workout-${data}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 mb-6">
      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
        <span className="flex items-center gap-1">
          <span className="text-orange-400 font-semibold">{stats.treinosNoMes}</span> treinos
        </span>
        <span className="text-zinc-700">·</span>
        <span className="flex items-center gap-1">
          🔥 <span className="text-orange-400 font-semibold">{streakAtual}</span> dias
        </span>
        <span className="text-zinc-700">·</span>
        <span className="flex items-center gap-1">
          <span className="text-orange-400 font-semibold">{stats.freqSemanal}</span> treinos/sem
        </span>
      </div>

      {/* Navegação mês */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navMes(-1)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-zinc-200">
          {MESES[mesAtual.mes]} {mesAtual.ano}
        </span>
        <button
          onClick={() => navMes(1)}
          disabled={!podeAvancar}
          className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 disabled:opacity-20 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>

      {/* Header dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="text-[10px] text-zinc-500 text-center font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Grid do mês */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${mesAtual.ano}-${mesAtual.mes}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-7 gap-1"
        >
          {diasDoMes.map((data, i) => {
            if (!data) {
              return <div key={`empty-${i}`} className="aspect-square" />
            }

            const temTreino = workoutMap.has(data)
            const rating = workoutMap.get(data) ?? null
            const isHoje = data === hoje
            const isFuturo = data > hoje

            return (
              <button
                key={data}
                onClick={() => temTreino && handleDayClick(data)}
                disabled={!temTreino}
                className={`
                  aspect-square rounded-md text-[10px] font-medium flex items-center justify-center
                  transition-all duration-150
                  ${temTreino
                    ? `${getCellColor(rating)} text-white cursor-pointer hover:scale-110 hover:ring-1 hover:ring-orange-400/50`
                    : isFuturo
                      ? 'bg-zinc-800/10 text-zinc-700'
                      : 'bg-zinc-800/30 text-zinc-600'
                  }
                  ${isHoje ? 'ring-1 ring-white/60' : ''}
                `}
              >
                {parseInt(data.split('-')[2])}
              </button>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {/* Legenda */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-zinc-500">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-zinc-800/30" />
          <span>Sem treino</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-orange-400/40" />
          <span>Treinou</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
          <span>Treino top</span>
        </div>
      </div>
    </div>
  )
}
