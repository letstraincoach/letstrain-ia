'use client'

import { ReactNode } from 'react'

interface QuizStepProps {
  title: string
  subtitle?: string
  children: ReactNode
  error?: string
}

export default function QuizStep({ title, subtitle, children, error }: QuizStepProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-xl font-bold leading-snug">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
      </div>

      <div className="flex flex-col gap-3">{children}</div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
    </div>
  )
}
