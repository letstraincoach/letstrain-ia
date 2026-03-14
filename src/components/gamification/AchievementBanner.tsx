'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'

export interface NewAchievement {
  codigo: string
  nome: string
  icone_emoji: string
  descricao?: string
}

interface AchievementBannerProps {
  achievements: NewAchievement[]
  onDone: () => void
}

// ── Partículas de explosão (pré-computadas, determinísticas) ──────────────────
const COLORS = ['#F59E0B', '#FF8C00', '#ffffff', '#FFD700', '#FFA500', '#FFF3CD', '#FFB347']

const PARTICLES = Array.from({ length: 32 }, (_, i) => {
  const baseAngle = (i / 32) * Math.PI * 2
  const jitter = ((i * 7919) % 100) / 100 * 0.4 - 0.2
  const angle = baseAngle + jitter
  const r = 80 + ((i * 6271) % 100) / 100 * 140
  const gravity = 50 + ((i * 3571) % 100) / 100 * 100
  return {
    id: i,
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r + gravity,
    size: 4 + ((i * 1327) % 100) / 100 * 8,
    color: COLORS[i % COLORS.length],
    delay: ((i * 13) % 100) / 1000,
    dur: 0.7 + ((i * 7) % 30) / 100,
    rotate: ((i * 97) % 360),
    diamond: i % 5 === 0,
  }
})

