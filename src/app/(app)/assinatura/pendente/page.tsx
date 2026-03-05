'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function PendentePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 30% at 50% 50%, rgba(245,158,11,0.10) 0%, transparent 70%)' }}
      />

      <motion.div
        className="relative flex flex-col items-center gap-6 max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          className="text-6xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⏳
        </motion.span>

        <div>
          <h1 className="text-2xl font-bold mb-2">Pagamento em análise</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Seu pagamento PIX está sendo processado. Assim que confirmado, seu acesso será liberado automaticamente.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/[0.05] p-5 flex flex-col gap-2 text-left">
          <p className="text-sm font-semibold text-[#F59E0B]">📋 O que acontece agora?</p>
          <ul className="text-xs text-white/50 space-y-1.5 mt-1">
            <li>1. Faça o pagamento PIX se ainda não realizou</li>
            <li>2. A confirmação pode levar até 30 minutos</li>
            <li>3. Seu acesso é liberado automaticamente após confirmação</li>
            <li>4. Você receberá um email de confirmação</li>
          </ul>
        </div>

        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full h-12 rounded-xl bg-[#FF8C00] text-black font-semibold text-sm flex items-center justify-center hover:bg-[#E07000] transition-colors"
          >
            Ir para o Dashboard
          </button>
          <button
            type="button"
            onClick={() => router.push('/assinatura')}
            className="text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            Escolher outro método de pagamento
          </button>
        </div>
      </motion.div>
    </div>
  )
}
