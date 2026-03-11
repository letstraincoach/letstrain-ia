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

  const catalogSection = exerciseCatalog ? `${exerciseCatalog}\n` : ''

  const historicoSection = ctx.historico_semanas?.length
    ? `HISTÓRICO (últimas semanas — varie metodologia, grupos musculares e nome do plano):\n${ctx.historico_semanas.map((n, i) => `  - ${i + 1} semana(s) atrás: "${n}"`).join('\n')}\n\n`
    : ''

  // Template JSON do treino individual (repetido N vezes)
  const bloco3Key = usaCardio ? '"cardio"' : '"circuito"'
  const workoutTemplate = `{ "nome": string, "duracao_estimada": number, "preparacao": [...], "forca": [...], ${bloco3Key}: [...], "finisher": [...] }`

  const levelRules = getLevelRules(ctx.nivel)

  return `${catalogSection}${historicoSection}Você é um especialista em periodização da Lets Train. Gere um plano semanal de ${totalDias} treinos completos.
Responda APENAS com JSON válido. Sem texto extra.${modoSilencioso}
PERFIL:
Nível: ${ctx.nivel} (${levelLabel})
Objetivo: ${ctx.objetivo.split(',').map((o) => objetivoDescricao[o.trim()] ?? o.trim()).join(' + ')}
Preferência: ${preferenciaLabel[ctx.preferencia_treino] ?? ctx.preferencia_treino}
Restrições: ${ctx.lesao_cronica && ctx.lesao_descricao ? ctx.lesao_descricao : 'Nenhuma'}
Condição cardíaca: ${ctx.doenca_cardiaca ? 'Sim — intensidade leve, sem alta intensidade' : 'Não'}

AMBIENTE:
Local: ${isHotel ? 'Hotel (equipamentos limitados)' : 'Academia de condomínio'}
Equipamentos: ${ctx.equipamentos.length ? ctx.equipamentos.join(', ') : 'Apenas peso corporal'}

ROTAÇÃO DE GRUPOS MUSCULARES (obrigatória — não repita o grupo principal em treinos consecutivos):
${buildRotacao(ctx.preferencia_treino, totalDias)}

REGRAS DE PERIODIZAÇÃO:
- Treinos ${Math.ceil(totalDias / 2) + 1}–${totalDias} devem ter 1 série a mais que os treinos 1–${Math.ceil(totalDias / 2)} (sobrecarga progressiva)
- Cada treino segue a estrutura de 4 blocos: preparacao → forca → ${usaCardio ? 'cardio' : 'circuito'} → finisher
- Séries no Bloco 2: ${levelRules.series}
- Repetições por série: ${levelRules.reps}
- Descanso entre séries: ${levelRules.descanso}
- instrucoes: escreva como personal trainer, imperativo, 1–2 frases corridas (SEM listas, SEM hífens)
- AGRUPAMENTO OBRIGATÓRIO: No Bloco 2 (forca), agrupe SEMPRE os exercícios pelo mesmo grupo muscular principal. NUNCA intercale grupos diferentes. Exemplo correto: Supino, Crucifixo, Remada, Puxada. Exemplo ERRADO: Supino, Remada, Crucifixo, Puxada. Todos os "biset" e "triset" devem ser false.

MAPEAMENTO EQUIPAMENTO → EXERCÍCIO:
- Leg Press → Leg Press 45° | Extensora → Cadeira Extensora | Flexora → Cadeira Flexora
- Supino Máquina → Supino na Máquina | Voador → Voador/Pec Deck | Remada Máquina → Remada no Aparelho
- Pulldown/Polia/Cross Over → Puxada na Polia, Remada Baixa na Polia, Tríceps Corda, Face Pull, Crucifixo no Cabo
- Halter/Kettlebell → Supino Reto, Remada Curvada, Remada Unilateral, Desenvolvimento, Agachamento Goblet, Stiff
- Peso corporal → Flexão, Agachamento Livre, Avanço, Dips, Prancha, Glúteo Solo

Responda EXATAMENTE neste JSON:
{
  "nome_plano": "string (nome motivacional para a semana, ex: 'Semana Força Total')",
  "treinos": [
    ${Array.from({ length: totalDias }, (_, i) => `{ "nome": string, "duracao_estimada": number, "preparacao": [{ "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number, "instrucoes": string }], "forca": [{ "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number, "instrucoes": string, "biset": boolean, "triset": boolean }], ${bloco3Key}: [{ "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number, "instrucoes": string }], "finisher": [{ "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number, "instrucoes": string }] }`).join(',\n    ')}
  ]
}`
}
