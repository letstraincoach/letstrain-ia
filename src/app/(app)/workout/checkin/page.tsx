'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CheckinForm, { type CheckinData } from '@/components/workout/CheckinForm'
import WorkoutGeneratingLoader from '@/components/workout/WorkoutGeneratingLoader'

type PageState = 'loading' | 'checkin' | 'generating' | 'error' | 'done_today'

export default function CheckinPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | undefined>()
  const [treinoConcluidoId, setTreinoConcluidoId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)

      // Verificar se já treinou hoje
      const hoje = new Date().toISOString().split('T')[0]
      const { data: treinoHoje } = await supabase
        .from('workouts')
        .select('id, status')
        .eq('user_id', data.user.id)
        .eq('data', hoje)
        .eq('status', 'executado')
        .limit(1)
        .maybeSingle()

      if (treinoHoje) {
        setTreinoConcluidoId(treinoHoje.id)
        setPageState('done_today')
      } else {
        setPageState('checkin')
      }
    })
  }, [])

  async function handleCheckinSubmit(data: CheckinData) {
    setPageState('generating')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = (await res.json()) as { workout_id?: string; error?: string; paywall?: boolean }

      // Paywall — redirecionar para assinatura
      if (res.status === 402 || json.paywall) {
        router.push('/assinatura')
        return
      }

      // Já treinou hoje — redirecionar para o treino concluído
      if (res.status === 409 && json.workout_id) {
        router.push(`/workout/${json.workout_id}`)
        return
      }

      if (!res.ok || !json.workout_id) {
        setErrorMsg(json.error ?? 'Erro ao gerar treino. Tente novamente.')
        setPageState('error')
        return
      }

      router.push(`/workout/${json.workout_id}`)
    } catch {
      setErrorMsg('Erro de conexão. Verifique sua internet e tente novamente.')
      setPageState('error')
    }
  }

  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-[#FF8C00] animate-spin" />
      </div>
    )
  }

  if (pageState === 'generating') {
    return <WorkoutGeneratingLoader />
  }

  if (pageState === 'done_today') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] px-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <span className="text-6xl">✅</span>

          <div>
            <h1 className="text-2xl font-bold">Treino de hoje concluído!</h1>
            <p className="text-sm text-white/50 mt-2 leading-relaxed">
              Você já treinou hoje. Descanse, recupere-se e volte amanhã mais forte.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-[#FF8C00]/20 bg-[#FF8C00]/05 px-5 py-4">
            <p className="text-xs text-white/40 leading-relaxed">
              A trava diária garante recuperação muscular adequada e evita o overtraining. Um treino bem feito vale mais do que dois apressados.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            {treinoConcluidoId && (
              <Link
                href={`/workout/${treinoConcluidoId}`}
                className="w-full h-12 rounded-xl bg-[#FF8C00] text-black font-semibold text-sm flex items-center justify-center hover:bg-[#E07000] transition-colors"
              >
                Ver treino de hoje →
              </Link>
            )}
            <Link
              href="/dashboard"
              className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.03] text-white/70 font-medium text-sm flex items-center justify-center hover:border-white/20 transition-colors"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#0a0a0a] px-6 py-10">
      {/* Header */}
      <div className="w-full max-w-sm mb-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-white/40 hover:text-white/70 transition-colors mb-6 flex items-center gap-1"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold">Check-in de hoje</h1>
        <p className="mt-1 text-sm text-white/50">
          4 perguntas rápidas para personalizar seu treino.
        </p>
      </div>

      {pageState === 'error' && errorMsg && (
        <div className="w-full max-w-sm mb-6">
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-400">{errorMsg}</p>
          </div>
          <button
            className="mt-3 text-sm text-[#FF8C00] hover:text-[#E07000] transition-colors"
            onClick={() => setPageState('checkin')}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <CheckinForm
        onSubmit={handleCheckinSubmit}
        loading={false}
        userId={userId}
      />
    </div>
  )
}
