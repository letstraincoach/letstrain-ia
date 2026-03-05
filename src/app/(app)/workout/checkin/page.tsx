'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CheckinForm, { type CheckinData } from '@/components/workout/CheckinForm'
import WorkoutGeneratingLoader from '@/components/workout/WorkoutGeneratingLoader'

type PageState = 'checkin' | 'generating' | 'error'

export default function CheckinPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('checkin')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleCheckinSubmit(data: CheckinData) {
    setPageState('generating')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = (await res.json()) as { workout_id?: string; error?: string }

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

  const isGenerating = pageState === 'generating'

  if (isGenerating) {
    return <WorkoutGeneratingLoader />
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
          3 perguntas rápidas para personalizar seu treino.
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
        loading={isGenerating}
      />
    </div>
  )
}
