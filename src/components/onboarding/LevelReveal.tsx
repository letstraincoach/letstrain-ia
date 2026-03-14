'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import Button from '@/components/ui/Button'

// ── Imagem de fundo por tier ──────────────────────────────────────────────────
const TIER_IMAGE: Partial<Record<TrainingLevel, string>> = {
  adaptacao:           '/levels/adaptacao.jpg',
  iniciante_bronze:    '/levels/iniciante.jpg',
  iniciante_prata:     '/levels/iniciante.jpg',
  iniciante_ouro:      '/levels/iniciante.jpg',
  intermediario_bronze:'/levels/intermediario.jpg',
  intermediario_prata: '/levels/intermediario.jpg',
  intermediario_ouro:  '/levels/intermediario.jpg',
  avancado_bronze:     '/levels/avancado.jpg',
  avancado_prata:      '/levels/avancado.jpg',
  avancado_ouro:       '/levels/avancado.jpg',
  atleta_bronze:       '/levels/atleta.jpg',
  atleta_prata:        '/levels/atleta.jpg',
  atleta_ouro:         '/levels/atleta.jpg',
  atleta_pro:          '/levels/atleta.jpg',
  atleta_pro_max:      '/levels/atleta.jpg',
}

// ── Ícones SVG por nível (substitui emojis) ──────────────────────────────────
const LEVEL_ICONS: Record<TrainingLevel, ReactNode> = {
  adaptacao: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12"/><path d="M12 12C12 12 8 10 6 7c-1-1.5-1-4 2-4 1.5 0 3 1 4 3 1-2 2.5-3 4-3 3 0 3 2.5 2 4-2 3-6 5-6 5z"/>
    </svg>
  ),
  iniciante_bronze: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
  iniciante_prata: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      <circle cx="12" cy="10" r="2"/>
    </svg>
  ),
  iniciante_ouro: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      <path d="M9 10l2 2 4-4"/>
    </svg>
  ),
  intermediario_bronze: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  intermediario_prata: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/><line x1="12" y1="8" x2="12" y2="8.01"/>
    </svg>
  ),
  intermediario_ouro: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      <path d="M9 9l6 6M15 9l-6 6"/>
    </svg>
  ),
  avancado_bronze: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  avancado_prata: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      <line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/>
    </svg>
  ),
  avancado_ouro: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      <path d="M9 10l2 2 4-4"/>
    </svg>
  ),
  atleta_bronze: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/>
      <path d="M6 4h12v10a6 6 0 0 1-12 0V4z"/>
      <path d="M9 21h6"/><path d="M12 18v3"/>
    </svg>
  ),
  atleta_prata: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/>
      <path d="M6 4h12v10a6 6 0 0 1-12 0V4z"/>
      <path d="M9 21h6"/><path d="M12 18v3"/>
      <path d="M9 10l2 2 4-4"/>
    </svg>
  ),
  atleta_ouro: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/>
      <path d="M12 7v5l3 1.5"/>
    </svg>
  ),
  atleta_pro: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l1.5-5.5A2 2 0 0 1 6.4 3h11.2a2 2 0 0 1 1.9 1.5L21 10"/>
      <path d="M3 10h18v1a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7v-1z"/>
      <path d="M9 21h6"/><path d="M12 18v3"/>
    </svg>
  ),
  atleta_pro_max: (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6 2 4 7 4 7s-2 1-2 5c0 3 2 5 2 5l3-1s1 3 5 3 5-3 5-3l3 1s2-2 2-5c0-4-2-5-2-5S18 2 12 2z"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
}

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

      {/* Card cinematográfico */}
      <motion.div
        className="w-full rounded-3xl overflow-hidden relative"
        style={{ minHeight: 320, border: `1px solid ${config.cor}30` }}
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
      >
        {/* Imagem de fundo */}
        {TIER_IMAGE[level] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={TIER_IMAGE[level]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.6 }}
          />
        )}

        {/* Overlay gradiente */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.2) 100%)`,
          }}
        />

        {/* Conteúdo sobre o overlay */}
        <div className="relative z-10 flex flex-col items-center gap-4 p-8 pt-16 text-center">
          {/* Badge de nível */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ color: config.cor, backgroundColor: config.cor + '25', border: `1px solid ${config.cor}40` }}
            >
              {config.label}
            </span>
          </motion.div>

          {/* Descrição */}
          <motion.p
            className="text-sm text-white/70 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
          >
            {config.descricao}
          </motion.p>
        </div>
      </motion.div>

      {/* Próximo nível */}
      {nextConfig && config.treinos_necessarios && (
        <motion.div
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 flex items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          <div style={{ color: nextConfig.cor, transform: 'scale(0.45)', transformOrigin: 'center', width: 52, height: 52, flexShrink: 0 }}>
            {LEVEL_ICONS[config.proximo!]}
          </div>
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
