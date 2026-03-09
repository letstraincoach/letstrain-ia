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

// Classifica a academia com base nos equipamentos detectados
function classificarAcademia(equipamentos: string[]): string {
  const eq = equipamentos.map((e) => e.toLowerCase())
  const temCardio = eq.some((e) => ['esteira', 'bicicleta', 'eliptico', 'remo'].some((c) => e.includes(c)))
  const temPolia = eq.some((e) => ['crossover', 'polia', 'cabo', 'pulley'].some((c) => e.includes(c)))
  const temMulti = eq.some((e) => ['multiestacao', 'multi', 'leg press', 'extensora', 'flexora'].some((c) => e.includes(c)))
  const temFuncional = eq.some((e) => ['kettlebell', 'trx', 'medicine ball', 'elástico', 'miniband'].some((c) => e.includes(c)))
  const temHalteres = eq.some((e) => e.includes('halter') || e.includes('anilha'))

  const score = [temCardio, temPolia, temMulti, temFuncional, temHalteres].filter(Boolean).length
  if (score >= 4) return 'completa'
  if (score >= 2) return 'híbrida compacta'
  return 'compacta (peso livre / corporal)'
}

export function buildWorkoutPrompt(ctx: WorkoutContext, exerciseCatalog?: string): string {
  const levelLabel = LEVEL_CONFIG[ctx.nivel].label
  const isHotel = ctx.local_treino === 'hotel'
  const academiaClasse = classificarAcademia(ctx.equipamentos)

  const intensidade =
    ctx.disposicao <= 4
      ? `BAIXA (${ctx.disposicao}/10) — reduza volume e intensidade, priorize bem-estar`
      : ctx.disposicao >= 8
        ? `ALTA (${ctx.disposicao}/10) — intensidade máxima do nível, desafie o usuário`
        : `MODERADA (${ctx.disposicao}/10) — intensidade normal do nível`

  const objetivoDescricao: Record<string, string> = {
    perda_peso: 'perda de gordura — priorize compostos + metabólico, descansos curtos',
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

  // Bloco 3: cardio (emagrecimento/qualidade_vida) ou circuito (hipertrofia)
  const objetivos = ctx.objetivo.split(',').map((o) => o.trim())
  const usaCardio = objetivos.some((o) => o === 'perda_peso' || o === 'qualidade_vida')

  // Volumes baseados no tempo disponível
  const temMinutos = ctx.tempo_disponivel
  const blocos = {
    preparacaoExs: 3,
    forcaExs: temMinutos <= 30 ? 3 : temMinutos <= 45 ? 4 : 5,
    bloco3Exs: temMinutos <= 30 ? 2 : 3,
    finisherExs: ctx.disposicao <= 4 ? 1 : 2,
  }

  // Modo silencioso para hotel
  const modoSilencioso = isHotel
    ? `\nMODO SILENCIOSO ATIVO (academia de hotel):
Evite OBRIGATORIAMENTE: saltos, burpees, box jumps, corda naval, medicine ball slams, jumping jacks, qualquer exercício de impacto.
Prefira: halteres, polia, cabos, exercícios controlados e isométricos.
Circuito metabólico sem impacto: mountain climber (lento), kettelbell swing (se disponível), agachamento controlado, remada.`
    : ''

  const catalogSection = exerciseCatalog ? `${exerciseCatalog}\n` : ''

  // Bloco 3: cardio ou circuito — instruções para o prompt e template JSON
  const bloco3Prompt = usaCardio
    ? `BLOCO 3 — CARDIO (${Math.round(temMinutos * 0.25)} min): ${blocos.bloco3Exs} exercício(s)
Objetivo: condicionamento aeróbico e aceleração do metabolismo.
${ctx.doenca_cardiaca ? 'ATENÇÃO — condição cardíaca: cardio LEVE apenas, frequência moderada, sem alta intensidade.' : ''}
Se há esteira, bicicleta ergométrica ou elíptico disponível:
  - 1 exercício de 12–20 min em intensidade moderada (ex: "Corrida na Esteira", "Bike Ergométrica", "Elíptico").
  - repeticoes: tempo em minutos (ex: "15 min"), series: 1, descanso_segundos: 0.
Se NÃO há equipamento de cardio:
  - ${blocos.bloco3Exs} exercícios aeróbicos sem impacto${isHotel ? ' (MODO SILENCIOSO: sem saltos)' : ''}: mountain climber, agachamento contínuo, polichinelo lento, corda de pular (se disponível).
  - Formato: 3–4 rounds de 40s de trabalho / 20s de descanso.`
    : `BLOCO 3 — CIRCUITO METABÓLICO (${Math.round(temMinutos * 0.25)} min): ${blocos.bloco3Exs} exercícios em circuito
Objetivo: elevação de FC e queima metabólica com foco em hipertrofia.
Formato: circuito sem descanso entre exercícios (descanso_segundos: 0 em todos), descanse 60–90s entre rounds.
Inclua: 1 de membros inferiores + 1 de membros superiores + 1 de core.
${isHotel ? 'Sem impacto: use mountain climber lento, agachamento, remada halteres, prancha com variação.' : 'Exercícios como kettlebell swing, mountain climber, lunge walk, russian twist, burpee (se adequado ao nível).'}`

  const bloco3JsonKey = usaCardio ? '"cardio"' : '"circuito"'

  return `${catalogSection}Você é um personal trainer da academia Lets Train, especialista na metodologia Time Efficient.
Gere um treino completo em 4 blocos para ${temMinutos} minutos. Responda APENAS com JSON válido. Sem texto extra.
${modoSilencioso}
PERFIL DO ALUNO:
Nível: ${ctx.nivel} (${levelLabel})
Objetivo: ${ctx.objetivo.split(',').map((o) => objetivoDescricao[o.trim()] ?? o.trim()).join(' + ')}
Preferência de treino: ${preferenciaDescricao[ctx.preferencia_treino] ?? ctx.preferencia_treino}
Restrições/Lesões: ${ctx.lesao_cronica && ctx.lesao_descricao ? ctx.lesao_descricao : 'Nenhuma'}
Condição cardíaca: ${ctx.doenca_cardiaca ? 'Sim — treino leve, exercícios seguros, sem alta intensidade' : 'Não'}

CONTEXTO DE HOJE:
Local: ${isHotel ? 'Academia de hotel (equipamentos limitados, similar ao condomínio)' : 'Academia de condomínio'}
Classificação da academia: ${academiaClasse}
Equipamentos disponíveis: ${ctx.equipamentos.length ? ctx.equipamentos.join(', ') : 'Apenas peso corporal'}
Última refeição: ${ctx.ultima_refeicao}
Tempo disponível: ${temMinutos} minutos
Disposição: ${intensidade}

HISTÓRICO RECENTE (evite repetir os mesmos exercícios principais):
${historicoTexto}

METODOLOGIA LETS TRAIN — ESTRUTURA DE 4 BLOCOS OBRIGATÓRIA:

BLOCO 1 — PREPARAÇÃO (3–5 min): ${blocos.preparacaoExs} exercícios
Objetivo: mobilidade articular + ativação muscular + cardio leve.
Inclua: 1–2 de mobilidade, 1 de ativação (glúteo, core ou escápulas), 1 cardio leve (caminhada na esteira, bike leve, polichinelo lento) se disponível.
Séries: 1 série. Repetições/tempo: 30–60 segundos ou 10–15 reps leves.

BLOCO 2 — FORÇA (${Math.round(temMinutos * 0.40)} min): ${blocos.forcaExs} exercícios
Objetivo: força guiada ou funcional com base nos equipamentos disponíveis.
Se há máquinas/polia → priorize exercícios guiados (leg press, chest press, puxada, remada baixa).
Se apenas peso livre/corporal → exercícios compostos (goblet squat, supino halteres, remada halteres).
Séries: ${ctx.nivel.startsWith('adaptacao') ? '2' : ctx.nivel.startsWith('iniciante') ? '3' : '3–4'}.
Repetições: ${ctx.nivel.startsWith('adaptacao') ? '12–15' : '8–12'} (foco em técnica antes de carga).
Padrões obrigatórios: inclua pelo menos um empurrar + um puxar no bloco.
${ctx.nivel.startsWith('avancado') ? `
BI-SETS OBRIGATÓRIOS (nível avançado):
Organize o Bloco 2 inteiramente em pares de bi-set — 2 exercícios executados em sequência sem descanso entre si.
Regras do bi-set no JSON:
- 1º exercício do par → "biset": true, "descanso_segundos": 0
- 2º exercício do par → "biset": false (ou omita), descanso normal 60–90s após o par completo
- Use 2 a 3 pares (4–6 exercícios totais no bloco 2)
- Priorize pares antagonistas: peito+costas, bíceps+tríceps, quadríceps+posterior
- Exemplos: Supino c/ Halteres + Remada Unilateral · Desenvolvimento + Remada Alta · Agachamento + Stiff · Rosca Direta + Tríceps Coice` : ''}
${ctx.nivel.startsWith('atleta') ? `
TRI-SETS OBRIGATÓRIOS (nível atleta):
Organize o Bloco 2 inteiramente em trios de tri-set — 3 exercícios executados em sequência sem descanso entre si.
Regras do tri-set no JSON:
- 1º exercício do trio → "triset": true, "descanso_segundos": 0
- 2º exercício do trio → "triset": true, "descanso_segundos": 0
- 3º exercício do trio → "triset": false (ou omita), descanso 90–120s após o trio completo
- Use 2 trios (6 exercícios totais no bloco 2)
- Combine 3 padrões diferentes por trio: empurrar + puxar + pernas OU peito + costas + ombros OU quadríceps + posterior + core
- Exemplos de trios: Supino + Remada + Desenvolvimento · Agachamento + Stiff + Avanço · Rosca + Tríceps + Elevação Lateral
- Intensidade máxima: repetições 8–12 com carga alta, técnica rigorosa mesmo sob fadiga acumulada` : ''}

${bloco3Prompt}

BLOCO 4 — FINISHER (3–5 min): ${blocos.finisherExs} exercício(s)
Objetivo: estímulo final curto e intenso.
${ctx.disposicao <= 4 ? 'Disposição baixa: finisher suave — 1 exercício isométrico ou de respiração (prancha ou deep breathing).' : 'HIIT ou isométrico intenso. Exemplos: prancha máxima, tabata 20s on/10s off, corrida na esteira 1 min.'}
${isHotel ? 'Sem impacto: use isométricos ou exercícios controlados.' : ''}
Séries: 1–2. Tempo ou reps: conforme o exercício.

REGRAS GERAIS:
Use SOMENTE os equipamentos listados acima.
Distribuição de grupos musculares conforme preferência de treino do aluno.
Adaptação: técnica acima de tudo — para nível adaptacao/iniciante, reduza carga e aumente repetições.

REGRA CRÍTICA PARA O CAMPO "instrucoes":
Escreva como personal trainer falando diretamente ao aluno, no imperativo, em 2–3 frases corridas e naturais.
NUNCA use traços, hífens, listas ou bullet points nas instruções.
Exemplo correto: "Posicione os pés na largura dos ombros com os dedos levemente abertos. Desça controlando até as coxas ficarem paralelas ao chão, mantendo o peito erguido. Suba expirando, contraindo o glúteo no topo."

Responda EXATAMENTE neste JSON (sem campos extras, sem texto antes ou depois):
{
  "nome": "string (nome criativo e motivacional para o treino)",
  "duracao_estimada": number,
  "preparacao": [
    { "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number, "instrucoes": string }
  ],
  "forca": [
    { "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number, "instrucoes": string, "biset": boolean, "triset": boolean }
  ],
  ${bloco3JsonKey}: [
    { "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number, "instrucoes": string }
  ],
  "finisher": [
    { "nome": string, "grupo_muscular": [string], "series": number, "repeticoes": string, "descanso_segundos": number, "instrucoes": string }
  ]
}`
}
