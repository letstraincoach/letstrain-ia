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

function hojeKey() {
  return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().split('T')[0]
}

export default function PalavraDoDiaCard({ initialPalavra }: Props) {
  const [palavra, setPalavra]     = useState<Palavra | null>(initialPalavra)
  const [loading, setLoading]     = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIn, setModalIn]     = useState(false)
  const autoOpenedRef = useRef(false)

  const openModal = useCallback(() => {
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
    setTimeout(() => setModalIn(true), 20)
  }, [palavra])

  const closeModal = useCallback(() => {
    setModalIn(false)
    setTimeout(() => {
      setModalOpen(false)
      document.body.style.overflow = ''
    }, 420)
  }, [])

  // Auto-abrir na primeira visita do dia
  useEffect(() => {
    if (autoOpenedRef.current) return
    const key = `palavraDoDia_shown_${hojeKey()}`
    if (typeof window === 'undefined' || localStorage.getItem(key)) return
    autoOpenedRef.current = true
    localStorage.setItem(key, '1')
    const t = setTimeout(() => openModal(), 900)
    return () => clearTimeout(t)
  }, [openModal])

  useEffect(() => {
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Botão inline — w-10 com "Palavra do Dia" em 2 linhas ─────────────────
  return (
    <>
      <button
        onClick={openModal}
        className="flex flex-col items-center gap-1 transition-all active:scale-90 hover:scale-105"
        aria-label="Palavra do Dia"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,215,0,0.09)',
            border: '1px solid rgba(255,215,0,0.25)',
            boxShadow: '0 0 14px rgba(255,215,0,0.10)',
          }}
        >
          <span className="text-lg leading-none">🕊️</span>
        </div>
        <span
          className="text-[8px] font-bold uppercase tracking-wide leading-tight text-center"
          style={{ color: 'rgba(255,215,0,0.45)', maxWidth: 44 }}
        >
          Palavra<br />do Dia
        </span>
      </button>

      {/* ── Overlay escuro + card vertical centralizado ──────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: 'rgba(5,4,2,0.96)',
            opacity: modalIn ? 1 : 0,
            transition: 'opacity 0.42s ease',
          }}
          onClick={closeModal}
        >
          {/* Glow central */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(255,215,0,0.08) 0%, transparent 65%)',
            }}
          />

          <style>{`
            @keyframes pomboFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-5px); }
            }
          `}</style>

          {/* Fechar — canto superior direito */}
          <button
            onClick={closeModal}
            className="absolute top-12 right-5 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors z-10"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            ✕
          </button>

          {/* Card vertical — max-w-xs, não full-width */}
          <div
            className="relative flex flex-col items-center w-full px-8 gap-5"
            style={{
              maxWidth: 340,
              transform: modalIn ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.96)',
              opacity: modalIn ? 1 : 0,
              transition: 'transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.4s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pombo com halo flutuante */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.03) 70%)',
                  border: '1px solid rgba(255,215,0,0.25)',
                  boxShadow: '0 0 48px rgba(255,215,0,0.14)',
                  animation: modalIn ? 'pomboFloat 4s ease-in-out infinite' : undefined,
                }}
              >
                <span className="text-3xl">🕊️</span>
              </div>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,215,0,0.40)' }}
              >
                Deus mandou te dizer
              </p>
            </div>

            {/* Referência */}
            {palavra && (
              <p
                className="text-lg font-bold text-center leading-snug"
                style={{ color: 'rgba(255,215,0,0.92)' }}
              >
                {palavra.versiculo_referencia}
              </p>
            )}

            {/* Versículo */}
            <div
              className="w-full rounded-2xl px-5 py-4 text-center"
              style={{
                background: 'rgba(255,215,0,0.04)',
                border: '1px solid rgba(255,215,0,0.13)',
              }}
            >
              {loading ? (
                <div className="flex flex-col gap-2">
                  <div className="h-2.5 rounded-full bg-white/[0.06] animate-pulse w-full" />
                  <div className="h-2.5 rounded-full bg-white/[0.06] animate-pulse w-5/6 mx-auto" />
                  <div className="h-2.5 rounded-full bg-white/[0.06] animate-pulse w-4/6 mx-auto" />
                </div>
              ) : palavra ? (
                <p
                  className="text-sm italic leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.86)' }}
                >
                  &ldquo;{palavra.versiculo_texto}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-white/30 italic">Não foi possível carregar. Tente novamente.</p>
              )}
            </div>

            {/* Interpretação */}
            {palavra && (
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,215,0,0.12)' }} />
                  <p
                    className="text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: 'rgba(255,215,0,0.38)' }}
                  >
                    Para a sua vida hoje
                  </p>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,215,0,0.12)' }} />
                </div>
                <p
                  className="text-xs leading-relaxed text-center"
                  style={{ color: 'rgba(255,255,255,0.56)' }}
                >
                  {palavra.interpretacao}
                </p>
              </div>
            )}

            {/* Amém */}
            <button
              onClick={closeModal}
              className="w-full rounded-xl font-bold text-sm py-3 transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.14) 0%, rgba(255,165,0,0.07) 100%)',
                border: '1px solid rgba(255,215,0,0.28)',
                color: 'rgba(255,215,0,0.9)',
              }}
            >
              🙏 Amém — Fechar
            </button>

            <p
              className="text-[9px] text-center pb-2"
              style={{ color: 'rgba(255,255,255,0.16)' }}
            >
              Nova palavra amanhã
            </p>
          </div>
        </div>
      )}
    </>
  )
}
