'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

interface DrumRollPickerProps {
  values: number[]
  value: number | undefined
  onChange: (v: number) => void
  unit?: string
  formatValue?: (v: number) => string
  defaultValue?: number
}

const ITEM_W = 72

export default function DrumRollPicker({
  values,
  value,
  onChange,
  unit,
  formatValue,
  defaultValue,
}: DrumRollPickerProps) {
  const scrollRef  = useRef<HTMLDivElement>(null)
  const lastVal    = useRef<number | null>(null)
  const isScrolling = useRef(false)

  const initial = value !== undefined
    ? Math.max(0, values.indexOf(value))
    : defaultValue !== undefined
      ? Math.max(0, values.indexOf(defaultValue))
      : Math.floor(values.length / 2)

  const [activeIdx, setActiveIdx] = useState(initial)

  // ── Som de tick elegante via Web Audio API ──────────────────────────────
  const playTick = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx  = new Ctx()
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 1050
      gain.gain.setValueAtTime(0.055, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)
      osc.start()
      osc.stop(ctx.currentTime + 0.04)
      osc.onended = () => ctx.close()
    } catch { /* sem suporte */ }
  }, [])

  // ── Posição inicial ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = initial * ITEM_W
    lastVal.current = values[initial]
    if (value === undefined && defaultValue !== undefined) {
      onChange(defaultValue)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── On scroll: atualiza item ativo + som ────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const idx     = Math.round(el.scrollLeft / ITEM_W)
    const clamped = Math.max(0, Math.min(idx, values.length - 1))
    const newVal  = values[clamped]
    setActiveIdx(clamped)
    if (newVal !== lastVal.current) {
      lastVal.current = newVal
      playTick()
      onChange(newVal)
    }
  }, [values, onChange, playTick])

  // ── Clique direto num item ───────────────────────────────────────────────
  const scrollTo = useCallback((idx: number) => {
    scrollRef.current?.scrollTo({ left: idx * ITEM_W, behavior: 'smooth' })
  }, [])

  const fmt = formatValue ?? ((v: number) => String(v))

  return (
    <div className="relative w-full select-none" style={{ height: 96 }}>

      {/* Esconde scrollbar webkit */}
      <style>{`.drum-scroll::-webkit-scrollbar{display:none}`}</style>

      {/* Fades laterais */}
      <div
        className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #0a0a0a 30%, transparent)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #0a0a0a 30%, transparent)' }}
      />

      {/* Caixa central (item selecionado) */}
      <div
        className="absolute top-1/2 left-1/2 z-[5] pointer-events-none"
        style={{
          width: ITEM_W,
          height: 58,
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,140,0,0.07)',
          border: '1.5px solid rgba(255,140,0,0.35)',
          borderRadius: 14,
          boxShadow: '0 0 20px rgba(255,140,0,0.06)',
        }}
      />

      {/* Trilha rolável */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="drum-scroll absolute inset-0 flex items-center overflow-x-auto"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: `calc(50% - ${ITEM_W / 2}px)`,
          paddingRight: `calc(50% - ${ITEM_W / 2}px)`,
        }}
      >
        {values.map((v, i) => {
          const dist     = Math.abs(i - activeIdx)
          const isActive = dist === 0
          const opacity  = isActive ? 1 : Math.max(0.12, 1 - dist * 0.22)
          const scale    = isActive ? 1 : Math.max(0.68, 1 - dist * 0.09)

          return (
            <div
              key={v}
              onClick={() => scrollTo(i)}
              style={{
                minWidth: ITEM_W,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: isActive ? 32 : 22,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#FF8C00' : `rgba(255,255,255,${opacity})`,
                  transform: `scale(${scale})`,
                  transition: 'font-size 0.12s ease, color 0.12s ease, transform 0.12s ease',
                  display: 'block',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {fmt(v)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Unidade */}
      {unit && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span style={{ fontSize: 10, color: 'rgba(255,140,0,0.55)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {unit}
          </span>
        </div>
      )}
    </div>
  )
}
