import type { TrainingLevel } from '@/types/database.types'

interface ClassifyInput {
  tempo_sem_treinar?: string
  doenca_cardiaca?: boolean
  lesao_cronica?: boolean
}

/**
 * Classifica o nível inicial do usuário com base nas respostas da anamnese.
 * Regra de segurança tem prioridade máxima: qualquer condição de risco → Adaptação.
 */
export function classifyLevel(answers: ClassifyInput): TrainingLevel {
  const { tempo_sem_treinar, doenca_cardiaca, lesao_cronica } = answers

  // Segurança primeiro
  if (doenca_cardiaca || lesao_cronica) return 'adaptacao'

  // Tempo sem treinar
  if (tempo_sem_treinar === 'nunca_treinou' || tempo_sem_treinar === 'mais_1_ano') {
    return 'adaptacao'
  }
  if (tempo_sem_treinar === '6m_1ano') return 'iniciante_bronze'
  if (tempo_sem_treinar === 'menos_6_meses') return 'intermediario_bronze'
  if (tempo_sem_treinar === 'treinando_regularmente') return 'intermediario_bronze'

  // Fallback seguro
  return 'adaptacao'
}
