'use client'

import { motion } from 'framer-motion'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import Button from '@/components/ui/Button'

interface LevelRevealProps {
  level: TrainingLevel
  onContinue: () => void
  loading?: boolean
}

export default function LevelReveal({ level, onContinue, loading = false }: LevelRevealProps) {
  const config = LEVEL_CONFIG[level]
  const nextConfig = config.proximo ? LEVEL_CONFIG[config.proximo] : null

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm pt-4">
      {/* Cabeçalho */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm text-white/50 mb-1">Seu nível inicial é</p>
        <h2 className="text-2xl font-bold">Descubra seu ponto de partida</h2>
      </motion.div>

      {/* Card de nível */}
      <motion.div
        className="w-full rounded-3xl border p-8 flex flex-col items-center gap-4 text-center"
        style={{
          borderColor: config.cor + '40',
          backgroundColor: config.corBg,
        }}
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
      >
        {/* Emoji / ícone */}
        <motion.span
          className="text-6xl leading-none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1], delay: 0.35 }}
          role="img"
          aria-label={config.label}
        >
          {config.emoji}
        </motion.span>

        {/* Badge de nível */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ color: config.cor, backgroundColor: config.cor + '20' }}
          >
            {config.label}
          </span>
        </motion.div>

        {/* Descrição */}
        <motion.p
          className="text-sm text-white/70 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {config.descricao}
        </motion.p>
      </motion.div>

      {/* Próximo nível */}
      {nextConfig && config.treinos_necessarios && (
        <motion.div
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 flex items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          <span className="text-2xl" role="img" aria-label={nextConfig.label}>
            {nextConfig.emoji}
          </span>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Próximo nível</p>
            <p className="text-sm font-semibold">
              {nextConfig.label}{' '}
              <span className="font-normal text-white/50">
                — {config.treinos_necessarios} treinos
              </span>
            </p>
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        className="w-full pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.35 }}
      >
        <Button fullWidth loading={loading} onClick={onContinue}>
          Começar →
        </Button>
      </motion.div>
    </div>
  )
}
