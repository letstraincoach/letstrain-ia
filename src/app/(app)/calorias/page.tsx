'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { calcularMetaCalorica, calcularMetaProteina } from '@/lib/nutrition/foods'
import NutritionSummary from '@/components/nutrition/NutritionSummary'
import FoodLogger from '@/components/nutrition/FoodLogger'
import type { FoodLogItem } from '@/app/api/nutrition/log/route'

interface FoodLog {
  id: string
  tipo: string
  calorias_total: number
  proteina_total: number
  carbo_total: number
  gordura_total: number
  items: FoodLogItem[]
  criado_em: string
}

const TIPO_LABELS: Record<string, string> = {
  cafe_manha: 'Café da manhã',
  almoco: 'Almoço',
  lanche: 'Lanche',
  jantar: 'Jantar',
  pos_treino: 'Pós-treino',
  outro: 'Outro',
}

const TIPO_ICONES: Record<string, string> = {
  cafe_manha: '☀️',
  almoco: '🍽',
  lanche: '🥪',
  jantar: '🌙',
  pos_treino: '💪',
  outro: '➕',
}

export default function NutricaoPage() {
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [logsOntem, setLogsOntem] = useState<FoodLog[]>([])
  const [metaCalorias, setMetaCalorias] = useState(2000)
  const [metaProteina, setMetaProteina] = useState(120)
  const [showLogger, setShowLogger] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [repeating, setRepeating] = useState(false)

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'America/Sao_Paulo',
  })
  const hojeISO = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })
  const ontemISO = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })

  const carregarLogs = useCallback(async () => {
    const res = await fetch(`/api/nutrition/log?date=${hojeISO}`)
    if (res.ok) {
      const json = await res.json()
      setLogs(json.logs ?? [])
    }
  }, [hojeISO])

  useEffect(() => {
    // Carrega perfil para metas + logs de hoje e ontem
    async function init() {
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('peso, altura, idade, sexo, objetivo, dias_por_semana')
        .single()

      if (profile) {
        setMetaCalorias(calcularMetaCalorica({ ...profile, sexo: profile.sexo as 'masculino' | 'feminino' | null }))
        setMetaProteina(calcularMetaProteina(profile.peso))
      }

      await carregarLogs()

      const resOntem = await fetch(`/api/nutrition/log?date=${ontemISO}`)
      if (resOntem.ok) {
        const json = await resOntem.json()
        setLogsOntem(json.logs ?? [])
      }
    }
    init()
  }, [carregarLogs, ontemISO])

  const totais = logs.reduce(
    (acc, l) => ({
      calorias: acc.calorias + l.calorias_total,
      proteina: acc.proteina + parseFloat(String(l.proteina_total)),
      carbo: acc.carbo + parseFloat(String(l.carbo_total)),
      gordura: acc.gordura + parseFloat(String(l.gordura_total)),
    }),
    { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
  )

  async function deletarLog(id: string) {
    setDeletingId(id)
    try {
      await fetch(`/api/nutrition/log/${id}`, { method: 'DELETE' })
      await carregarLogs()
    } finally {
      setDeletingId(null)
    }
  }

  // Última refeição de ontem para "Repetir"
  const ultimaOntem = logsOntem.length > 0 ? logsOntem[logsOntem.length - 1] : null

  async function repetirRefeicao() {
    if (!ultimaOntem) return
    setRepeating(true)
    try {
      await fetch('/api/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: ultimaOntem.tipo,
          items: ultimaOntem.items,
        }),
      })
      await carregarLogs()
    } finally {
      setRepeating(false)
    }
  }

  if (showLogger) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-sm mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowLogger(false)}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              ← Voltar
            </button>
            <h1 className="font-black text-lg">Registrar refeição</h1>
          </div>
          <FoodLogger
            onSuccess={() => {
              setShowLogger(false)
              carregarLogs()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-4 py-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-white/30 hover:text-white/60 transition-colors text-sm">
            ← Dashboard
          </Link>
          <button
            onClick={() => setShowLogger(true)}
            className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-bold text-sm px-4 py-2 rounded-xl transition-colors"
          >
            + Registrar
          </button>
        </div>
        <div className="mt-2">
          <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold">Registro alimentar</p>
          <p className="text-sm text-white/40 capitalize mt-0.5">{hoje}</p>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Resumo diário */}
        <NutritionSummary
          calorias={Math.round(totais.calorias)}
          metaCalorias={metaCalorias}
          proteina={parseFloat(totais.proteina.toFixed(1))}
          metaProteina={metaProteina}
          carbo={parseFloat(totais.carbo.toFixed(1))}
          gordura={parseFloat(totais.gordura.toFixed(1))}
        />

        {/* Repetir refeição de ontem */}
        {ultimaOntem && (
          <button
            onClick={repetirRefeicao}
            disabled={repeating}
            className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] px-4 py-3 transition-colors disabled:opacity-50 text-left w-full"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🔄</span>
              <div>
                <p className="text-sm text-white/70 font-medium">
                  Repetir {TIPO_LABELS[ultimaOntem.tipo] ?? 'refeição'} de ontem
                </p>
                <p className="text-xs text-white/30">
                  {ultimaOntem.calorias_total} kcal · {(ultimaOntem.items as FoodLogItem[]).length} alimentos
                </p>
              </div>
            </div>
            <span className="text-xs text-[#FF8C00] font-semibold shrink-0">
              {repeating ? '...' : '1 clique'}
            </span>
          </button>
        )}

        {/* Lista de refeições do dia */}
        {logs.length > 0 && (
          <section className="flex flex-col gap-3">
            <p className="text-xs text-white/30 uppercase tracking-widest font-semibold">Hoje</p>
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <span>{TIPO_ICONES[log.tipo] ?? '🍽'}</span>
                    <p className="text-sm font-semibold text-white/80">{TIPO_LABELS[log.tipo] ?? log.tipo}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#FF8C00]">{log.calorias_total} kcal</span>
                    <button
                      onClick={() => deletarLog(log.id)}
                      disabled={deletingId === log.id}
                      className="text-white/20 hover:text-red-400 transition-colors text-xs disabled:opacity-40"
                    >
                      {deletingId === log.id ? '...' : '✕'}
                    </button>
                  </div>
                </div>
                <div className="px-4 py-2 flex flex-wrap gap-1.5">
                  {(log.items as FoodLogItem[]).map((item, i) => (
                    <span
                      key={i}
                      className="text-xs text-white/40 bg-white/[0.04] rounded-full px-2.5 py-0.5"
                    >
                      {item.icone} {item.nome}
                      {item.quantidade > 1 && ` ×${item.quantidade}`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Estado vazio */}
        {logs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.08] py-10 flex flex-col items-center gap-3">
            <span className="text-4xl">🍽</span>
            <p className="text-sm text-white/40 text-center">Nenhum registro hoje</p>
            <button
              onClick={() => setShowLogger(true)}
              className="text-sm text-[#FF8C00] font-semibold hover:text-[#FF8C00]/80 transition-colors"
            >
              Registrar primeira refeição →
            </button>
          </div>
        )}

        {/* Botão flutuante adicionar */}
        {logs.length > 0 && (
          <button
            onClick={() => setShowLogger(true)}
            className="w-full border border-dashed border-white/[0.08] hover:border-[#FF8C00]/30 text-white/30 hover:text-[#FF8C00] text-sm py-3 rounded-2xl transition-colors"
          >
            + Adicionar outra refeição
          </button>
        )}

        {/* Disclaimer legal */}
        <p className="text-[10px] text-white/15 text-center leading-relaxed">
          As estimativas calóricas apresentadas possuem caráter informativo.
          Este registro não substitui acompanhamento de nutricionista ou profissional de saúde.
        </p>
      </div>
    </div>
  )
}
