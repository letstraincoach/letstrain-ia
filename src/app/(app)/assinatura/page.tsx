'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Plano = 'mensal' | 'anual'

const PLANOS = [
  {
    id: 'anual' as Plano,
    label: 'Anual',
    preco: '12x de R$37,90',
    precoMes: 'total R$397,00 · cobrado anualmente',
    economia: 'Economize R$201,80 vs mensal (-34%)',
    badge: '🔥 Melhor custo-benefício',
  },
  {
    id: 'mensal' as Plano,
    label: 'Mensal',
    preco: 'R$49,90/mês',
    precoMes: null,
    economia: null,
    badge: null,
  },
]

const FEATURES = [
  '💪 Treinos diários pela metodologia Lets Train',
  '⚡ Metodologia Time Efficient — máximo resultado em menos tempo',
  '📊 Progressão automática de nível',
  '🏆 Gamificação e conquistas',
  '📅 Calendário e histórico completo',
  '🔔 Lembretes personalizados',
]

// ---- Formulário de setup (coleta cartão para o trial) ----
function SetupForm({ plano }: { plano: Plano }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${appUrl}/assinatura/sucesso`,
      },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Erro ao salvar método de pagamento.')
      setProcessing(false)
    }
    // Se não houver erro, o Stripe redireciona para return_url
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.04] px-4 py-3">
        <p className="text-xs text-[#FF8C00] font-semibold mb-0.5">🎁 3 dias grátis ativados</p>
        <p className="text-xs text-white/50 leading-relaxed">
          Nenhuma cobrança antes de <strong className="text-white/70">{trialEndDate}</strong>.
          Cancele antes disso e não paga nada.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: { billingDetails: { email: 'auto' } },
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full h-14 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? (
          <span className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        ) : (
          <>🎁 Começar 3 dias grátis</>
        )}
      </button>

      <p className="text-center text-xs text-white/30 leading-relaxed">
        Após o trial: {plano === 'anual' ? 'R$397,00/ano' : 'R$49,90/mês'}.<br />
        Pagamento seguro via Stripe. Cancele quando quiser.
      </p>
    </form>
  )
}

// ---- Página principal ----
export default function AssinaturaPage() {
  const router = useRouter()
  const [selectedPlano, setSelectedPlano] = useState<Plano>('anual')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAssinar = useCallback(async () => {
    setLoadingIntent(true)
    setError(null)
    setClientSecret(null)

    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: selectedPlano }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Erro ao iniciar checkout')
      }

      const { clientSecret: cs } = await res.json() as { clientSecret: string }
      setClientSecret(cs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoadingIntent(false)
    }
  }, [selectedPlano])

  const stripeAppearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#FF8C00',
      colorBackground: '#111111',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      borderRadius: '12px',
      fontFamily: 'inherit',
    },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="max-w-sm mx-auto flex flex-col gap-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold mb-2">
            Lets Train
          </p>
          <h1 className="text-2xl font-bold leading-tight">
            Metodologia real, resultados de verdade!
          </h1>
          <p className="mt-1.5 text-sm text-white/50 leading-relaxed">
            Treinos diários personalizados, progressão automática e conquistas. Tudo no seu bolso.
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
            <div key={f} className="flex items-center gap-2.5 text-sm text-white/70">
              <span>{f}</span>
            </div>
          ))}
        </motion.div>

        {/* Seletor de planos */}
        {!clientSecret && (
          <>
            <div className="flex flex-col gap-3">
              {PLANOS.map((plano, i) => {
                const selected = selectedPlano === plano.id
                return (
                  <motion.button
                    key={plano.id}
                    type="button"
                    onClick={() => setSelectedPlano(plano.id)}
                    className={`relative flex flex-col gap-1 rounded-2xl border p-5 text-left transition-all duration-150 active:scale-[0.98]
                      ${selected
                        ? 'border-[#FF8C00] bg-[#FF8C00]/[0.08]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                      }`}
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
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{plano.preco}</p>
                        {plano.precoMes && (
                          <p className="text-xs text-white/40">{plano.precoMes}</p>
                        )}
                      </div>
                    </div>

                    <div className={`absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${selected ? 'border-[#FF8C00]' : 'border-white/20'}`}>
                      {selected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF8C00]" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 pb-8">
              <button
                type="button"
                onClick={handleAssinar}
                disabled={loadingIntent}
                className="w-full h-14 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingIntent ? (
                  <span className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>🎁 Começar 3 dias grátis</>
                )}
              </button>

              <p className="text-center text-xs text-white/40 leading-relaxed">
                Sem cobrança durante o trial. Cancele antes de 3 dias e não paga nada.<br />
                Após: {selectedPlano === 'anual' ? 'R$397,00/ano' : 'R$49,90/mês'}.
              </p>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="text-sm text-white/20 hover:text-white/40 transition-colors text-center"
              >
                Voltar
              </button>
            </div>
          </>
        )}

        {/* Formulário Stripe Elements (setup intent para trial) */}
        {clientSecret && (
          <motion.div
            className="flex flex-col gap-4 pb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Salvar método de pagamento</h2>
              <button
                type="button"
                onClick={() => setClientSecret(null)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                ← Alterar plano
              </button>
            </div>

            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: stripeAppearance, locale: 'pt-BR' }}
            >
              <SetupForm plano={selectedPlano} />
            </Elements>
          </motion.div>
        )}
      </div>
    </div>
  )
}
