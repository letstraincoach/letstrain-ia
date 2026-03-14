'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { classifyLevel } from '@/lib/training/level-classifier'
import { useOnboardingStore } from '@/stores/onboarding.store'
import LevelReveal from '@/components/onboarding/LevelReveal'
import type { TrainingLevel } from '@/types/database.types'

export default function NivelPage() {
  const router = useRouter()
  const answers = useOnboardingStore((s) => s.answers)
  const [level, setLevel] = useState<TrainingLevel | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Classificar e salvar ao montar
  useEffect(() => {
    async function classifyAndSave() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Se respostas do quiz não estão no store, buscar do banco
      let profileAnswers = answers
      if (!profileAnswers.tempo_sem_treinar) {
        const { data } = await supabase
          .from('user_profiles')
          .select('tempo_sem_treinar, doenca_cardiaca, lesao_cronica, nivel_atual')
          .eq('id', user.id)
          .single()

        if (data?.nivel_atual && data.nivel_atual !== 'adaptacao') {
          // Usuário já tem nível definido — só exibir
          setLevel(data.nivel_atual as TrainingLevel)
          return
        }

        profileAnswers = {
          tempo_sem_treinar: data?.tempo_sem_treinar as typeof profileAnswers.tempo_sem_treinar,
          doenca_cardiaca: data?.doenca_cardiaca ?? false,
          lesao_cronica: data?.lesao_cronica ?? false,
        }
      }

      const classified = classifyLevel(profileAnswers)

      // Salvar nível no banco
      const { error: dbError } = await supabase
        .from('user_profiles')
        .update({
          nivel_atual: classified,
          onboarding_etapa: '/desempenho',
        })
        .eq('id', user.id)

      if (dbError) {
        setError('Erro ao salvar nível. Tente recarregar a página.')
        return
      }

      setLevel(classified)
    }

    classifyAndSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleContinue() {
    setSaving(true)
    router.push('/desempenho')
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!level) {
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
        <p className="text-sm text-white/40">Analisando seu perfil...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm gap-4 pt-2">
      <LevelReveal level={level} onContinue={handleContinue} loading={saving} />
      <button
        type="button"
        onClick={() => router.push('/quiz')}
        className="text-sm text-white/30 hover:text-white/60 transition-colors pb-8"
      >
        ← Voltar
      </button>
    </div>
  )
}
