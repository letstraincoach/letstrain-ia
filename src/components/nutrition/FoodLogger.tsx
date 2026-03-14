'use client'

import { useState } from 'react'
import { FOODS_BY_CATEGORY, FOOD_MAP, type FoodLogItem } from '@/lib/nutrition/foods'
import { useRouter } from 'next/navigation'

type Tipo = 'cafe_manha' | 'almoco' | 'lanche' | 'jantar' | 'pos_treino' | 'outro'

const TIPOS: { value: Tipo; label: string; icone: string }[] = [
  { value: 'cafe_manha', label: 'Café da manhã', icone: '☀️' },
  { value: 'almoco', label: 'Almoço', icone: '🍽' },
  { value: 'lanche', label: 'Lanche', icone: '🥪' },
  { value: 'jantar', label: 'Jantar', icone: '🌙' },
  { value: 'pos_treino', label: 'Pós-treino', icone: '💪' },
  { value: 'outro', label: 'Outro', icone: '➕' },
]

const CATEGORIAS = [
  { key: 'proteinas' as const, label: 'Proteínas', cor: 'text-orange-400 border-orange-400/20 bg-orange-400/5' },
  { key: 'carboidratos' as const, label: 'Carboidratos', cor: 'text-blue-400 border-blue-400/20 bg-blue-400/5' },
  { key: 'extras' as const, label: 'Extras', cor: 'text-green-400 border-green-400/20 bg-green-400/5' },
]

interface Props {
  defaultTipo?: Tipo
  onSuccess?: () => void
}