// ── Som de recompensa: fanfare ascendente + acorde glorioso ───────────────────
function playRewardSound() {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.55, ctx.currentTime)
    master.connect(ctx.destination)
    const t = ctx.currentTime

    // Fanfare rápida: C4→E4→G4→C5→E5
    const arpeggio = [
      { freq: 261.6, start: 0.00, dur: 0.12 },
      { freq: 329.6, start: 0.10, dur: 0.12 },
      { freq: 392.0, start: 0.20, dur: 0.12 },
      { freq: 523.3, start: 0.30, dur: 0.14 },
      { freq: 659.3, start: 0.42, dur: 0.55 },
    ]
    // Acorde final C5+E5+G5
    const chord = [
      { freq: 523.3, start: 0.42, dur: 0.65 },
      { freq: 659.3, start: 0.42, dur: 0.65 },
      { freq: 784.0, start: 0.42, dur: 0.65 },
    ]

    for (const note of [...arpeggio, ...chord]) {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(master)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(note.freq, t + note.start)
      gain.gain.setValueAtTime(0, t + note.start)
      gain.gain.linearRampToValueAtTime(0.35, t + note.start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.start + note.dur)
      osc.start(t + note.start)
      osc.stop(t + note.start + note.dur + 0.05)
    }

    // Faíscas de brilho: harmônicos altos
    for (let k = 0; k < 5; k++) {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(master)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(2093 + k * 523, t + 0.42 + k * 0.055)
      gain.gain.setValueAtTime(0.07, t + 0.42 + k * 0.055)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42 + k * 0.055 + 0.18)
      osc.start(t + 0.42 + k * 0.055)
      osc.stop(t + 0.42 + k * 0.055 + 0.22)
    }
  } catch {
    // Silently fail
  }
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function AchievementBanner({ achievements, onDone }: AchievementBannerProps) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [exploding, setExploding] = useState(false)
  const [shared, setShared] = useState(false)
  const [sharing, setSharing] = useState(false)

  const current = achievements[index]
  const isLast = index === achievements.length - 1

  useEffect(() => {
    setRevealed(false)
    setExploding(false)
    setShared(false)

    const t1 = setTimeout(() => {
      setRevealed(true)
      setExploding(true)
      playRewardSound()
    }, 280)

    const t2 = setTimeout(() => setExploding(false), 1600)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [index])

  function handleNext() {
    if (isLast) {
      onDone()
    } else {
      setIndex((i) => i + 1)
    }
  }

  function buildImageUrl(ach: NewAchievement) {
    const base = `/api/share/conquista/${ach.codigo}`
    const p = new URLSearchParams({
      emoji: ach.icone_emoji,
      nome: ach.nome,
      descricao: ach.descricao ?? '',
    })
    return `${base}?${p.toString()}`
  }

  async function handleShare() {
    setSharing(true)
    const imageUrl = buildImageUrl(current)
    const text = `Desbloqueei ${current.icone_emoji} "${current.nome}" no Lets Train! 💪\n\nTreina comigo → https://letstrain.com.br`
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const file = new File([blob], 'conquista.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text, title: 'Lets Train' })
      } else if (navigator.share) {
        await navigator.share({ text, title: 'Lets Train' })
      } else {
        await navigator.clipboard.writeText(text)
        setShared(true)
        setTimeout(() => setShared(false), 2500)
      }
    } catch { /* usuário cancelou */ }
    finally { setSharing(false) }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Desbloqueei ${current.icone_emoji} "${current.nome}" no Lets Train! 💪\n\nTreina comigo → https://letstrain.com.br`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  function handleSaveImage() {
    const a = document.createElement('a')
    a.href = buildImageUrl(current)
    a.download = `conquista-${current.codigo}.png`
    a.click()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center overflow-hidden">

      {/* ── Flash de tela ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {exploding && (
          <motion.div
            key={`flash-${index}`}
            className="fixed inset-0 pointer-events-none"
            style={{ background: 'rgba(245,158,11,0.28)', zIndex: 60 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* ── Partículas de explosão ─────────────────────────────────────────── */}
      <AnimatePresence>
        {exploding && (
          <div
            key={`particles-${index}`}
            className="fixed pointer-events-none"
            style={{ top: '45%', left: '50%', zIndex: 59 }}
          >
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  borderRadius: p.diamond ? '2px' : '50%',
                  top: 0,
                  left: 0,
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}99`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  scale: 0.15,
                  rotate: p.diamond ? p.rotate : 0,
                }}
                transition={{ duration: p.dur, ease: [0.0, 0.85, 0.5, 1], delay: p.delay }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── Glow de fundo ─────────────────────────────────────────────────── */}
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
          {/* Indicadores */}
          {achievements.length > 1 && (
            <div className="flex gap-1.5">
              {achievements.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? '24px' : '8px',
                    backgroundColor: i === index ? '#F59E0B' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          )}

          <p className="text-xs uppercase tracking-widest font-semibold text-[#F59E0B]">
            Conquista desbloqueada!
          </p>

          {/* ── Figurinha com flip ── */}
          <div style={{ perspective: '600px' }}>
            <motion.div
              animate={{ rotateY: revealed ? 0 : 90 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="w-36 h-44 rounded-2xl flex flex-col items-center justify-between overflow-hidden"
                style={{
                  background: 'rgba(245,158,11,0.10)',
                  border: '1.5px solid rgba(245,158,11,0.35)',
                }}
                animate={
                  revealed
                    ? {
                        boxShadow: [
                          '0 0 0px rgba(245,158,11,0)',
                          '0 0 56px rgba(245,158,11,0.60)',
                          '0 0 28px rgba(245,158,11,0.25)',
                        ],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-12 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(245,158,11,0.18), transparent)',
                  }}
                />

                <div className="flex-1 flex items-center justify-center">
                  <motion.span
                    className="text-5xl"
                    animate={
                      revealed
                        ? { scale: [1, 1.4, 1], rotate: [0, -12, 12, -6, 6, 0] }
                        : {}
                    }
                    transition={{ delay: 0.1, duration: 0.65, ease: 'easeInOut' }}
                  >
                    {current.icone_emoji}
                  </motion.span>
                </div>

                <div className="w-full h-px bg-[rgba(245,158,11,0.25)]" />

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

          {/* CTAs */}
          <motion.div
            className="w-full flex flex-col gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleShare}
              disabled={sharing}
              className="w-full h-11 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/[0.08] text-[#F59E0B] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#F59E0B]/[0.12] transition-colors active:scale-[0.98] disabled:opacity-60"
            >
              {sharing ? '...' : shared ? '✅ Copiado!' : '📤 Compartilhar conquista'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
              >
                <span>💬</span> WhatsApp
              </button>
              <button
                onClick={handleSaveImage}
                className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
              >
                <span>💾</span> Salvar
              </button>
            </div>

            <Button fullWidth onClick={handleNext}>
              {isLast ? 'Ver álbum 🎴' : `Próxima (${index + 1}/${achievements.length})`}
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
