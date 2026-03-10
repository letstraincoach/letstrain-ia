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
          <div className="relative w-full aspect-[9/16] max-h-[420px] rounded-2xl overflow-hidden bg-[#111] border border-white/10">
            <video
              ref={videoRef}
              src="/videos/intro-lets-train.mp4"
              playsInline
              preload="metadata"
              onCanPlay={() => setVideoReady(true)}
              onEnded={() => { setVideoEnded(true); setPlaying(false) }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay play/pause */}
            {!videoEnded && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center group"
              >
                {!playing && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-full bg-[#FF8C00] flex items-center justify-center shadow-lg shadow-[#FF8C00]/30"
                  >
                    <span className="text-white text-xl pl-1">▶</span>
                  </motion.div>
                )}
              </button>
            )}

            {/* Indicador de conclusão */}
            {videoEnded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60"
              >
                <div className="text-center">
                  <p className="text-4xl mb-2">🏆</p>
                  <p className="text-sm font-semibold text-white/80">Agora é com você!</p>
                </div>
              </motion.div>
            )}

            {/* Badge "Pré-visualização" enquanto vídeo não existe */}
            {!videoReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#111]">
                <div className="w-14 h-14 rounded-full bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center">
                  <span className="text-2xl">🎬</span>
                </div>
                <p className="text-xs text-white/30 text-center px-6">
                  Vídeo de apresentação<br />em breve
                </p>
              </div>
            )}
          </div>

          {/* Barra de progresso do vídeo */}
          {videoReady && (
            <div className="mt-2 h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#FF8C00] rounded-full"
                animate={{ width: videoEnded ? '100%' : playing ? '60%' : '0%' }}
                transition={{ duration: videoEnded ? 0.3 : 2 }}
              />
            </div>
          )}
        </motion.div>

        {/* Features rápidas */}
        <motion.div
          className="w-full grid grid-cols-3 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          {[
            { icon: '🤖', label: 'Treinos por IA' },
            { icon: '📊', label: 'Progresso real' },
            { icon: '🏆', label: 'Conquistas' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] py-3"
            >
              <span className="text-xl">{f.icon}</span>
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
