'use client'

import { motion } from 'framer-motion'

export interface FigurinhaData {
  codigo: string
  emoji: string
  nome: string
  descricao: string
  desbloqueado: boolean
  desbloqueado_em?: string | null
  cor: string   // category accent color
  corBg: string // category bg color
}

interface FigurinhaProps extends FigurinhaData {
  /** Delay para a animação de entrada (em segundos) */
  delay?: number
}

export default function Figurinha({
  emoji,
  nome,
  descricao,
  desbloqueado,
  cor,
  corBg,
  delay = 0,
}: FigurinhaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay, ease: [0.34, 1.56, 0.64, 1] }}
      title={desbloqueado ? `${nome}: ${descricao}` : 'Conquista bloqueada'}
      className="relative flex flex-col items-center rounded-xl overflow-hidden select-none"
      style={{
        border: desbloqueado ? `1.5px solid ${cor}55` : '1.5px solid rgba(255,255,255,0.06)',
        backgroundColor: desbloqueado ? corBg : 'rgba(255,255,255,0.03)',
        boxShadow: desbloqueado ? `0 2px 12px ${cor}20` : 'none',
      }}
    >
      {/* Emoji area */}
      <div
        className="w-full flex items-center justify-center py-3"
        style={{ minHeight: '64px' }}
      >
        {desbloqueado ? (
          <motion.span
            className="text-3xl"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.1, type: 'spring', stiffness: 300, damping: 18 }}
          >
            {emoji}
          </motion.span>
        ) : (
          <span className="text-2xl grayscale opacity-30">🔒</span>
        )}
      </div>

      {/* Linha divisória */}
      <div
        className="w-full h-px"
        style={{ backgroundColor: desbloqueado ? `${cor}30` : 'rgba(255,255,255,0.04)' }}
      />

      {/* Nome */}
      <div className="w-full px-1.5 py-2 flex items-center justify-center" style={{ minHeight: '40px' }}>
        {desbloqueado ? (
          <p
            className="text-center leading-tight font-semibold"
            style={{ fontSize: '10px', color: cor }}
          >
            {nome}
          </p>
        ) : (
          <p className="text-center leading-tight" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.22)', lineHeight: '1.3' }}>
            {nome}
          </p>
        )}
      </div>

      {/* Brilho de destaque no canto superior (somente desbloqueada) */}
      {desbloqueado && (
        <div
          className="absolute top-0 left-0 w-6 h-6 opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 0% 0%, ${cor}, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  )
}
