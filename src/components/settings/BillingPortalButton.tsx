'use client'

import { useState } from 'react'

interface BillingPortalButtonProps {
  label?: string
  variant?: 'primary' | 'ghost'
}

export default function BillingPortalButton({
  label = 'Gerenciar assinatura',
  variant = 'ghost',
}: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      })

      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Erro ao abrir portal')
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={
          variant === 'primary'
            ? 'h-10 rounded-xl bg-[#FF8C00] text-black font-semibold text-sm flex items-center justify-center hover:bg-[#E07000] transition-colors disabled:opacity-60'
            : 'h-10 rounded-xl border border-white/10 text-white/60 font-medium text-sm flex items-center justify-center hover:border-white/20 hover:text-white/80 transition-colors disabled:opacity-60'
        }
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          label
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  )
}
