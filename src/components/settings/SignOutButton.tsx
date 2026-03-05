'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="h-11 rounded-xl border border-red-500/20 bg-red-500/[0.06] text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors disabled:opacity-60"
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
      ) : '→ Sair da conta'}
    </button>
  )
}
