'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export type TrainingLocation = 'condominio' | 'hotel'

export interface CheckinData {
  local_treino: TrainingLocation
  ultima_refeicao: string
  tempo_disponivel: number
  disposicao: number
  equipamentos_hotel?: string[]
}

interface CheckinFormProps {
  onSubmit: (data: CheckinData) => void
  loading?: boolean
  userId?: string
}

const LOCAL_OPTIONS: { value: TrainingLocation; label: string; emoji: string; detail: string }[] = [
  { value: 'condominio', label: 'Condomínio / Casa', emoji: '🏠', detail: 'Treino direto com seus equipamentos' },
  { value: 'hotel', label: 'Hotel / Viagem', emoji: '✈️', detail: 'Detectar por foto' },
]

// ── Componente de detecção de equipamentos para hotel ──────────────────────────
interface DetectedItem {
  nome: string
  categoria: string
  confianca: 'alta' | 'media' | 'baixa'
  confirmed: boolean
}

const CONFIANCA_COLOR: Record<string, string> = {
  alta: 'text-[#FF8C00]',
  media: 'text-yellow-400',
  baixa: 'text-white/40',
}

function HotelEquipmentStep({
  userId,
  onConfirm,
  onBack,
}: {
  userId: string
  onConfirm: (equipment: string[]) => void
  onBack: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState<DetectedItem[] | null>(null)
  const [customName, setCustomName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const detectStep = detected !== null

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError(null)
    const selected = Array.from(files).slice(0, 12)
    setPreviews(selected.map((f) => URL.createObjectURL(f)))

    setUploading(true)
    const supabase = createClient()
    const urls: string[] = []

    for (const file of selected) {
      const path = `${userId}/hotel-checkin/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
      const { error: uploadError } = await supabase.storage
        .from('equipment-photos')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setError('Erro ao enviar foto. Verifique sua conexão.')
        setUploading(false)
        return
      }

      const { data: pub } = supabase.storage.from('equipment-photos').getPublicUrl(path)
      urls.push(pub.publicUrl)
    }

    setUploadedUrls(urls)
    setUploading(false)
  }

  async function handleDetect() {
    if (!uploadedUrls.length) return
    setDetecting(true)
    setError(null)

    try {
      const res = await fetch('/api/equipment/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: uploadedUrls }),
      })
      const data = (await res.json()) as { equipamentos?: DetectedItem[]; error?: string }

      if (!res.ok || data.error) {
        setError(data.error ?? 'Erro ao analisar imagens.')
        setDetecting(false)
        return
      }

      setDetected((data.equipamentos ?? []).map((e) => ({ ...e, confirmed: true })))
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setDetecting(false)
    }
  }

  function toggleItem(idx: number) {
    setDetected((prev) => prev?.map((item, i) => i === idx ? { ...item, confirmed: !item.confirmed } : item) ?? null)
  }

  function removeItem(idx: number) {
    setDetected((prev) => prev?.filter((_, i) => i !== idx) ?? null)
  }

  function addCustom() {
    const name = customName.trim()
    if (!name) return
    setDetected((prev) => [...(prev ?? []), { nome: name, categoria: 'funcionais', confianca: 'alta', confirmed: true }])
    setCustomName('')
  }

  function handleConfirm() {
    const names = (detected ?? []).filter((i) => i.confirmed).map((i) => i.nome)
    onConfirm(names)
  }

  const confirmedCount = detected?.filter((i) => i.confirmed).length ?? 0

  return (
    <motion.div
      key="hotel-equip"
      className="flex flex-col gap-6 w-full"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {!detectStep ? (
        <>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Hotel / Viagem</p>
            <h2 className="text-xl font-bold">Fotografe a academia do hotel</h2>
            <p className="mt-1 text-sm text-white/50">
              A IA identifica os aparelhos disponíveis e monta o treino ideal pra você.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-36 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-white/40 hover:border-[#FF8C00]/50 hover:text-[#FF8C00]/70 transition-all duration-200"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium">Toque para adicionar fotos</span>
            <span className="text-xs">Até 12 imagens</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button
            fullWidth
            disabled={!uploadedUrls.length}
            loading={uploading || detecting}
            onClick={handleDetect}
          >
            {uploading ? 'Enviando fotos...' : detecting ? 'A IA está analisando...' : 'Identificar equipamentos'}
          </Button>
          <button
            type="button"
            onClick={() => onConfirm([])}
            className="text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            Pular → treino funcional / peso do corpo
          </button>
          <button type="button" onClick={onBack} className="text-sm text-white/30 hover:text-white/60 transition-colors">
            ← Voltar
          </button>
        </>
      ) : (
        <>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Hotel / Viagem</p>
            <h2 className="text-xl font-bold">Confirme os equipamentos</h2>
            <p className="mt-1 text-sm text-white/50">
              {detected?.length
                ? `Encontrei ${detected.length} equipamento(s). Remova o que não existir.`
                : 'Não detectei nenhum equipamento. Adicione manualmente.'}
            </p>
          </div>

          {detected && detected.length > 0 && (
            <div className="flex flex-col gap-2">
              {detected.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-150
                    ${item.confirmed ? 'border-white/15 bg-white/[0.04]' : 'border-white/5 bg-transparent opacity-40'}`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleItem(i)}
                      className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors
                        ${item.confirmed ? 'bg-[#FF8C00] border-[#FF8C00]' : 'border-white/30'}`}
                    >
                      {item.confirmed && (
                        <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div>
                      <p className="text-sm font-medium">{item.nome}</p>
                      <p className={`text-xs ${CONFIANCA_COLOR[item.confianca]}`}>Confiança {item.confianca}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-white/30 hover:text-red-400 transition-colors ml-2"
                    aria-label="Remover"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Adicionar equipamento..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              className="flex-1"
            />
            <Button variant="outline" onClick={addCustom} className="shrink-0 px-4">+</Button>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button fullWidth onClick={handleConfirm}>
            {confirmedCount > 0 ? `Usar ${confirmedCount} equipamento(s)` : 'Treino funcional (sem equipamento)'}
          </Button>
          <button
            type="button"
            onClick={() => { setDetected(null); setPreviews([]); setUploadedUrls([]) }}
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Tirar novas fotos
          </button>
          <button type="button" onClick={onBack} className="text-sm text-white/30 hover:text-white/60 transition-colors">
            ← Voltar
          </button>
        </>
      )}
    </motion.div>
  )
}

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

export default function CheckinForm({ onSubmit, loading = false, userId }: CheckinFormProps) {
  const [step, setStep] = useState(0)
  const [local, setLocal] = useState<TrainingLocation | null>(null)
  const [refeicao, setRefeicao] = useState<string | null>(null)
  const [tempo, setTempo] = useState(45)
  const [disposicao, setDisposicao] = useState(7)
  const [showHotelDetect, setShowHotelDetect] = useState(false)
  const [equipamentosHotel, setEquipamentosHotel] = useState<string[]>([])

  function handleSubmit() {
    if (!refeicao || !local) return
    onSubmit({
      local_treino: local,
      ultima_refeicao: refeicao,
      tempo_disponivel: tempo,
      disposicao,
      equipamentos_hotel: local === 'hotel' ? equipamentosHotel : undefined,
    })
  }

  // Condomínio: gera treino direto com defaults — equipamentos e CEP já salvos no onboarding
  function handleCondominioQuickStart() {
    setLocal('condominio')
    onSubmit({
      local_treino: 'condominio',
      ultima_refeicao: '1_2h',
      tempo_disponivel: 45,
      disposicao: 7,
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
              disabled={loading}
              onClick={() => {
                if (opt.value === 'condominio') {
                  handleCondominioQuickStart()
                } else if (opt.value === 'hotel' && userId) {
                  setLocal(opt.value)
                  setTimeout(() => setShowHotelDetect(true), 200)
                } else {
                  setLocal(opt.value)
                  setTimeout(() => setStep(1), 200)
                }
              }}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]
                ${selected
                  ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-xs text-white/40">{opt.detail}</p>
              </div>
              {opt.value === 'condominio' && (
                <span className="text-xs text-[#FF8C00] font-semibold shrink-0">Direto →</span>
              )}
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
        onClick={() => {
          if (local === 'hotel' && userId) {
            setShowHotelDetect(true)
          } else {
            setStep(0)
          }
        }}
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

  if (showHotelDetect && userId) {
    return (
      <div className="flex flex-col items-center w-full max-w-sm gap-2">
        {/* Barra de progresso — hotel detect conta como progresso parcial do step 0→1 */}
        <div className="flex gap-1.5 mb-4 w-full">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === 0 ? 'bg-[#FF8C00]' : 'bg-white/10'}`}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <HotelEquipmentStep
            userId={userId}
            onConfirm={(equipment) => {
              setEquipamentosHotel(equipment)
              setShowHotelDetect(false)
              setStep(1)
            }}
            onBack={() => {
              setShowHotelDetect(false)
              setLocal(null)
            }}
          />
        </AnimatePresence>
      </div>
    )
  }

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
