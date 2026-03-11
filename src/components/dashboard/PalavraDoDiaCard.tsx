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
  const [palavra, setPalavra]   = useState<Palavra | null>(initialPalavra)
  const [loading, setLoading]   = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIn, setModalIn]   = useState(false)
  const autoOpenedRef = useRef(false)

  // ── Abrir / fechar ────────────────────────────────────────────────────────
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
    }, 450)
  }, [])

  // ── Auto-abrir na primeira visita do dia ──────────────────────────────────
  useEffect(() => {
    if (autoOpenedRef.current) return
    const key = `palavraDoDia_shown_${hojeKey()}`
    if (typeof window === 'undefined' || localStorage.getItem(key)) return
    autoOpenedRef.current = true
    localStorage.setItem(key, '1')
    const t = setTimeout(() => openModal(), 900)
    return () => clearTimeout(t)
  }, [openModal])

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Botão minúsculo — inline na linha do greeting ────────────────────────
  return (
    <>
      <button
        onClick={openModal}
        className="flex flex-col items-center gap-0.5 transition-all active:scale-90 hover:scale-110"
        aria-label="Palavra do Dia"
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,215,0,0.08)',
            border: '1px solid rgba(255,215,0,0.22)',
            boxShadow: '0 0 12px rgba(255,215,0,0.08)',
          }}
        >
          <span className="text-base leading-none">🕊️</span>
        </div>
        <span
          className="text-[7px] font-bold uppercase tracking-widest leading-none"
          style={{ color: 'rgba(255,215,0,0.4)' }}
        >
          Palavra
        </span>
      </button>

      {/* ── Modal full-screen, sem scroll ────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            background: 'linear-gradient(180deg, #060503 0%, #0c0900 45%, #060503 100%)',
            opacity: modalIn ? 1 : 0,
            transition: 'opacity 0.45s ease',
          }}
        >
          {/* Glow */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 100% 55% at 50% 20%, rgba(255,215,0,0.09) 0%, transparent 65%)',
            }}
          />

          <style>{`
            @keyframes pomboFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-5px); }
            }
          `}</style>

          {/* Header */}
          <div className="relative flex items-center justify-between px-6 pt-12 pb-0 shrink-0">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,215,0,0.4)' }}
            >
              🕊️ Palavra do Dia
            </span>
            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              ✕
            </button>
          </div>

          {/* Corpo — flex-1, justify-between para preencher a tela toda */}
          <div
            className="relative flex-1 flex flex-col justify-between px-6 py-5"
            style={{
              transform: modalIn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
              opacity: modalIn ? 1 : 0,
              transition: 'transform 0.5s cubic-bezier(0.34, 1.36, 0.64, 1), opacity 0.4s ease',
            }}
          >
            {/* Topo — pombo + "Deus mandou te dizer" + referência */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.14) 0%, rgba(255,215,0,0.03) 70%)',
                  border: '1px solid rgba(255,215,0,0.22)',
                  boxShadow: '0 0 50px rgba(255,215,0,0.12)',
                  animation: modalIn ? 'pomboFloat 4s ease-in-out infinite' : undefined,
                }}
              >
                <span className="text-3xl">🕊️</span>
              </div>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,215,0,0.4)' }}
              >
                Deus mandou te dizer
              </p>
              {palavra && (
                <p className="text-lg font-bold text-center" style={{ color: 'rgba(255,215,0,0.9)' }}>
                  {palavra.versiculo_referencia}
                </p>
              )}
            </div>

            {/* Versículo */}
            <div
              className="w-full rounded-2xl p-5 text-center"
              style={{
                background: 'rgba(255,215,0,0.04)',
                border: '1px solid rgba(255,215,0,0.13)',
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
                  className="text-sm italic leading-relaxed font-light"
                  style={{ color: 'rgba(255,255,255,0.88)' }}
                >
                  &ldquo;{palavra.versiculo_texto}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-white/30 italic">Não foi possível carregar. Tente novamente.</p>
              )}
            </div>

            {/* Interpretação */}
            {palavra && (
              <div className="flex flex-col gap-2">
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
                <p className="text-sm text-white/58 leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.58)' }}>
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
                border: '1px solid rgba(255,215,0,0.28)',
                color: 'rgba(255,215,0,0.9)',
              }}
            >
              🙏 Amém — Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
