'use client'

import { motion } from 'framer-motion'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import Button from '@/components/ui/Button'

interface LevelUpScreenProps {
  previousLevel: TrainingLevel
  newLevel: TrainingLevel
  onContinue: () => void
}

export default function LevelUpScreen({ previousLevel, newLevel, onContinue }: LevelUpScreenProps) {
  const prevCfg = LEVEL_CONFIG[previousLevel]
  const newCfg = LEVEL_CONFIG[newLevel]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${newCfg.cor}18 0%, transparent 70%)`,
        }}
      />

      <motion.div
        className="relative flex flex-col items-center gap-8 max-w-sm"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Título */}
        <div>
          <motion.p
            className="text-xs uppercase tracking-widest font-semibold mb-2"
            style={{ color: newCfg.cor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Parabéns! Você subiu de nível
          </motion.p>
          <h1 className="text-3xl font-bold leading-tight">Level Up! 🎉</h1>
        </div>

        {/* Transição de nível: anterior → novo */}
        <div className="flex items-center gap-4">
          {/* Nível anterior */}
          <motion.div
            className="flex flex-col items-center gap-2 opacity-40"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 0.4 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: prevCfg.corBg, border: `1px solid ${prevCfg.cor}30` }}
            >
              {prevCfg.emoji}
            </div>
            <p className="text-xs text-white/40 font-medium">{prevCfg.label}</p>
          </motion.div>

          {/* Seta */}
          <motion.span
            className="text-2xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }}
          >
            →
          </motion.span>

          {/* Novo nível */}
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ x: 40, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ backgroundColor: newCfg.corBg, border: `1px solid ${newCfg.cor}60` }}
              animate={{ boxShadow: [`0 0 0px ${newCfg.cor}00`, `0 0 32px ${newCfg.cor}50`, `0 0 16px ${newCfg.cor}30`] }}
              transition={{ delay: 0.7, duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
            >
              {newCfg.emoji}
            </motion.div>
            <p className="text-sm font-bold" style={{ color: newCfg.cor }}>{newCfg.label}</p>
          </motion.div>
        </div>

        {/* Descrição do novo nível */}
        <motion.div
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-white/70 leading-relaxed">{newCfg.descricao}</p>
          {newCfg.proximo && newCfg.treinos_necessarios && (
            <p className="mt-3 text-xs text-white/40">
              Próximo: {LEVEL_CONFIG[newCfg.proximo].emoji} {LEVEL_CONFIG[newCfg.proximo].label} em {newCfg.treinos_necessarios} treinos
            </p>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button fullWidth onClick={onContinue}>
            Continuar 💪
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
