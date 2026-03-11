import { createClient } from '@/lib/supabase/server'
import { buildWorkoutPrompt } from '@/lib/ai/workout-generator'
import { fetchExerciseCatalog, formatCatalogForPrompt } from '@/lib/ai/exercise-catalog'
import { WorkoutSchema, type GeneratedWorkout } from '@/lib/ai/workout-schemas'
import { computeFeedbackSummary, formatFeedbackForPrompt } from '@/lib/training/feedback-summary'
import { NextResponse } from 'next/server'
import type { Json } from '@/types/database.types'

export const maxDuration = 60

interface CheckinPayload {
  local_treino?: string
  ultima_refeicao: string
  tempo_disponivel: number
  disposicao: number
  equipamentos_hotel?: string[]
}

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Anthropic HTTP ${res.status}: ${body}`)
  }

  const data = await res.json() as { content: { type: string; text: string }[] }
  return data.content[0]?.type === 'text' ? data.content[0].text : ''
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'DEBUG: ANTHROPIC_API_KEY não configurada no Vercel' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let checkin: CheckinPayload
  try {
    checkin = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  // ── Paywall: 3 treinos gratuitos ─────────────────────────────────────────
  const [paywallSubResult, paywallProgressResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'ativa')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('user_progress')
      .select('treinos_totais')
      .eq('id', user.id)
      .single(),
  ])

  const temAssinatura = !!paywallSubResult.data
  const treinosUsados = paywallProgressResult.data?.treinos_totais ?? 0

  if (!temAssinatura && treinosUsados >= 3) {
    return NextResponse.json(
      { paywall: true, error: 'Seus 3 treinos gratuitos foram usados. Assine para continuar treinando!' },
      { status: 402 }
    )
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ── Trava: 1 treino por dia (data em horário de Brasília UTC-3) ──────────
  const hoje = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: treinoHoje } = await supabase
    .from('workouts')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('data', hoje)
    .in('status', ['executado', 'gerado'])
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (treinoHoje?.status === 'executado') {
    return NextResponse.json(
      { error: 'Você já concluiu um treino hoje. Descanse e volte amanhã! 💪', workout_id: treinoHoje.id },
      { status: 409 }
    )
  }

  if (treinoHoje?.status === 'gerado') {
    return NextResponse.json({ workout_id: treinoHoje.id })
  }
  // ─────────────────────────────────────────────────────────────────────────

  const [profileResult, equipamentosResult, historicoResult, feedbackResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('nivel_atual, objetivo, preferencia_treino, lesao_cronica, lesao_descricao, doenca_cardiaca, local_treino')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_equipment')
      .select('nome_custom')
      .eq('user_id', user.id),
    supabase
      .from('workouts')
      .select('exercicios')
      .eq('user_id', user.id)
      .eq('status', 'executado')
      .order('criado_em', { ascending: false })
      .limit(3),
    supabase
      .from('workout_evaluations')
      .select('rating, feedback_rapido')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(5),
  ])

  if (profileResult.error || !profileResult.data) {
    return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 })
  }

  const profile = profileResult.data

  const equipamentos: string[] =
    checkin.local_treino === 'hotel' && checkin.equipamentos_hotel?.length
      ? checkin.equipamentos_hotel
      : (equipamentosResult.data ?? []).map((e) => e.nome_custom ?? '').filter(Boolean)

  const historico = (historicoResult.data ?? []).map((w) => {
    const ex = w.exercicios as {
      forca?: { nome: string }[]
      cardio?: { nome: string }[]
      circuito?: { nome: string }[]
      principal?: { nome: string }[]
    }
    const principais = [
      ...(ex?.forca ?? []),
      ...(ex?.cardio ?? []),
      ...(ex?.circuito ?? []),
      ...(ex?.principal ?? []),
    ].map((e) => e.nome)
    return { exercicios_principais: principais }
  })

  const localTreino = (checkin.local_treino ?? profile.local_treino ?? 'condominio') as string
  const nivelAtual = (profile.nivel_atual ?? 'adaptacao') as string

  const context = {
    nivel: nivelAtual as Parameters<typeof buildWorkoutPrompt>[0]['nivel'],
    objetivo: profile.objetivo ?? 'qualidade_vida',
    preferencia_treino: profile.preferencia_treino ?? 'grupos_musculares',
    lesao_cronica: profile.lesao_cronica ?? false,
    lesao_descricao: profile.lesao_descricao,
    doenca_cardiaca: profile.doenca_cardiaca ?? false,
    local_treino: localTreino as Parameters<typeof buildWorkoutPrompt>[0]['local_treino'],
    equipamentos,
    ultima_refeicao: checkin.ultima_refeicao,
    tempo_disponivel: checkin.tempo_disponivel,
    disposicao: checkin.disposicao,
    historico_recente: historico,
  }

  const catalogExercises = await fetchExerciseCatalog(localTreino, nivelAtual)
  const exerciseCatalog = formatCatalogForPrompt(catalogExercises)
  const feedbackSummary = computeFeedbackSummary(feedbackResult.data ?? [])
  const feedbackText = formatFeedbackForPrompt(feedbackSummary)
  const prompt = buildWorkoutPrompt(context, exerciseCatalog, feedbackText)

  // Chamar Claude via fetch direto (sem SDK) com retry
  let generatedWorkout: GeneratedWorkout | null = null
  let lastError: unknown = null

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const rawText = await callClaude(prompt, apiKey)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Resposta sem JSON')
      const parsed = JSON.parse(jsonMatch[0])
      generatedWorkout = WorkoutSchema.parse(parsed)
      break
    } catch (err) {
      lastError = err
      if (attempt === 2) break
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  if (!generatedWorkout) {
    console.error('[workout/generate] Falha após 2 tentativas:', lastError)
    return NextResponse.json(
      { error: 'Não foi possível gerar o treino. Tente novamente.' },
      { status: 503 }
    )
  }

  const { data: savedWorkout, error: saveError } = await supabase
    .from('workouts')
    .insert([{
      user_id: user.id,
      data: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().split('T')[0],
      nivel: profile.nivel_atual,
      local_treino: checkin.local_treino ?? profile.local_treino ?? 'condominio',
      duracao_estimada: generatedWorkout.duracao_estimada,
      checkin_ultima_refeicao: checkin.ultima_refeicao,
      checkin_tempo_disponivel: checkin.tempo_disponivel,
      checkin_disposicao: checkin.disposicao,
      exercicios: generatedWorkout as unknown as Json,
      status: 'gerado',
    }])
    .select('id')
    .single()

  if (saveError || !savedWorkout) {
    console.error('[workout/generate] Erro ao salvar treino:', saveError)
    return NextResponse.json(
      { error: 'Treino gerado mas não foi possível salvar. Tente novamente.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    workout_id: savedWorkout.id,
    workout: generatedWorkout,
  })
}
