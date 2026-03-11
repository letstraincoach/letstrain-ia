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

// Data de hoje em Brasília (UTC-3)
function hojeKey() {
  return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().split('T')[0]
}

export default function PalavraDoDiaCard({ initialPalavra }: Props) {
  const [palavra, setPalavra] = useState<Palavra | null>(initialPalavra)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIn, setModalIn]   = useState(false)
  const [musicOn, setMusicOn]   = useState(false)

  const audioCtxRef    = useRef<AudioContext | null>(null)
  const masterGainRef  = useRef<GainNode | null>(null)
  const autoOpenedRef  = useRef(false)

  // ── Gospel ambient — acorde C maior com harmônicos suaves ────────────────
  const startMusic = useCallback(() => {
    if (audioCtxRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx: AudioContext = new AudioCtx()
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0, ctx.currentTime)
    masterGain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 4)
    masterGain.connect(ctx.destination)
    const freqs = [65.41, 98.0, 130.81, 164.81, 196.0, 261.63]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = i < 2 ? 'triangle' : 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
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
    const ctx  = audioCtxRef.current
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
    setTimeout(() => {
      ctx.close().catch(() => {})
      audioCtxRef.current = null
      masterGainRef.current = null
      setMusicOn(false)
    }, 1700)
  }, [])

  // ── Abrir / fechar com animação ──────────────────────────────────────────
  const openModal = useCallback(() => {
    // Garantir que a palavra está carregada
    if (!palavra) {
      setLoading(true)
      fetch('/api/palavra-do-dia')
        .then((r) => r.json())
        .then((data: Partial<Palavra>) => {
          if (data.versiculo_referencia) setPalavra(data as Palavra)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
    setModalOpen(true)
    document.body.style.overflow = 'hidden'
    // Entrada com pequeno delay para CSS transition funcionar
    setTimeout(() => setModalIn(true), 20)
    setTimeout(startMusic, 700)
  }, [palavra, startMusic])

  const closeModal = useCallback(() => {
    setModalIn(false)
    stopMusic()
    setTimeout(() => {
      setModalOpen(false)
      document.body.style.overflow = ''
    }, 500)
  }, [stopMusic])

  // ── Auto-abrir na primeira visita do dia ─────────────────────────────────
  useEffect(() => {
    if (autoOpenedRef.current) return
    const key = `palavraDoDia_shown_${hojeKey()}`
    if (typeof window === 'undefined' || localStorage.getItem(key)) return
    autoOpenedRef.current = true
    localStorage.setItem(key, '1')
    // Abre após a página terminar de carregar
    const t = setTimeout(() => openModal(), 900)
    return () => clearTimeout(t)
  }, [openModal])

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
      document.body.style.overflow = ''
    }
  }, [])

  // ── Botão do pombo — pequeno e centralizado ──────────────────────────────
  return (
    <>
      <div className="flex justify-center">
        <button
          onClick={openModal}
          className="flex flex-col items-center gap-1 px-5 py-2.5 rounded-full transition-all active:scale-90 hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,215,0,0.20)',
          }}
        >
          <span className="text-xl leading-none">🕊️</span>
          <span
            className="text-[8px] font-bold uppercase tracking-widest leading-none"
            style={{ color: 'rgba(255,215,0,0.45)' }}
          >
            Palavra do Dia
          </span>
        </button>
      </div>

      {/* ── Modal full-screen com entrada dramática ────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            background: 'linear-gradient(180deg, #080604 0%, #0c0900 40%, #080604 100%)',
            opacity: modalIn ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          {/* Ambient glow pulsante */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 90% 60% at 50% 25%, rgba(255,215,0,0.08) 0%, transparent 65%)',
              animation: modalIn ? 'palavraGlow 3s ease-in-out infinite' : undefined,
            }}
          />

          <style>{`
            @keyframes palavraGlow {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 1; }
            }
            @keyframes pomboFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
          `}</style>

          {/* Header */}
          <div className="relative flex items-center justify-between px-6 pt-14 pb-2 shrink-0">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,215,0,0.45)' }}
            >
              🕊️ Palavra do Dia
            </span>
            <div className="flex items-center gap-2">
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
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Conteúdo — entra vindo de baixo */}
          <div
            className="relative flex-1 flex flex-col items-center px-7 py-8 gap-7 max-w-md mx-auto w-full overflow-y-auto"
            style={{
              transform: modalIn ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
              opacity: modalIn ? 1 : 0,
              transition: 'transform 0.55s cubic-bezier(0.34, 1.36, 0.64, 1), opacity 0.45s ease',
            }}
          >
            {/* Pombo com halo — flutuante */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.14) 0%, rgba(255,215,0,0.03) 70%)',
                  border: '1px solid rgba(255,215,0,0.22)',
                  boxShadow: '0 0 60px rgba(255,215,0,0.14)',
                  animation: modalIn ? 'pomboFloat 4s ease-in-out infinite' : undefined,
                }}
              >
                <span className="text-5xl">🕊️</span>
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
                  Não foi possível carregar a palavra. Tente novamente.
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

            {/* Amém */}
            <button
              onClick={closeModal}
              className="w-full rounded-xl font-bold text-sm py-3.5 transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.08) 100%)',
                border: '1px solid rgba(255,215,0,0.30)',
                color: 'rgba(255,215,0,0.9)',
              }}
            >
              🙏 Amém — Fechar
            </button>

            <p
              className="text-[10px] text-center pb-6"
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