export default function FoodLogger({ defaultTipo, onSuccess }: Props) {
  const router = useRouter()
  const [passo, setPasso] = useState<1 | 2 | 3>(defaultTipo ? 2 : 1)
  const [tipo, setTipo] = useState<Tipo>(defaultTipo ?? 'almoco')
  const [selecionados, setSelecionados] = useState<Record<string, number>>({}) // food_id → quantidade
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const totalKcal = Object.entries(selecionados).reduce((s, [id, qty]) => {
    return s + (FOOD_MAP[id]?.calorias ?? 0) * qty
  }, 0)

  const totalItens = Object.keys(selecionados).length

  function toggleAlimento(foodId: string) {
    setSelecionados((prev) => {
      if (prev[foodId]) {
        const next = { ...prev }
        delete next[foodId]
        return next
      }
      return { ...prev, [foodId]: 1 }
    })
  }

  function ajustarQtd(foodId: string, delta: number) {
    setSelecionados((prev) => {
      const atual = prev[foodId] ?? 1
      const nova = atual + delta
      if (nova <= 0) {
        const next = { ...prev }
        delete next[foodId]
        return next
      }
      if (nova > 8) return prev
      return { ...prev, [foodId]: nova }
    })
  }

  async function registrar() {
    setLoading(true)
    setErro('')

    const items: FoodLogItem[] = Object.entries(selecionados).map(([id, qty]) => {
      const f = FOOD_MAP[id]
      return {
        food_id: f.id,
        nome: f.nome,
        icone: f.icone,
        quantidade: qty,
        calorias: f.calorias,
        proteina_g: f.proteina_g,
        carbo_g: f.carbo_g,
        gordura_g: f.gordura_g,
      }
    })

    try {
      const res = await fetch('/api/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, items }),
      })
      if (!res.ok) throw new Error()
      onSuccess?.()
      router.refresh()
    } catch {
      setErro('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ── Passo 1: Tipo de refeição ─────────────────────────────────────────────
  if (passo === 1) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-white/50 font-medium">Qual refeição?</p>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setTipo(t.value)
                setPasso(2)
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${
                tipo === t.value
                  ? 'border-[#FF8C00]/50 bg-[#FF8C00]/10 text-white'
                  : 'border-white/[0.07] bg-white/[0.02] text-white/60 hover:border-white/[0.15] hover:text-white/80'
              }`}
            >
              <span className="text-xl">{t.icone}</span>
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Passo 2: Selecionar alimentos ─────────────────────────────────────────
  if (passo === 2) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setPasso(1)} className="text-sm text-white/30 hover:text-white/60">
            ← {TIPOS.find((t) => t.value === tipo)?.label}
          </button>
          {totalItens > 0 && (
            <button
              onClick={() => setPasso(3)}
              className="text-sm font-semibold text-[#FF8C00] hover:text-[#FF8C00]/80"
            >
              Continuar ({totalItens} {totalItens === 1 ? 'item' : 'itens'}) →
            </button>
          )}
        </div>

        {CATEGORIAS.map((cat) => (
          <div key={cat.key}>
            <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${cat.cor.split(' ')[0]}`}>
              {cat.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {FOODS_BY_CATEGORY[cat.key].map((food) => {
                const qty = selecionados[food.id]
                const selecionado = !!qty
                return (
                  <div key={food.id} className="flex items-center">
                    <button
                      onClick={() => toggleAlimento(food.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all ${
                        selecionado
                          ? 'border-[#FF8C00]/40 bg-[#FF8C00]/10 text-white'
                          : 'border-white/[0.07] bg-white/[0.02] text-white/50 hover:text-white/80 hover:border-white/[0.15]'
                      }`}
                    >
                      <span>{food.icone}</span>
                      <span>{food.nome}</span>
                    </button>
                    {selecionado && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => ajustarQtd(food.id, -1)}
                          className="w-6 h-6 rounded-full bg-white/[0.06] text-white/60 text-sm hover:bg-white/[0.1] flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold text-white w-4 text-center">{qty}</span>
                        <button
                          onClick={() => ajustarQtd(food.id, +1)}
                          className="w-6 h-6 rounded-full bg-white/[0.06] text-white/60 text-sm hover:bg-white/[0.1] flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Preview rodapé */}
        {totalItens > 0 && (
          <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0a0a0a] to-transparent">
            <button
              onClick={() => setPasso(3)}
              className="w-full max-w-sm mx-auto flex items-center justify-between bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-bold py-3.5 px-5 rounded-2xl transition-colors block"
            >
              <span>{totalItens} {totalItens === 1 ? 'alimento' : 'alimentos'} selecionados</span>
              <span>{Math.round(totalKcal)} kcal →</span>
            </button>
          </div>
        )}
        <div className="h-16" />
      </div>
    )
  }

  // ── Passo 3: Confirmar ────────────────────────────────────────────────────
  const itensConfirm = Object.entries(selecionados).map(([id, qty]) => ({
    ...FOOD_MAP[id],
    qty,
    totalKcal: Math.round(FOOD_MAP[id].calorias * qty),
    totalProt: parseFloat((FOOD_MAP[id].proteina_g * qty).toFixed(1)),
    totalCarbo: parseFloat((FOOD_MAP[id].carbo_g * qty).toFixed(1)),
  }))

  const totalProt = parseFloat(itensConfirm.reduce((s, i) => s + i.totalProt, 0).toFixed(1))
  const totalCarbo = parseFloat(itensConfirm.reduce((s, i) => s + i.totalCarbo, 0).toFixed(1))
  const totalGord = parseFloat(
    Object.entries(selecionados)
      .reduce((s, [id, qty]) => s + (FOOD_MAP[id]?.gordura_g ?? 0) * qty, 0)
      .toFixed(1)
  )

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => setPasso(2)} className="text-sm text-white/30 hover:text-white/60 self-start">
        ← Voltar
      </button>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] divide-y divide-white/[0.04]">
        {itensConfirm.map((item) => (
          <div key={item.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span>{item.icone}</span>
              <div>
                <p className="text-sm text-white/80">{item.nome}</p>
                <p className="text-[10px] text-white/30">{item.qty}× {item.porcao}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-white">{item.totalKcal} kcal</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/5 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-white/60">Total da refeição</span>
        <span className="text-lg font-black text-[#FF8C00]">{Math.round(totalKcal)} kcal</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Proteína', value: `${totalProt}g`, cor: 'text-orange-400' },
          { label: 'Carboidrato', value: `${totalCarbo}g`, cor: 'text-blue-400' },
          { label: 'Gordura', value: `${totalGord}g`, cor: 'text-yellow-400' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-2">
            <p className={`text-sm font-bold ${m.cor}`}>{m.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {erro && <p className="text-sm text-red-400 text-center">{erro}</p>}

      <button
        onClick={registrar}
        disabled={loading}
        className="w-full bg-[#FF8C00] hover:bg-[#FF8C00]/90 disabled:opacity-50 text-black font-bold py-3.5 rounded-2xl transition-colors"
      >
        {loading ? 'Registrando...' : 'Registrar estimativa calórica'}
      </button>

      <p className="text-[10px] text-white/20 text-center">
        Registro de caráter informativo. Não substitui acompanhamento de nutricionista.
      </p>
    </div>
  )
}
