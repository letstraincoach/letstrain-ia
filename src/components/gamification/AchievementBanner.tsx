'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'

export interface NewAchievement {
  codigo: string
  nome: string
  icone_emoji: string
}

interface AchievementBannerProps {
  achievements: NewAchievement[]
  onDone: () => void
}

// ── Som de revelação (3 notas ascendentes, Web Audio API) ─────────────────────
function playRevealSound() {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const t = ctx.currentTime

    const notes = [
      { freq: 659,  startAt: 0,    dur: 0.25 },  // E5
      { freq: 880,  startAt: 0.18, dur: 0.30 },  // A5
      { freq: 1109, startAt: 0.36, dur: 0.50 },  // C#6 — sustain final
    ]

    for (const note of notes) {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(note.freq, t + note.startAt)
      gain.gain.setValueAtTime(0.25, t + note.startAt)
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.startAt + note.dur)

      osc.start(t + note.startAt)
      osc.stop(t + note.startAt + note.dur)
    }
  } catch {
    // Silently fail — audio context may be unavailable
  }
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function AchievementBanner({ achievements, onDone }: AchievementBannerProps) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [shared, setShared] = useState(false)

  const current = achievements[index]
  const isLast = index === achievements.length - 1

  // Dispara o som + revela assim que o card entra em cena
  useEffect(() => {
    setRevealed(false)
    setShared(false)
    const t1 = setTimeout(() => {
      setRevealed(true)
      playRevealSound()
    }, 300)
    return () => clearTimeout(t1)
  }, [index])

  function handleNext() {
    if (isLast) {
      onDone()
    } else {
      setIndex((i) => i + 1)
    }
  }

  async function handleShare() {
    const text = `Desbloqueei ${current.icone_emoji} "${current.nome}" no Lets Train IA! 💪\n\nTreina comigo → https://letstrain.com.br`
    try {
      if (navigator.share) {
        await navigator.share({ text })
      } else {
        await navigator.clipboard.writeText(text)
        setShared(true)
        setTimeout(() => setShared(false), 2500)
      }
    } catch { /* usuário cancelou */ }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      {/* Glow de fundo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 50% 50%, rgba(245,158,11,0.12) 0%, transparent 70%)',
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.codigo}
          className="relative flex flex-col items-center gap-6 max-w-sm w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Indicadores de página */}
          {achievements.length > 1 && (
            <div className="flex gap-1.5">
              {achievements.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? '24px' : '8px',
                    backgroundColor:
                      i === index ? '#F59E0B' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          )}

          <p className="text-xs uppercase tracking-widest font-semibold text-[#F59E0B]">
            Conquista desbloqueada!
          </p>

          {/* ── Figurinha com animação de flip ── */}
          <div style={{ perspective: '600px' }}>
            <motion.div
              animate={{ rotateY: revealed ? 0 : 90 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Card da figurinha */}
              <motion.div
                className="w-36 h-44 rounded-2xl flex flex-col items-center justify-between overflow-hidden"
                style={{
                  background: 'rgba(245,158,11,0.10)',
                  border: '1.5px solid rgba(245,158,11,0.35)',
                  boxShadow: revealed
                    ? '0 0 0px rgba(245,158,11,0)'
                    : '0 0 0px transparent',
                }}
                animate={
                  revealed
                    ? {
                        boxShadow: [
                          '0 0 0px rgba(245,158,11,0)',
                          '0 0 48px rgba(245,158,11,0.50)',
                          '0 0 24px rgba(245,158,11,0.25)',
                        ],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                {/* Topo com brilho */}
                <div
                  className="absolute top-0 left-0 right-0 h-12 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(245,158,11,0.18), transparent)',
                  }}
                />

                {/* Emoji */}
                <div className="flex-1 flex items-center justify-center">
                  <motion.span
                    className="text-5xl"
                    animate={
                      revealed
                        ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }
                        : {}
                    }
                    transition={{ delay: 0.1, duration: 0.5, ease: 'easeInOut' }}
                  >
                    {current.icone_emoji}
                  </motion.span>
                </div>

                {/* Divisória */}
                <div className="w-full h-px bg-[rgba(245,158,11,0.25)]" />

                {/* Nome */}
                <div className="w-full px-2 py-2.5 flex items-center justify-center">
                  <p
                    className="text-center font-bold leading-tight text-[#F59E0B]"
                    style={{ fontSize: '11px' }}
                  >
                    {current.nome}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Partículas / brilhos (CSS puro) */}
          {revealed && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-[#F59E0B]"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [0, (Math.cos((i * Math.PI * 2) / 6) * 80)],
                    y: [0, (Math.sin((i * Math.PI * 2) / 6) * 80)],
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              ))}
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            className="w-full flex flex-col gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleShare}
              className="w-full h-11 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/08 text-[#F59E0B] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#F59E0B]/12 transition-colors active:scale-[0.98]"
            >
              {shared ? '✅ Copiado!' : '📤 Compartilhar conquista'}
            </button>
            <Button fullWidth onClick={handleNext}>
              {isLast ? 'Ver álbum 🎴' : `Próxima (${index + 1}/${achievements.length})`}
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
