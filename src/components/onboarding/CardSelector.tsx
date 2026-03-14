'use client'

import { type ReactNode } from 'react'

interface CardOption {
  value: string
  label: string
  description?: string
  icon?: ReactNode
}

type CardSelectorProps =
  | {
      options: CardOption[]
      value: string | undefined
      onChange: (value: string) => void
      columns?: 1 | 2 | 3
      multi?: never
    }
  | {
      options: CardOption[]
      value: string[]
      onChange: (value: string[]) => void
      columns?: 1 | 2 | 3
      multi: true
    }

export default function CardSelector({
  options,
  value,
  onChange,
  columns = 1,
  multi,
}: CardSelectorProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  }[columns]

  function handleClick(optValue: string) {
    if (multi) {
      const current = value as string[]
      const next = current.includes(optValue)
        ? current.filter((v) => v !== optValue)
        : [...current, optValue]
      ;(onChange as (v: string[]) => void)(next)
    } else {
      ;(onChange as (v: string) => void)(optValue)
    }
  }

  function isSelected(optValue: string) {
    if (multi) return (value as string[]).includes(optValue)
    return value === optValue
  }

  return (
    <div className={`grid ${gridCols} gap-3 w-full`}>
      {options.map((opt) => {
        const selected = isSelected(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleClick(opt.value)}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-200 active:scale-[0.97]
              ${selected
                ? 'border-[#FF8C00] bg-[#FF8C00]/10 text-white'
                : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:bg-white/[0.06]'
              }`}
          >
            {opt.icon && (
              <span className="leading-none flex items-center justify-center">
                {opt.icon}
              </span>
            )}
            <span className="text-sm font-semibold leading-tight">{opt.label}</span>
            {opt.description && (
              <span className="text-xs text-white/50 leading-tight">{opt.description}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
