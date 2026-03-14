'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface WeightEntry {
  data: string
  peso: number
}

interface Props {
  entries: WeightEntry[]
  pesoAtual: number | null
  insightInicial: string | null
}

const W = 320
const H = 120
const PAD = { top: 12, right: 16, bottom: 24, left: 36 }

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
}

export default function WeightChart({ entries, pesoAtual, insightInicial }: Props) {
  const router = useRouter()
  const [input, setInput] = useState(pesoAtual ? String(pesoAtual) : '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [insight, setInsight] = useState<string | null>(insightInicial)
  const [insightLoading, setInsightLoading] = useState(false)

  async function handleSave() {
    const peso = parseFloat(input.replace(',', '.'))
    if (isNaN(peso) || peso < 20 || peso > 400) {
      setError('Peso inválido')
      return
    }
    setLoading(true)
    setInsightLoading(true)
    setError('')
    const res = await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peso }),
    })
    setLoading(false)
    if (res.ok) {
      const json = await res.json() as { ok: boolean; insight?: string }
      if (json.insight) setInsight(json.insight)
      setInsightLoading(false)
      setSaved(true)
      setTimeout(() => { setSaved(false); router.refresh() }, 1800)
    } else {
      setInsightLoading(false)
      setError('Erro ao salvar')
    }
  }

  // Chart math
  const sorted = [...entries].sort((a, b) => a.data.localeCompare(b.data))
  const pesos = sorted.map(e => e.peso)
  const minP = Math.min(...pesos, pesoAtual ?? Infinity) - 1
  const maxP = Math.max(...pesos, pesoAtual ?? -Infinity) + 1

  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const toX = (i: number) =>
    PAD.left + (sorted.length <= 1 ? chartW / 2 : (i / (sorted.length - 1)) * chartW)
  const toY = (p: number) =>
    PAD.top + chartH - ((p - minP) / (maxP - minP || 1)) * chartH

  const points = sorted.map((e, i) => ({ x: toX(i), y: toY(e.peso) }))
  const pathD = buildPath(points)

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(PAD.top + chartH).toFixed(1)} Z`
    : ''

  const diff = sorted.length >= 2
    ? (sorted[sorted.length - 1].peso - sorted[0].peso).toFixed(1)
    : null
  const diffNum = diff ? parseFloat(diff) : null
  const diffColor = diffNum === null ? '' : diffNum < 0 ? 'text-green-400' : diffNum > 0 ? 'text-red-400' : 'text-white/40'
  const diffLabel = diffNum === null ? '' : diffNum < 0 ? `${diff} kg` : diffNum > 0 ? `+${diff} kg` : '0 kg'

  return (
    <div className="flex flex-col gap-4">

      {/* Chart */}
      {sorted.length >= 2 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-white/40">Evolução do peso</p>
              <p className="text-lg font-bold mt-0.5">
                {sorted[sorted.length - 1].peso.toFixed(1)} kg
              </p>
            </div>
            {diffNum !== null && (
              <span className={`text-sm font-semibold ${diffColor}`}>
                {diffLabel}
              </span>
            )}
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF8C00" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF8C00" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((t) => {
              const val = minP + t * (maxP - minP)
              const y = toY(val)
              return (
                <g key={t}>
                  <line x1={PAD.left - 4} y1={y} x2={W - PAD.right} y2={y}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <text x={PAD.left - 6} y={y + 3} textAnchor="end"
                    fontSize="9" fill="rgba(255,255,255,0.25)">
                    {val.toFixed(0)}
                  </text>
                </g>
              )
            })}
            {areaD && <path d={areaD} fill="url(#weightGrad)" />}
            {pathD && (
              <path d={pathD} fill="none" stroke="#FF8C00" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            )}
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3"
                fill="#FF8C00" stroke="#0a0a0a" strokeWidth="1.5" />
            ))}
            {sorted.length >= 2 && (
              <>
                <text x={points[0].x} y={H - 4} textAnchor="middle"
                  fontSize="9" fill="rgba(255,255,255,0.25)">
                  {new Date(sorted[0].data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </text>
                <text x={points[points.length - 1].x} y={H - 4} textAnchor="middle"
                  fontSize="9" fill="rgba(255,255,255,0.25)">
                  {new Date(sorted[sorted.length - 1].data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </text>
              </>
            )}
          </svg>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-5 text-center">
          <p className="text-sm text-white/40">
            {sorted.length === 1
              ? 'Registre o peso amanhã para ver o gráfico de evolução'
              : 'Registre o seu peso para acompanhar a evolução'}
          </p>
        </div>
      )}

      {/* AI Insight */}
      {insightLoading && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 flex items-center gap-2">
          <span className="text-xs text-white/30 animate-pulse">Analisando sua evolução...</span>
        </div>
      )}
      {!insightLoading && insight && (
        <div className="rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.04] px-4 py-3">
          <p className="text-[10px] text-[#FF8C00]/60 uppercase tracking-widest mb-1">Análise do treinador</p>
          <p className="text-sm text-white/70 leading-relaxed">{insight}</p>
        </div>
      )}

      {/* Input */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
          Registrar peso de hoje
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="20"
            max="400"
            step="0.1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={pesoAtual ? String(pesoAtual) : '70.0'}
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 h-10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 appearance-none"
          />
          <span className="text-sm text-white/40 shrink-0">kg</span>
          <button
            onClick={handleSave}
            disabled={loading || saved}
            className="h-10 px-4 rounded-xl bg-[#FF8C00] hover:bg-[#E07000] disabled:opacity-60 text-black font-bold text-sm transition-colors shrink-0"
          >
            {saved ? '✓' : loading ? '...' : 'Salvar'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>

    </div>
  )
}
