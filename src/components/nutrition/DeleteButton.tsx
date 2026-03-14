'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ logId }: { logId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch(`/api/nutrition/log/${logId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-white/20 hover:text-red-400 text-xs transition-colors disabled:opacity-50"
      title="Remover"
    >
      {loading ? '...' : '✕'}
    </button>
  )
}
