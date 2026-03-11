'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import EquipmentDetector from '@/components/onboarding/EquipmentDetector'
import EquipmentSelector from '@/components/onboarding/EquipmentSelector'

type Local = 'condominio' | 'hotel' | 'academia' | null

export default function EquipamentosPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [local, setLocal] = useState<Local>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('user_profiles')
        .select('local_treino')
        .eq('id', user.id)
        .single()

      setUserId(user.id)
      setLocal((data?.local_treino as Local) ?? null)
      setLoading(false)
    }

    loadProfile()
  }, [router])

  function handleSaved() {
    router.push('/personal')
  }

  if (loading || !userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
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

  return (
    <div className="flex flex-col items-center w-full max-w-sm gap-4 pt-2">
      {local === 'academia'
        ? <EquipmentSelector userId={userId} localTipo="academia" onSaved={handleSaved} />
        : local === 'condominio' || local === 'hotel'
          ? <EquipmentDetector userId={userId} localTipo={local} onSaved={handleSaved} />
          : <EquipmentSelector userId={userId} localTipo="condominio" onSaved={handleSaved} />
      }
      <button
        type="button"
        onClick={() => router.push('/local')}
        className="text-sm text-white/30 hover:text-white/60 transition-colors pb-8"
      >
        ← Voltar
      </button>
    </div>
  )
}
