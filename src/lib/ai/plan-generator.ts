import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel, TrainingLocation } from '@/types/database.types'
import { z } from 'zod'
import { WorkoutSchema } from './workout-schemas'

export const PlanSchema = z.object({
  nome_plano: z.string().min(1),
  treinos: z.array(WorkoutSchema).min(1).max(7),
})

export type GeneratedPlan = z.infer<typeof PlanSchema>

export interface PlanContext {
  nivel: TrainingLevel
  objetivo: string
  preferencia_treino: string
  lesao_cronica: boolean
  lesao_descricao?: string | null
  doenca_cardiaca: boolean
  local_treino: TrainingLocation
  equipamentos: string[]
  dias_por_semana: number  // 3–5
  historico_semanas?: string[] | null  // nomes dos últimos planos concluídos
}

function getLevelRules(nivel: string): { series: string; reps: string; descanso: string } {
  if (nivel.startsWith('adaptacao'))    return { series: '2',   reps: '12–15', descanso: '60–90s entre séries' }
  if (nivel.startsWith('iniciante'))    return { series: '3',   reps: '10–15', descanso: '60–90s entre séries' }
  if (nivel.startsWith('intermediario'))return { series: '3–4', reps: '8–12',  descanso: '60–90s entre séries' }
  if (nivel.startsWith('avancado'))     return { series: '4',   reps: '6–12',  descanso: '90–120s entre séries' }
  /* atleta */                          return { series: '4–5', reps: '6–12',  descanso: '90–120s entre séries' }
}

// Rotação de grupos musculares por preferência de treino
function buildRotacao(preferencia: string, totalDias: number): string {
  const rotacoes: Record<string, string[]> = {
    grupos_musculares: [
      'Peito + Tríceps (empurrar)',
      'Costas + Bíceps (puxar)',
      'Quadríceps + Posterior + Glúteos (pernas)',
      'Ombros + Core',
      'Full Body — melhor dos 4 dias anteriores',
    ],
    superior_inferior: [
      'Superior A — Peito + Costas',
      'Inferior A — Quadríceps + Posterior',
      'Superior B — Ombros + Braços',
      'Inferior B — Glúteos + Panturrilha + Core',
      'Full Body metabólico',
    ],
    isolados: [
      'Peito (foco isolado)',
      'Costas (foco isolado)',
      'Pernas — Quad + Posterior + Glúteos',
      'Ombros + Braços (Bíceps + Tríceps)',
      'Core + Mobilidade + Cardio',
    ],
  }

  const base = rotacoes[preferencia] ?? rotacoes.grupos_musculares
  return base.slice(0, totalDias).map((g, i) => `  - Treino ${i + 1}: ${g}`).join('\n')
}

export function buildPlanPrompt(ctx: PlanContext, exerciseCatalog?: string): string {
  const levelLabel = LEVEL_CONFIG[ctx.nivel].label
  const isHotel = ctx.local_treino === 'hotel'
  const totalDias = Math.min(5, Math.max(3, ctx.dias_por_semana))

  const objetivoDescricao: Record<string, string> = {
    perda_peso: 'perda de gordura — cardio aeróbico no Bloco 3, descansos curtos',
    ganho_massa: 'ganho de massa — circuito metabólico no Bloco 3, tensão mecânica',
    qualidade_vida: 'qualidade de vida — equilíbrio força e mobilidade',
  }

  const preferenciaLabel: Record<string, string> = {
    isolados: 'isolado (1 grupo por sessão)',
    grupos_musculares: 'grupos musculares (push/pull/legs)',
    superior_inferior: 'divisão superior/inferior',
  }

  // Objetivos e bloco 3
  const objetivos = ctx.objetivo.split(',').map((o) => o.trim())
  const usaCardio = objetivos.some((o) => o === 'perda_peso' || o === 'qualidade_vida')

  const modoSilencioso = isHotel
    ? `\nMODO SILENCIOSO (hotel): Proibido saltos, burpees, box jumps, impacto. Use halteres, cabos, isométricos.`
    : ''

  const biTriSetNote = ''  // Bi-sets/tri-sets desabilitados — exercícios agrupados por músculo

  // Catálogo resumido: só nomes agrupados por músculo (sem instruções)
  const catalogSection = exerciseCatalog ? `EXERCÍCIOS DISPONÍVEIS (use APENAS estes nomes exatos):\n${exerciseCatalog}\n` : ''

  const historicoSection = ctx.historico_semanas?.length
    ? `HISTÓRICO (últimas semanas — varie metodologia, grupos musculares e nome do plano):\n${ctx.historico_semanas.map((n, i) => `  - ${i + 1} semana(s) atrás: "${n}"`).join('\n')}\n\n`
    : ''

  const bloco3Key = usaCardio ? '"cardio"' : '"circuito"'
  const levelRules = getLevelRules(ctx.nivel)

  // Template de exercício sem instrucoes (não é necessário no preview do plano)
  const exTemplate = `{ "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number }`
  const exForcaTemplate = `{ "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number, "biset": false, "triset": false }`

  return `${catalogSection}${historicoSection}Gere um plano semanal de ${totalDias} treinos. Responda APENAS com JSON válido. Sem texto extra.${modoSilencioso}

PERFIL: Nível ${ctx.nivel} (${levelLabel}) | Objetivo: ${ctx.objetivo.split(',').map((o) => objetivoDescricao[o.trim()] ?? o.trim()).join(' + ')} | Preferência: ${preferenciaLabel[ctx.preferencia_treino] ?? ctx.preferencia_treino}
Restrições: ${ctx.lesao_cronica && ctx.lesao_descricao ? ctx.lesao_descricao : 'Nenhuma'} | Cardíaco: ${ctx.doenca_cardiaca ? 'Sim' : 'Não'}
Local: ${isHotel ? 'Hotel' : 'Academia de condomínio'} | Equipamentos: ${ctx.equipamentos.length ? ctx.equipamentos.join(', ') : 'Peso corporal'}

ROTAÇÃO (não repita grupo principal em dias consecutivos):
${buildRotacao(ctx.preferencia_treino, totalDias)}

REGRAS:
- Blocos: preparacao → forca → ${usaCardio ? 'cardio' : 'circuito'} → finisher
- Séries bloco forca: ${levelRules.series} | Reps: ${levelRules.reps} | Descanso: ${levelRules.descanso}
- Treinos ${Math.ceil(totalDias / 2) + 1}–${totalDias}: +1 série (sobrecarga progressiva)
- Agrupe exercícios pelo mesmo músculo no bloco forca. biset e triset sempre false.

JSON EXATO:
{
  "nome_plano": "string",
  "treinos": [
    ${Array.from({ length: totalDias }, () => `{ "nome": string, "duracao_estimada": number, "preparacao": [${exTemplate}], "forca": [${exForcaTemplate}], ${bloco3Key}: [${exTemplate}], "finisher": [${exTemplate}] }`).join(',\n    ')}
  ]
}`
}
