'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

function SucessoContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [countdown, setCountdown] = useState(5)

  // Trial flow: setup_intent vem no param
  // Legacy flow: payment_intent vem no param
  const setupIntentId = params.get('setup_intent')
  const isTrial = !!setupIntentId

  // Countdown imediato — webhook cria a subscription em background
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(timer)
          router.push('/assinatura/boas-vindas')
          return 0
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 30% at 50% 50%, rgba(255,140,0,0.12) 0%, transparent 70%)' }}
      />

      <motion.div
        className="relative flex flex-col items-center gap-6 max-w-sm"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.span
          className="text-7xl"
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          🎉
        </motion.span>

        <div>
          <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Lets Train!</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            {isTrial
              ? 'Seu trial de 3 dias começou agora!'
              : 'Pagamento aprovado! Sua assinatura está ativa.'}
          </p>
        </div>

        {isTrial ? (
          <div className="w-full rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.05] p-5 flex flex-col gap-2">
            <p className="text-sm font-semibold text-[#FF8C00]">🎁 Trial ativo — 3 dias grátis</p>
            <p className="text-xs text-white/50 leading-relaxed">
              Seu cartão só será cobrado em{' '}
              <strong className="text-white/70">{trialEndDate}</strong>.{' '}
              Você pode cancelar antes disso sem nenhum custo.
            </p>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/[0.05] p-5 flex flex-col gap-2">
            <p className="text-sm font-semibold text-[#FF8C00]">✅ Assinatura ativa</p>
            <p className="text-xs text-white/50">
              Você tem acesso completo a todos os treinos e recursos do app.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push('/assinatura/boas-vindas')}
          className="w-full h-14 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98]"
        >
          💪 Começar a treinar
        </button>

        <p className="text-xs text-white/30">
          Redirecionando em {countdown}s…
        </p>
      </motion.div>
    </div>
  )
}

export default function SucessoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <SucessoContent />
    </Suspense>
  )
}
