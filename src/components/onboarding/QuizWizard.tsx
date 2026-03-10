'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useOnboardingStore, TOTAL_STEPS, type QuizAnswers } from '@/stores/onboarding.store'
import ProgressBar from './ProgressBar'
import QuizStep from './QuizStep'
import CardSelector from './CardSelector'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ---- Tipos internos ----

type ToggleValue = boolean | undefined

// ---- Toggle Sim/Não ----
function YesNoToggle({
  value,
  onChange,
}: {
  value: ToggleValue
  onChange: (v: boolean) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'Não', val: false, icon: '✗' },
        { label: 'Sim', val: true, icon: '✓' },
      ].map(({ label, val, icon }) => {
        const selected = value === val
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(val)}
            className={`flex items-center justify-center gap-2 h-14 rounded-2xl border font-semibold text-sm transition-all duration-200 active:scale-[0.97]
              ${selected
                ? val
                  ? 'border-[#FF8C00] bg-[#FF8C00]/10 text-[#FF8C00]'
                  : 'border-white/30 bg-white/10 text-white'
                : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
              }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ---- Seletor de dias (2–7) ----
function DaysSelector({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (v: number) => void
}) {
  const options = [2, 3, 4, 5, 6, 7]

  return (
    <div className="flex gap-2 w-full">
      {options.map((d) => {
        const selected = value === d
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className={`flex-1 flex flex-col items-center justify-center h-12 rounded-xl border font-bold text-sm transition-all duration-200 active:scale-[0.97]
              ${selected
                ? 'border-[#FF8C00] bg-[#FF8C00]/10 text-[#FF8C00]'
                : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
              }`}
          >
            <span>{d}</span>
            <span className="text-[9px] font-normal opacity-70 leading-none">dias</span>
          </button>
        )
      })}
    </div>
  )
}

// ---- Seletor de sexo ----
function SexSelector({
  value,
  onChange,
}: {
  value: 'masculino' | 'feminino' | undefined
  onChange: (v: 'masculino' | 'feminino') => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {([
        { val: 'masculino' as const, label: '♂ Masculino' },
        { val: 'feminino' as const, label: '♀ Feminino' },
      ]).map(({ val, label }) => {
        const selected = value === val
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`h-14 rounded-2xl border font-semibold text-sm transition-all duration-200 active:scale-[0.97]
              ${selected
                ? 'border-[#FF8C00] bg-[#FF8C00]/10 text-[#FF8C00]'
                : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
              }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ---- Modal de aviso cardíaco ----
function CardiacWarningModal({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
        <div className="text-3xl mb-4 text-center">❤️</div>
        <h3 className="text-lg font-bold mb-2 text-center">Atenção</h3>
        <p className="text-sm text-white/70 text-center leading-relaxed mb-6">
          Recomendamos que você consulte seu médico antes de iniciar um programa de exercícios.
          Seus treinos serão adaptados para o nível <strong className="text-white">Adaptação</strong> com foco em segurança.
        </p>
        <Button fullWidth onClick={onConfirm}>
          Entendi, continuar
        </Button>
      </div>
    </div>
  )
}

// ---- Componente principal ----

export default function QuizWizard() {
  const router = useRouter()
  const { step, answers, nextStep, prevStep, setAnswer } = useOnboardingStore()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showCardiacWarning, setShowCardiacWarning] = useState(false)

  function clearError() {
    setError(null)
  }

  // ---- Validação por step ----
  function validate(): boolean {
    setError(null)
    switch (step) {
      case 0:
        if (!answers.nome?.trim()) return fail('Informe seu nome.')
        if (answers.nome.trim().length < 2) return fail('Nome muito curto.')
        return true
      case 1:
        if (!answers.sexo) return fail('Selecione uma opção.')
        return true
      case 2:
        if (!answers.peso) return fail('Informe seu peso.')
        if (answers.peso < 30 || answers.peso > 300) return fail('Peso deve estar entre 30 e 300 kg.')
        return true
      case 3:
        if (!answers.idade) return fail('Informe sua idade.')
        if (answers.idade < 13 || answers.idade > 99) return fail('Idade deve estar entre 13 e 99 anos.')
        return true
      case 4:
        if (!answers.altura) return fail('Informe sua altura.')
        if (answers.altura < 100 || answers.altura > 250) return fail('Altura deve estar entre 100 e 250 cm.')
        return true
      case 5:
        if (!answers.tempo_sem_treinar) return fail('Selecione uma opção.')
        return true
      case 6:
        if (answers.doenca_cardiaca === undefined) return fail('Selecione uma opção.')
        return true
      case 7:
        if (answers.lesao_cronica === undefined) return fail('Selecione uma opção.')
        if (answers.lesao_cronica && !answers.lesao_descricao?.trim())
          return fail('Descreva a lesão para que possamos adaptar seus treinos.')
        return true
      case 8:
        if (answers.medicamento_controlado === undefined) return fail('Selecione uma opção.')
        return true
      case 9:
        if (!answers.objetivo?.length) return fail('Selecione ao menos um objetivo.')
        return true
      case 10:
        if (!answers.dias_por_semana) return fail('Selecione quantos dias por semana.')
        return true
      case 11:
        if (!answers.preferencia_treino) return fail('Selecione sua preferência.')
        return true
      default:
        return true
    }
  }

  function fail(msg: string): boolean {
    setError(msg)
    return false
  }

  // ---- Avançar ----
  function handleNext() {
    if (!validate()) return

    // Step 6: aviso cardíaco
    if (step === 6 && answers.doenca_cardiaca === true) {
      setShowCardiacWarning(true)
      return
    }

    if (step === TOTAL_STEPS - 1) {
      handleFinish()
    } else {
      nextStep()
    }
  }

  // ---- Finalizar e salvar ----
  async function handleFinish() {
    if (!validate()) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Sessão expirada. Faça login novamente.')
      setSaving(false)
      return
    }

    const { error: dbError } = await supabase
      .from('user_profiles')
      .update({
        nome: answers.nome?.trim() ?? null,
        sexo: answers.sexo ?? null,
        peso: answers.peso,
        idade: answers.idade,
        altura: answers.altura,
        tempo_sem_treinar: answers.tempo_sem_treinar,
        doenca_cardiaca: answers.doenca_cardiaca ?? false,
        lesao_cronica: answers.lesao_cronica ?? false,
        lesao_descricao: answers.lesao_descricao ?? null,
        medicamento_controlado: answers.medicamento_controlado ?? false,
        objetivo: answers.objetivo?.join(',') ?? null,
        dias_por_semana: answers.dias_por_semana,
        preferencia_treino: answers.preferencia_treino,
        onboarding_etapa: '/nivel',
      })
      .eq('id', user.id)

    if (dbError) {
      setError('Erro ao salvar. Tente novamente.')
      setSaving(false)
      return
    }

    router.push('/nivel')
  }

  // ---- Renderização dos steps ----
  function renderStep() {
    switch (step) {
      case 0:
        return (
          <QuizStep title="Qual é o seu nome?" subtitle="Como podemos te chamar?" error={error ?? undefined}>
            <Input
              type="text"
              placeholder="Ex: João Silva"
              value={answers.nome ?? ''}
              onChange={(e) => {
                clearError()
                setAnswer('nome', e.target.value || undefined)
              }}
              autoFocus
              autoComplete="name"
            />
          </QuizStep>
        )

      case 1:
        return (
          <QuizStep
            title="Qual é o seu sexo biológico?"
            subtitle="Usado para calcular seu metabolismo com precisão."
            error={error ?? undefined}
          >
            <SexSelector
              value={answers.sexo}
              onChange={(v) => {
                clearError()
                setAnswer('sexo', v)
              }}
            />
          </QuizStep>
        )

      case 2:
        return (
          <QuizStep title="Qual é o seu peso?" subtitle="Em quilogramas (kg)" error={error ?? undefined}>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Ex: 75"
              value={answers.peso ?? ''}
              onChange={(e) => {
                clearError()
                setAnswer('peso', e.target.value ? parseFloat(e.target.value) : undefined)
              }}
              autoFocus
            />
          </QuizStep>
        )

      case 3:
        return (
          <QuizStep title="Qual é a sua idade?" subtitle="Em anos completos" error={error ?? undefined}>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Ex: 30"
              value={answers.idade ?? ''}
              onChange={(e) => {
                clearError()
                setAnswer('idade', e.target.value ? parseInt(e.target.value) : undefined)
              }}
              autoFocus
            />
          </QuizStep>
        )

      case 4:
        return (
          <QuizStep title="Qual é a sua altura?" subtitle="Em centímetros (cm)" error={error ?? undefined}>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Ex: 175"
              value={answers.altura ?? ''}
              onChange={(e) => {
                clearError()
                setAnswer('altura', e.target.value ? parseInt(e.target.value) : undefined)
              }}
              autoFocus
            />
          </QuizStep>
        )

      case 5:
        return (
          <QuizStep
            title="Há quanto tempo você não pratica atividade física regular?"
            error={error ?? undefined}
          >
            <CardSelector
              options={[
                { value: 'treinando_regularmente', label: 'Estou treinando regularmente', icon: '✅' },
                { value: 'menos_6_meses', label: 'Menos de 6 meses', icon: '🟢' },
                { value: '6m_1ano', label: '6 meses a 1 ano', icon: '🟡' },
                { value: 'mais_1_ano', label: 'Mais de 1 ano', icon: '🟠' },
                { value: 'nunca_treinou', label: 'Nunca treinei', icon: '⚪' },
              ]}
              value={answers.tempo_sem_treinar}
              onChange={(v) => {
                clearError()
                setAnswer('tempo_sem_treinar', v as QuizAnswers['tempo_sem_treinar'])
              }}
            />
          </QuizStep>
        )

      case 6:
        return (
          <QuizStep
            title="Você tem alguma doença cardíaca diagnosticada?"
            subtitle="Hipertensão, arritmia, cardiopatia, entre outras."
            error={error ?? undefined}
          >
            <YesNoToggle
              value={answers.doenca_cardiaca}
              onChange={(v) => {
                clearError()
                setAnswer('doenca_cardiaca', v)
              }}
            />
          </QuizStep>
        )

      case 7:
        return (
          <QuizStep
            title="Você tem alguma lesão crônica?"
            subtitle="Joelho, coluna, ombro, quadril ou qualquer outra."
            error={error ?? undefined}
          >
            <YesNoToggle
              value={answers.lesao_cronica}
              onChange={(v) => {
                clearError()
                setAnswer('lesao_cronica', v)
                if (!v) setAnswer('lesao_descricao', undefined)
              }}
            />
            {answers.lesao_cronica && (
              <Input
                placeholder="Descreva a lesão (ex: joelho direito, hérnia L4-L5...)"
                value={answers.lesao_descricao ?? ''}
                onChange={(e) => {
                  clearError()
                  setAnswer('lesao_descricao', e.target.value || undefined)
                }}
                autoFocus
              />
            )}
          </QuizStep>
        )

      case 8:
        return (
          <QuizStep
            title="Você usa algum medicamento controlado?"
            subtitle="Antidepressivos, ansiolíticos, antihipertensivos, etc."
            error={error ?? undefined}
          >
            <YesNoToggle
              value={answers.medicamento_controlado}
              onChange={(v) => {
                clearError()
                setAnswer('medicamento_controlado', v)
              }}
            />
          </QuizStep>
        )

      case 9:
        return (
          <QuizStep
            title="Quais são seus objetivos?"
            subtitle="Selecione um ou mais objetivos."
            error={error ?? undefined}
          >
            <CardSelector
              multi
              options={[
                {
                  value: 'perda_peso',
                  label: 'Perda de Peso',
                  description: 'Queimar gordura e melhorar composição corporal',
                  icon: '🔥',
                },
                {
                  value: 'ganho_massa',
                  label: 'Ganho de Massa',
                  description: 'Aumentar força e volume muscular',
                  icon: '💪',
                },
                {
                  value: 'qualidade_vida',
                  label: 'Qualidade de Vida',
                  description: 'Mais disposição, saúde e bem-estar',
                  icon: '🌱',
                },
              ]}
              value={answers.objetivo ?? []}
              onChange={(v) => {
                clearError()
                setAnswer('objetivo', v as QuizAnswers['objetivo'])
              }}
            />
          </QuizStep>
        )

      case 10:
        return (
          <QuizStep
            title="Quantos dias por semana você quer treinar?"
            subtitle="Escolha uma quantidade realista para a sua rotina."
            error={error ?? undefined}
          >
            <DaysSelector
              value={answers.dias_por_semana}
              onChange={(v) => {
                clearError()
                setAnswer('dias_por_semana', v)
              }}
            />
          </QuizStep>
        )

      case 11:
        return (
          <QuizStep title="Qual é a sua preferência de treino?" error={error ?? undefined}>
            <CardSelector
              options={[
                {
                  value: 'isolados',
                  label: 'Treinos Isolados',
                  description: 'Um grupo muscular por sessão (peito, costas, pernas...)',
                  icon: '🎯',
                },
                {
                  value: 'grupos_musculares',
                  label: 'Grupos Musculares',
                  description: 'Dois ou mais grupos por sessão (push/pull/legs)',
                  icon: '⚡',
                },
                {
                  value: 'superior_inferior',
                  label: 'Superior + Inferior',
                  description: 'Corpo inteiro dividido em parte superior e inferior',
                  icon: '🔄',
                },
              ]}
              value={answers.preferencia_treino}
              onChange={(v) => {
                clearError()
                setAnswer('preferencia_treino', v as QuizAnswers['preferencia_treino'])
              }}
            />
          </QuizStep>
        )

      default:
        return null
    }
  }

  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <>
      {showCardiacWarning && (
        <CardiacWarningModal
          onConfirm={() => {
            setShowCardiacWarning(false)
            nextStep()
          }}
        />
      )}

      <div className="flex flex-col items-center w-full max-w-sm gap-8 pt-2">
        <ProgressBar current={step} total={TOTAL_STEPS} />

        {renderStep()}

        {/* Navegação */}
        <div className="flex flex-col gap-3 w-full max-w-sm pb-8">
          <Button fullWidth loading={saving} onClick={handleNext}>
            {isLastStep ? 'Concluir' : 'Continuar'}
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              clearError()
              if (step === 0) {
                router.push('/login')
              } else {
                prevStep()
              }
            }}
            disabled={saving}
          >
            ← Voltar
          </Button>
        </div>
      </div>
    </>
  )
}
