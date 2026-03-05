import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel, TrainingLocation } from '@/types/database.types'

export interface WorkoutContext {
  // Perfil
  nivel: TrainingLevel
  objetivo: string
  preferencia_treino: string
  lesao_cronica: boolean
  lesao_descricao?: string | null
  doenca_cardiaca: boolean
  // Ambiente
  local_treino: TrainingLocation
  equipamentos: string[]
  // Check-in do dia
  ultima_refeicao: string
  tempo_disponivel: number  // minutos
  disposicao: number        // 1–10
  // Histórico
  historico_recente: { exercicios_principais: string[] }[]
}

export function buildWorkoutPrompt(ctx: WorkoutContext): string {
  const levelLabel = LEVEL_CONFIG[ctx.nivel].label

  const intensidade =
    ctx.disposicao <= 4
      ? `BAIXA (${ctx.disposicao}/10) — reduza volume e intensidade, priorize bem-estar`
      : ctx.disposicao >= 8
        ? `ALTA (${ctx.disposicao}/10) — intensidade máxima do nível, desafie o usuário`
        : `MODERADA (${ctx.disposicao}/10) — intensidade normal do nível`

  const objetivoDescricao: Record<string, string> = {
    perda_peso: 'perda de gordura — priorize compostos + cardio metabólico, descansos curtos',
    ganho_massa: 'ganho de massa muscular — volume moderado-alto, foco em tensão mecânica',
    qualidade_vida: 'qualidade de vida — equilibre força e mobilidade, intensidade confortável',
  }

  const preferenciaDescricao: Record<string, string> = {
    isolados: 'treino isolado (um grupo muscular principal por sessão)',
    grupos_musculares: 'grupos musculares (ex: push/pull/legs — 2 grupos por sessão)',
    superior_inferior: 'divisão superior/inferior do corpo',
  }

  const historicoTexto =
    ctx.historico_recente.length
      ? ctx.historico_recente
          .map((t, i) => `  - Treino ${i + 1}: ${t.exercicios_principais.join(', ')}`)
          .join('\n')
      : '  - Sem histórico recente (primeiro treino)'

  return `Você é um personal trainer especialista na metodologia Time Efficient da Lets Train.
Gere um treino para ${ctx.tempo_disponivel} minutos, objetivo e cientificamente embasado.
Responda APENAS com JSON válido no schema especificado abaixo. Sem texto extra.

PERFIL DO USUÁRIO:
- Nível: ${ctx.nivel} (${levelLabel})
- Objetivo: ${ctx.objetivo.split(',').map((o) => objetivoDescricao[o.trim()] ?? o.trim()).join(' + ')}
- Preferência de treino: ${preferenciaDescricao[ctx.preferencia_treino] ?? ctx.preferencia_treino}
- Restrições/Lesões: ${ctx.lesao_cronica && ctx.lesao_descricao ? ctx.lesao_descricao : 'Nenhuma'}
- Doença cardíaca: ${ctx.doenca_cardiaca ? 'Sim — treino leve, exercícios seguros, sem alta intensidade' : 'Não'}

CONTEXTO DE HOJE:
- Local: ${ctx.local_treino === 'academia' ? 'Academia convencional' : ctx.local_treino === 'hotel' ? 'Academia de hotel (recursos limitados, similar a condomínio)' : 'Academia de condomínio'}
- Equipamentos disponíveis: ${ctx.equipamentos.length ? ctx.equipamentos.join(', ') : 'Apenas peso corporal'}
- Última refeição: ${ctx.ultima_refeicao}
- Tempo disponível: ${ctx.tempo_disponivel} minutos
- Disposição: ${intensidade}

HISTÓRICO RECENTE (evite repetir os mesmos exercícios principais):
${historicoTexto}

DIRETRIZES METODOLOGIA LETS TRAIN — TIME EFFICIENT:
- Priorize movimentos compostos multiarticulares
- Adaptação: técnica acima de tudo, 40% da capacidade máxima, foco em ativação
- Iniciante: 60% de intensidade, padrões de movimento corretos
- Intermediário: 75%, adicione variações e complexidade
- Use SOMENTE os equipamentos listados acima
- Aquecimento: 2–4 exercícios leves de ativação
- Bloco principal: ${ctx.disposicao <= 4 ? '3–5' : ctx.disposicao >= 8 ? '6–10' : '4–8'} exercícios
- Cooldown: 2–3 alongamentos ou exercícios de mobilidade
- Sugira youtube_url reais para demonstração de técnica (use URLs no formato https://www.youtube.com/watch?v=XXXX)

Responda EXATAMENTE neste JSON (sem campos extras, sem texto antes ou depois):
{
  "nome": "string (nome criativo e motivacional para o treino)",
  "duracao_estimada": number,
  "aquecimento": [
    { "nome": string, "series": number, "repeticoes": string, "descanso_segundos": number, "youtube_url": string }
  ],
  "principal": [
    { "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number, "youtube_url": string, "instrucoes": string }
  ],
  "cooldown": [
    { "nome": string, "series": number, "repeticoes": string, "descanso_segundos": number }
  ]
}`
}
