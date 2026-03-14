'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import Button from '@/components/ui/Button'

// ── Imagem de fundo por tier ──────────────────────────────────────────────────
const TIER_IMAGE: Partial<Record<TrainingLevel, string>> = {
  adaptacao:            '/levels/adaptacao.jpg',
  iniciante_bronze:     '/levels/iniciante.jpg',
  iniciante_prata:      '/levels/iniciante.jpg',
  iniciante_ouro:       '/levels/iniciante.jpg',
  intermediario_bronze: '/levels/intermediario.jpg',
  intermediario_prata:  '/levels/intermediario.jpg',
  intermediario_ouro:   '/levels/intermediario.jpg',
  avancado_bronze:      '/levels/avancado.jpg',
  avancado_prata:       '/levels/avancado.jpg',
  avancado_ouro:        '/levels/avancado.jpg',
  atleta_bronze:        '/levels/atleta.jpg',
  atleta_prata:         '/levels/atleta.jpg',
  atleta_ouro:          '/levels/atleta.jpg',
  atleta_pro:           '/levels/atleta.jpg',
  atleta_pro_max:       '/levels/atleta.jpg',
}

// ── Ícones SVG por nível ──────────────────────────────────────────────────────
const LEVEL_ICONS: Record<TrainingLevel, ReactNode> = {
  adaptacao: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12"/><path d="M12 12C12 12 8 10 6 7c-1-1.5-1-4 2-4 1.5 0 3 1 4 3 1-2 2.5-3 4-3 3 0 3 2.5 2 4-2 3-6 5-6 5z"/>
    </svg>
  ),
  iniciante_bronze: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
  iniciante_prata: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      <circle cx="12" cy="10" r="2"/>
    </svg>
  ),
  iniciante_ouro: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      <path d="M9 10l2 2 4-4"/>
    </svg>
  ),
  intermediario_bronze: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  intermediario_prata: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/><line x1="12" y1="8" x2="12" y2="8.01"/>
    </svg>
  ),
  intermediario_ouro: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      <path d="M9 9l6 6M15 9l-6 6"/>
    </svg>
  ),
  avancado_bronze: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  avancado_prata: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      <line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/>
    </svg>
  ),
  avancado_ouro: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      <path d="M9 10l2 2 4-4"/>
    </svg>
  ),
  atleta_bronze: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/>
      <path d="M6 4h12v10a6 6 0 0 1-12 0V4z"/>
      <path d="M9 21h6"/><path d="M12 18v3"/>
    </svg>
  ),
  atleta_prata: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/>
      <path d="M6 4h12v10a6 6 0 0 1-12 0V4z"/>
      <path d="M9 21h6"/><path d="M12 18v3"/>
      <path d="M9 10l2 2 4-4"/>
    </svg>
  ),
  atleta_ouro: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/>
      <path d="M12 7v5l3 1.5"/>
    </svg>
  ),
  atleta_pro: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l1.5-5.5A2 2 0 0 1 6.4 3h11.2a2 2 0 0 1 1.9 1.5L21 10"/>
      <path d="M3 10h18v1a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7v-1z"/>
      <path d="M9 21h6"/><path d="M12 18v3"/>
    </svg>
  ),
  atleta_pro_max: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6 2 4 7 4 7s-2 1-2 5c0 3 2 5 2 5l3-1s1 3 5 3 5-3 5-3l3 1s2-2 2-5c0-4-2-5-2-5S18 2 12 2z"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
}

interface LevelUpScreenProps {
  previousLevel: TrainingLevel
  newLevel: TrainingLevel
  onContinue: () => void
}

export default function LevelUpScreen({ previousLevel, newLevel, onContinue }: LevelUpScreenProps) {
  const prevCfg = LEVEL_CONFIG[previousLevel]
  const newCfg  = LEVEL_CONFIG[newLevel]
  const bgImage = TIER_IMAGE[newLevel]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-end justify-end">

      {/* Cinematic hero */}
      <motion.div
        className="w-full relative overflow-hidden"
        style={{ minHeight: '65vh' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background image */}
        {bgImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.65 }}
          />
        )}

        {/* Color glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 40% at 50% 30%, ${newCfg.cor}22 0%, transparent 65%)`,
          }}
        />

        {/* Dark gradient — bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.35) 55%, rgba(10,10,10,0.05) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 pb-10 pt-16 text-center">
          {/* Badge */}
          <motion.p
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: newCfg.cor }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.35 }}
          >
            Parabéns! Você subiu de nível
          </motion.p>

          {/* Transição: anterior → novo */}
          <div className="flex items-center gap-5">
            {/* Nível anterior */}
            <motion.div
              className="flex flex-col items-center gap-1.5"
              style={{ opacity: 0.35 }}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 0.35 }}
              transition={{ delay: 0.35, duration: 0.45 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: prevCfg.corBg, border: `1px solid ${prevCfg.cor}30`, color: prevCfg.cor }}
              >
                {LEVEL_ICONS[previousLevel]}
              </div>
              <p className="text-[11px] text-white/35 font-medium">{prevCfg.label}</p>
            </motion.div>

            {/* Seta */}
            <motion.span
              className="text-xl text-white/30"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }}
            >
              →
            </motion.span>

            {/* Novo nível */}
            <motion.div
              className="flex flex-col items-center gap-1.5"
              initial={{ x: 30, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.42, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: newCfg.corBg, border: `1.5px solid ${newCfg.cor}60`, color: newCfg.cor }}
                animate={{ boxShadow: [`0 0 0px ${newCfg.cor}00`, `0 0 28px ${newCfg.cor}55`, `0 0 14px ${newCfg.cor}30`] }}
                transition={{ delay: 0.8, duration: 1.6, repeat: Infinity, repeatType: 'reverse' }}
              >
                <div style={{ transform: 'scale(1.15)' }}>
                  {LEVEL_ICONS[newLevel]}
                </div>
              </motion.div>
              <p className="text-sm font-bold" style={{ color: newCfg.cor }}>{newCfg.label}</p>
            </motion.div>
          </div>

          {/* Descrição */}
          <motion.p
            className="text-sm text-white/60 leading-relaxed max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
          >
            {newCfg.descricao}
          </motion.p>
        </div>
      </motion.div>

      {/* Actions panel */}
      <motion.div
        className="w-full px-6 pb-10 flex flex-col gap-3 bg-[#0a0a0a]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        {newCfg.proximo && newCfg.treinos_necessarios && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 flex items-center gap-3">
            <div style={{ color: LEVEL_CONFIG[newCfg.proximo].cor }}>
              {LEVEL_ICONS[newCfg.proximo]}
            </div>
            <div>
              <p className="text-xs text-white/35">Próximo nível</p>
              <p className="text-sm font-semibold">
                {LEVEL_CONFIG[newCfg.proximo].label}{' '}
                <span className="font-normal text-white/40">— {newCfg.treinos_necessarios} treinos</span>
              </p>
            </div>
          </div>
        )}

        <Button fullWidth onClick={onContinue}>
          Continuar →
        </Button>
      </motion.div>
    </div>
  )
}
