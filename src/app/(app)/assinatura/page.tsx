'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Icon from '@/components/ui/Icon'

type Plano = 'mensal' | 'anual'

const PLANOS = [
  {
    id: 'anual' as Plano,
    label: 'Anual',
    preco: '12x de R$37,90',
    detalhe: 'total R$397,00 cobrado anualmente',
    economia: 'Economize R$201,80 vs mensal (-34%)',
    badge: 'Melhor custo-benefício',
  },
  {
    id: 'mensal' as Plano,
    label: 'Mensal',
    preco: 'R$49,90/mês',
    detalhe: 'sem fidelidade, cancele quando quiser',
    economia: null,
    badge: null,
  },
]

const FEATURES = [
  { icone: 'dumbbell', texto: 'Treinos diários gerados pela IA, 100% personalizados' },
  { icone: 'bolt', texto: 'Metodologia Time Efficient — resultado em menos tempo' },
  { icone: 'chart-line-up', texto: 'Progressão automática de nível e carga' },
  { icone: 'trophy', texto: 'Gamificação, conquistas e álbum de figurinhas' },
  { icone: 'play', texto: 'Vídeos demonstrativos de todos os exercícios' },
  { icone: 'utensils', texto: 'Registro alimentar com estimativa calórica' },
]

export default function AssinaturaPage() {
  const router = useRouter()
  const [selectedPlano, setSelectedPlano] = useState<Plano>('anual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAssinar() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: selectedPlano }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Erro ao iniciar pagamento')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-8">

        {/* Voltar */}
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-white/40 hover:text-white/70 transition-colors self-start"
        >
          ← Voltar
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">
            Lets Train
          </p>
          <h1 className="text-2xl font-bold leading-tight">
            Você usou seus 3 treinos gratuitos 🎉
          </h1>
          <p className="mt-2 text-sm text-white/50 leading-relaxed">
            Assine agora e continue evoluindo. Sem burocracia — acesso imediato após o pagamento.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          className="flex flex-col gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {FEATURES.map((f) => (
            <div key={f.texto} className="flex items-start gap-2.5 text-sm text-white/70">
              <Icon name={f.icone} className="shrink-0 mt-0.5 text-[#FF8C00]" />
              <span>{f.texto}</span>
            </div>
          ))}
        </motion.div>

        {/* Planos */}
        <div className="flex flex-col gap-3">
          {PLANOS.map((plano, i) => {
            const selected = selectedPlano === plano.id
            return (
              <motion.button
                key={plano.id}
                type="button"
                onClick={() => setSelectedPlano(plano.id)}
                className={`relative flex flex-col gap-1 rounded-2xl border p-5 text-left transition-all duration-150 active:scale-[0.98]
                  ${selected ? 'border-[#FF8C00] bg-[#FF8C00]/[0.08]' : 'border-white/10 bg-white/[0.03] hover:border-white/20'}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                {plano.badge && (
                  <span className="absolute -top-3 left-4 bg-[#FF8C00] text-black text-xs font-bold px-3 py-0.5 rounded-full">
                    {plano.badge}
                  </span>
                )}
                <div className="flex items-center justify-between pr-8">
                  <div>
                    <p className="font-bold text-base">{plano.label}</p>
                    {plano.economia && (
                      <p className="text-xs text-[#FF8C00] font-medium mt-0.5">{plano.economia}</p>
                    )}
                    <p className="text-xs text-white/30 mt-0.5">{plano.detalhe}</p>
                  </div>
                  <p className="font-bold text-lg shrink-0">{plano.preco}</p>
                </div>
                <div className={`absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${selected ? 'border-[#FF8C00]' : 'border-white/20'}`}>
                  {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#FF8C00]" />}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 pb-8">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleAssinar}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <><Icon name="credit-card" /> Assinar {selectedPlano === 'anual' ? 'por R$397,00/ano' : 'por R$49,90/mês'}</>

            )}
          </button>

          <p className="text-center text-xs text-white/30 leading-relaxed">
            Pagamento seguro via Stripe. Cancele quando quiser.
          </p>
        </div>
      </div>
    </div>
  )
}
