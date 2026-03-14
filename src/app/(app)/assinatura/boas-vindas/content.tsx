'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface Props {
  firstName: string
  levelLabel: string
  levelEmoji: string
  levelCor: string
  levelCorBg: string
  levelDescricao: string
}

const STEPS = [
  {
    icon: '👨‍🏫',
    title: 'Professores + Inteligência Artificial',
    desc: 'A equipe de professores da Academia Lets Train, com apoio da IA, mapeia seu ambiente e entrega o treino ideal para você.',
  },
  {
    icon: '📈',
    title: 'Progresso automático',
    desc: 'O app acompanha sua evolução e ajusta a dificuldade conforme você melhora.',
  },
  {
    icon: '🏆',
    title: 'Conquistas e níveis',
    desc: 'Suba de nível, desbloqueie conquistas e mantenha a sequência de treinos.',
  },
]

export function BoasVindasContent({
  firstName,
  levelLabel,
  levelEmoji,
  levelCor,
  levelCorBg,
  levelDescricao,
}: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 35% at 50% 0%, ${levelCor}20 0%, transparent 65%)`,
        }}
      />

      <div className="relative max-w-sm mx-auto flex flex-col gap-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs text-[#FF8C00] font-semibold uppercase tracking-widest mb-3">
            ✅ Assinatura ativa
          </p>
          <h1 className="text-3xl font-bold leading-tight">
            Bem-vindo,<br />{firstName}! 👋
          </h1>
          <p className="mt-2 text-sm text-white/50 leading-relaxed">
            Você tem acesso completo ao Lets Train. Aqui está um resumo do que te espera.
          </p>
        </motion.div>

        {/* Level Card */}
        <motion.div
          className="rounded-3xl border p-6 flex flex-col gap-3"
          style={{ borderColor: levelCor + '40', backgroundColor: levelCorBg }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">{levelEmoji}</span>
            <div>
              <p className="text-xs text-white/40 mb-0.5">Seu nível inicial</p>
              <p className="text-2xl font-bold" style={{ color: levelCor }}>
                {levelLabel}
              </p>
            </div>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{levelDescricao}</p>
        </motion.div>

        {/* How it works */}
        <div className="flex flex-col gap-3">
          <motion.p
            className="text-sm font-semibold text-white/60 uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            Como funciona
          </motion.p>

          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <span className="text-2xl mt-0.5 shrink-0">{step.icon}</span>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col gap-3 pb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
        >
          <Link
            href="/workout/checkin"
            className="w-full h-14 rounded-2xl bg-[#FF8C00] text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E07000] transition-colors active:scale-[0.98]"
          >
            💪 Fazer primeiro treino
          </Link>

          <Link
            href="/dashboard"
            className="text-sm text-white/30 hover:text-white/50 transition-colors text-center py-2"
          >
            Ir para o dashboard →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
