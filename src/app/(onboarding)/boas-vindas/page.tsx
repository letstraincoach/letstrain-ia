'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import LetsTrainLogo from '@/components/ui/LetsTrainLogo'
import Button from '@/components/ui/Button'

export default function BoasVindasPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [playing, setPlaying] = useState(false)

  function handleContinue() {
    router.push('/quiz')
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-between px-6 py-10">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <LetsTrainLogo size="md" />
      </motion.div>

      {/* Centro */}
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Headline */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-xs text-[#FF8C00] font-semibold uppercase tracking-widest mb-2">
            Bem-vindo ao Lets Train
          </p>
          <h1 className="text-2xl font-bold leading-tight">
            Seu personal trainer<br />com inteligência artificial
          </h1>
          <p className="text-sm text-white/40 mt-2">
            Veja como funciona em menos de 1 minuto
          </p>
        </motion.div>

        {/* Player de vídeo */}
        <motion.div
          className="w-full relative"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div
            className="relative w-full rounded-2xl overflow-hidden"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <video
              ref={videoRef}
              src="/videos/apresentacao.mp4"
              playsInline
              preload="metadata"
              onLoadedMetadata={() => {
                // Força o browser a renderizar o primeiro frame (elimina tela preta)
                if (videoRef.current) videoRef.current.currentTime = 0.001
              }}
              onCanPlay={() => setVideoReady(true)}
              onEnded={() => { setVideoEnded(true); setPlaying(false) }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="w-full block"
              style={{ maxHeight: '52vh', objectFit: 'contain', display: 'block' }}
            />

            {/* Overlay play/pause — só quando não está tocando */}
            {!videoEnded && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
              >
                {!playing && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: '#FF8C00', boxShadow: '0 0 32px rgba(255,140,0,0.4)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}>
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  </motion.div>
                )}
              </button>
            )}

            {/* Fim do vídeo */}
            {videoEnded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.55)' }}
              >
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/80">Agora é com você!</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Features rápidas */}
        <motion.div
          className="w-full grid grid-cols-3 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          {[
            {
              label: 'Inteligência Artificial',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
                  <circle cx="9" cy="10" r="1" fill="#FF8C00" stroke="none"/>
                  <circle cx="15" cy="10" r="1" fill="#FF8C00" stroke="none"/>
                  <path d="M9 14s1 1 3 1 3-1 3-1"/>
                </svg>
              ),
            },
            {
              label: 'Progresso real',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                  <line x1="2" y1="20" x2="22" y2="20"/>
                </svg>
              ),
            },
            {
              label: 'Conquistas',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2"/>
                  <path d="M18 9h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/>
                  <path d="M6 4h12v10a6 6 0 0 1-12 0V4z"/>
                  <path d="M9 21h6"/>
                  <path d="M12 18v3"/>
                </svg>
              ),
            },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] py-3 px-1"
            >
              {f.icon}
              <span className="text-[11px] text-white/40 text-center leading-tight">{f.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        className="w-full max-w-sm flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <Button fullWidth onClick={handleContinue}>
          Começar meu treino →
        </Button>
        <button
          type="button"
          onClick={handleContinue}
          className="text-sm text-white/25 hover:text-white/50 transition-colors text-center"
        >
          Pular intro
        </button>
      </motion.div>
    </div>
  )
}
