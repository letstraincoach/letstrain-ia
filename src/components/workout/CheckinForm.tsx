'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'

export type TrainingLocation = 'condominio' | 'academia' | 'hotel'

export interface CheckinData {
  local_treino: TrainingLocation
  ultima_refeicao: string
  tempo_disponivel: number
  disposicao: number
}

interface CheckinFormProps {
  onSubmit: (data: CheckinData) => void
  loading?: boolean
}

const LOCAL_OPTIONS: { value: TrainingLocation; label: string; emoji: string; detail: string }[] = [
  { value: 'condominio', label: 'Condomínio / Casa', emoji: '🏠', detail: 'Equipamentos básicos' },
  { value: 'academia', label: 'Academia', emoji: '🏋️', detail: 'Equipamentos completos' },
  { value: 'hotel', label: 'Hotel / Viagem', emoji: '✈️', detail: 'Sem equipamentos' },
]

const REFEICAO_OPTIONS = [
  { value: 'menos_1h', label: 'Há menos de 1h', emoji: '🍽️', detail: 'Acabei de comer' },
  { value: '1_2h', label: '1 a 2 horas atrás', emoji: '⏰', detail: 'Energia no ponto' },
  { value: 'mais_2h', label: 'Mais de 2 horas', emoji: '🔋', detail: 'Pronto para tudo' },
]

function disposicaoEmoji(value: number): string {
  if (value <= 3) return '😴'
  if (value <= 6) return '😐'
  return '💪'
}

function disposicaoLabel(value: number): string {
  if (value <= 3) return 'Bem cansado'
  if (value <= 5) return 'Na média'
  if (value <= 7) return 'Animado'
  return 'Energia total!'
}

export default function CheckinForm({ onSubmit, loading = false }: CheckinFormProps) {
  const [step, setStep] = useState(0)
  const [local, setLocal] = useState<TrainingLocation | null>(null)
  const [refeicao, setRefeicao] = useState<string | null>(null)
  const [tempo, setTempo] = useState(45)
  const [disposicao, setDisposicao] = useState(7)

  function handleSubmit() {
    if (!refeicao || !local) return
    onSubmit({
      local_treino: local,
      ultima_refeicao: refeicao,
      tempo_disponivel: tempo,
      disposicao,
    })
  }

  const steps = [
    // Step 0 — Local do treino
    <motion.div
      key="local"
      className="flex flex-col gap-6 w-full"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Pergunta 1 de 4</p>
        <h2 className="text-xl font-bold">Onde você vai treinar hoje?</h2>
      </div>
      <div className="flex flex-col gap-3">
        {LOCAL_OPTIONS.map((opt) => {
          const selected = local === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setLocal(opt.value); setTimeout(() => setStep(1), 200) }}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]
                ${selected
                  ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-xs text-white/40">{opt.detail}</p>
              </div>
            </button>
          )
        })}
      </div>
    </motion.div>,

    // Step 1 — Última refeição
    <motion.div
      key="refeicao"
      className="flex flex-col gap-6 w-full"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Pergunta 2 de 4</p>
        <h2 className="text-xl font-bold">Quando foi sua última refeição?</h2>
      </div>
      <div className="flex flex-col gap-3">
        {REFEICAO_OPTIONS.map((opt) => {
          const selected = refeicao === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setRefeicao(opt.value); setTimeout(() => setStep(2), 200) }}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]
                ${selected
                  ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-xs text-white/40">{opt.detail}</p>
              </div>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => setStep(0)}
        className="text-sm text-white/30 hover:text-white/60 transition-colors"
      >
        ← Voltar
      </button>
    </motion.div>,

    // Step 2 — Tempo disponível
    <motion.div
      key="tempo"
      className="flex flex-col gap-6 w-full"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Pergunta 3 de 4</p>
        <h2 className="text-xl font-bold">Quanto tempo você tem para treinar hoje?</h2>
      </div>

      {/* Display do valor */}
      <div className="flex flex-col items-center gap-1 py-4">
        <span className="text-5xl font-bold text-[#FF8C00]">{tempo}</span>
        <span className="text-sm text-white/50">minutos</span>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-2">
        <input
          type="range"
          min={20}
          max={90}
          step={5}
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          className="w-full accent-[#FF8C00] h-2 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>20 min</span>
          <span>90 min</span>
        </div>
      </div>

      <Button fullWidth onClick={() => setStep(3)}>
        Próximo →
      </Button>
      <button
        type="button"
        onClick={() => setStep(1)}
        className="text-sm text-white/30 hover:text-white/60 transition-colors"
      >
        ← Voltar
      </button>
    </motion.div>,

    // Step 3 — Disposição
    <motion.div
      key="disposicao"
      className="flex flex-col gap-6 w-full"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Pergunta 4 de 4</p>
        <h2 className="text-xl font-bold">De 1 a 10, qual sua disposição hoje?</h2>
      </div>

      {/* Display */}
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-5xl">{disposicaoEmoji(disposicao)}</span>
        <span className="text-4xl font-bold text-[#FF8C00]">{disposicao}</span>
        <span className="text-sm text-white/50">{disposicaoLabel(disposicao)}</span>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-2">
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={disposicao}
          onChange={(e) => setDisposicao(Number(e.target.value))}
          className="w-full accent-[#FF8C00] h-2 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>1 — sem energia</span>
          <span>10 — irado!</span>
        </div>
      </div>

      <Button fullWidth loading={loading} onClick={handleSubmit}>
        Gerar meu treino 🚀
      </Button>
      <button
        type="button"
        onClick={() => setStep(2)}
        className="text-sm text-white/30 hover:text-white/60 transition-colors"
        disabled={loading}
      >
        ← Voltar
      </button>
    </motion.div>,
  ]

  return (
    <div className="flex flex-col items-center w-full max-w-sm gap-2">
      {/* Barra de progresso */}
      <div className="flex gap-1.5 mb-4 w-full">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-[#FF8C00]' : 'bg-white/10'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>
    </div>
  )
}
