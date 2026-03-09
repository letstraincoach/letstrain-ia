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

  const biTriSetNote = ctx.nivel.startsWith('avancado')
    ? `\nBI-SETS: organize o Bloco 2 em pares antagonistas ("biset":true no 1º, descanso_segundos:0; "biset":false no 2º com 60-90s).`
    : ctx.nivel.startsWith('atleta')
    ? `\nTRI-SETS: organize o Bloco 2 em trios ("triset":true nos 2 primeiros, descanso_segundos:0; "triset":false no 3º com 90-120s).`
    : ''

  const catalogSection = exerciseCatalog ? `${exerciseCatalog}\n` : ''

  // Template JSON do treino individual (repetido N vezes)
  const bloco3Key = usaCardio ? '"cardio"' : '"circuito"'
  const workoutTemplate = `{ "nome": string, "duracao_estimada": number, "preparacao": [...], "forca": [...], ${bloco3Key}: [...], "finisher": [...] }`

  return `${catalogSection}Você é um especialista em periodização da Lets Train. Gere um plano semanal de ${totalDias} treinos completos.
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
- Séries no Bloco 2: ${ctx.nivel.startsWith('adaptacao') ? '2' : ctx.nivel.startsWith('iniciante') ? '3' : '3–4'}
- Repetições: ${ctx.nivel.startsWith('adaptacao') ? '12–15' : '8–12'}
- instrucoes: escreva como personal trainer, imperativo, 1–2 frases corridas (SEM listas, SEM hífens)${biTriSetNote}

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
