import { create } from 'zustand'

export interface QuizAnswers {
  nome?: string
  sexo?: 'masculino' | 'feminino'
  peso?: number
  idade?: number
  altura?: number
  tempo_sem_treinar?: 'menos_6_meses' | '6m_1ano' | 'mais_1_ano' | 'nunca_treinou' | 'treinando_regularmente'
  doenca_cardiaca?: boolean
  lesao_cronica?: boolean
  lesao_descricao?: string
  medicamento_controlado?: boolean
  objetivo?: Array<'perda_peso' | 'ganho_massa' | 'qualidade_vida'>
  dias_por_semana?: number
  preferencia_treino?: 'isolados' | 'grupos_musculares' | 'superior_inferior'
}

interface OnboardingStore {
  step: number
  answers: QuizAnswers
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void
  reset: () => void
}

export const TOTAL_STEPS = 12

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 0,
  answers: {},

  setStep: (step) => set({ step }),

  nextStep: () =>
    set((state) => ({
      step: Math.min(state.step + 1, TOTAL_STEPS - 1),
    })),

  prevStep: () =>
    set((state) => ({
      step: Math.max(state.step - 1, 0),
    })),

  setAnswer: (key, value) =>
    set((state) => ({
      answers: { ...state.answers, [key]: value },
    })),

  reset: () => set({ step: 0, answers: {} }),
}))
