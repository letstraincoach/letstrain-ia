'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Guilherme é o único personal — auto-salva e redireciona
export default function PersonalPage() {
  const router = useRouter()

  useEffect(() => {
    async function autoAssign() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      await supabase
        .from('user_profiles')
        .update({ personal_slug: 'guilherme' })
        .eq('id', user.id)

      router.push('/dashboard')
    }
    autoAssign()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[#FF8C00] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
