'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Palavra {
  versiculo_referencia: string
  versiculo_texto: string
  interpretacao: string
}

interface Props {
  initialPalavra: Palavra | null
}

export default function PalavraDoDiaCard({ initialPalavra }: Props) {
  const [palavra, setPalavra] = useState<Palavra | null>(initialPalavra)
  const [loading, setLoading] = useState(!initialPalavra)
  const [modalOpen, setModalOpen] = useState(false)
  const [musicOn, setMusicOn] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)

  // Lazy-fetch se não veio do servidor
  useEffect(() => {
    if (initialPalavra) return
    fetch('/api/palavra-do-dia')
      .then((r) => r.json())
      .then((data: Partial<Palavra>) => {
        if (data.versiculo_referencia) setPalavra(data as Palavra)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [initialPalavra])

  // ── Gospel ambient — acorde C maior com harmônicos suaves ─────────────────
  const startMusic = useCallback(() => {
    if (audioCtxRef.current) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return

    const ctx: AudioContext = new AudioCtx()

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0, ctx.currentTime)
    masterGain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 4) // fade in 4s
    masterGain.connect(ctx.destination)

    // Acorde: C2, G2, C3, E3, G3, C4 — suave como órgão de igreja
    const freqs = [65.41, 98.0, 130.81, 164.81, 196.0, 261.63]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = i < 2 ? 'triangle' : 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      // Micro-detune para riqueza tonal
      osc.detune.setValueAtTime((i - 2.5) * 2.5, ctx.currentTime)

      const oscGain = ctx.createGain()
      oscGain.gain.setValueAtTime(1 / freqs.length, ctx.currentTime)

      osc.connect(oscGain)
      oscGain.connect(masterGain)
      osc.start()
    })

    audioCtxRef.current = ctx
    masterGainRef.current = masterGain
    setMusicOn(true)
  }, [])

  const stopMusic = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current) return
    const gain = masterGainRef.current
    const ctx = audioCtxRef.current
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
    setTimeout(() => {
      ctx.close().catch(() => {})
      audioCtxRef.current = null
      masterGainRef.current = null
      setMusicOn(false)
    }, 1700)
  }, [])

  const openModal = () => {
    setModalOpen(true)
    document.body.style.overflow = 'hidden'
    // Inicia música após breve delay para não bloquear render
    setTimeout(startMusic, 400)
  }

  const closeModal = () => {
    setModalOpen(false)
    document.body.style.overflow = ''
    stopMusic()
  }

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
      }
      document.body.style.overflow = ''
    }
  }, [])

  // ── Teaser card ──────────────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={openModal}
        className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98] hover:scale-[1.01]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.09) 0%, rgba(180,130,0,0.05) 100%)',
          border: '1px solid rgba(255,215,0,0.22)',
          boxShadow: '0 0 32px rgba(255,215,0,0.06) inset',
        }}
      >
        {/* Ícone */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)',
            border: '1px solid rgba(255,215,0,0.3)',
          }}
        >
          <span className="text-2xl">✝️</span>
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: 'rgba(255,215,0,0.55)' }}
          >
            Palavra do Dia
          </p>
          {loading ? (
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 rounded-full bg-white/[0.06] animate-pulse w-3/4" />
            </div>
          ) : palavra ? (
            <p className="text-sm font-semibold text-white/80 truncate">
              {palavra.versiculo_referencia}
            </p>
          ) : (
            <p className="text-xs text-white/40">Toque para receber sua palavra</p>
          )}
          <p className="text-[10px] text-white/30 mt-0.5">Toque e receba a mensagem de Deus</p>
        </div>

        <span style={{ color: 'rgba(255,215,0,0.35)' }} className="text-base shrink-0">✨</span>
      </button>

      {/* ── Modal full-screen ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, #080604 0%, #0c0900 40%, #080604 100%)',
          }}
        >
          {/* Ambient glow */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 90% 60% at 50% 25%, rgba(255,215,0,0.07) 0%, transparent 65%)',
            }}
          />

          {/* Header */}
          <div className="relative flex items-center justify-between px-6 pt-14 pb-2 shrink-0">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,215,0,0.45)' }}
            >
              ✝ Palavra do Dia
            </span>
            <div className="flex items-center gap-2">
              {/* Toggle música */}
              <button
                onClick={() => (musicOn ? stopMusic() : startMusic())}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                style={{
                  background: musicOn ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${musicOn ? 'rgba(255,215,0,0.28)' : 'rgba(255,255,255,0.08)'}`,
                  color: musicOn ? 'rgba(255,215,0,0.85)' : 'rgba(255,255,255,0.35)',
                }}
              >
                🎵 {musicOn ? 'Som ligado' : 'Som desligado'}
              </button>

              {/* Fechar */}
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="relative flex-1 flex flex-col items-center px-7 py-8 gap-7 max-w-md mx-auto w-full">

            {/* Ícone da cruz com halo */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.14) 0%, rgba(255,215,0,0.03) 70%)',
                  border: '1px solid rgba(255,215,0,0.22)',
                  boxShadow: '0 0 60px rgba(255,215,0,0.12)',
                }}
              >
                <span className="text-4xl">✝️</span>
              </div>
              <p
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,215,0,0.4)' }}
              >
                Deus mandou te dizer
              </p>
            </div>

            {/* Referência */}
            {palavra && (
              <p
                className="text-xl font-bold text-center"
                style={{ color: 'rgba(255,215,0,0.9)' }}
              >
                {palavra.versiculo_referencia}
              </p>
            )}

            {/* Versículo */}
            <div
              className="w-full rounded-2xl p-6 text-center"
              style={{
                background: 'rgba(255,215,0,0.04)',
                border: '1px solid rgba(255,215,0,0.14)',
                boxShadow: '0 0 40px rgba(255,215,0,0.04) inset',
              }}
            >
              {loading ? (
                <div className="flex flex-col gap-2">
                  <div className="h-3 rounded-full bg-white/[0.06] animate-pulse w-full" />
                  <div className="h-3 rounded-full bg-white/[0.06] animate-pulse w-5/6 mx-auto" />
                  <div className="h-3 rounded-full bg-white/[0.06] animate-pulse w-4/6 mx-auto" />
                </div>
              ) : palavra ? (
                <p
                  className="text-base italic leading-relaxed font-light"
                  style={{ color: 'rgba(255,255,255,0.88)' }}
                >
                  &ldquo;{palavra.versiculo_texto}&rdquo;
                </p>
              ) : (
                <p className="text-sm text-white/30 italic">
                  Não foi possível carregar a palavra de hoje. Tente novamente.
                </p>
              )}
            </div>

            {/* Interpretação */}
            {palavra && (
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,215,0,0.12)' }} />
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'rgba(255,215,0,0.4)' }}
                  >
                    Para a sua vida hoje
                  </p>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,215,0,0.12)' }} />
                </div>
                <p className="text-sm text-white/60 leading-relaxed text-center">
                  {palavra.interpretacao}
                </p>
              </div>
            )}

            {/* CTA — Amém */}
            <button
              onClick={closeModal}
              className="w-full h-13 rounded-xl font-bold text-sm py-3.5 transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.08) 100%)',
                border: '1px solid rgba(255,215,0,0.30)',
                color: 'rgba(255,215,0,0.9)',
              }}
            >
              🙏 Amém — Fechar
            </button>

            <p
              className="text-[10px] text-center pb-4"
              style={{ color: 'rgba(255,255,255,0.18)' }}
            >
              Nova palavra amanhã
            </p>
          </div>
        </div>
      )}
    </>
  )
}
