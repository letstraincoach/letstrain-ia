import { createClient } from '@/lib/supabase/server'
import { buildPlanPrompt, PlanSchema, type GeneratedPlan } from '@/lib/ai/plan-generator'
import { fetchExerciseCatalog, formatCatalogForPrompt } from '@/lib/ai/exercise-catalog'
import { NextResponse } from 'next/server'
import type { Json } from '@/types/database.types'

export const maxDuration = 120

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
      max_tokens: 8192,
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

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // ── Paywall ───────────────────────────────────────────────────────────────
  const [subResult, progressResult] = await Promise.all([
    supabase.from('subscriptions').select('id').eq('user_id', user.id).eq('status', 'ativa').limit(1).maybeSingle(),
    supabase.from('user_progress').select('treinos_totais').eq('id', user.id).single(),
  ])

  const temAssinatura = !!subResult.data
  const treinosUsados = progressResult.data?.treinos_totais ?? 0

  if (!temAssinatura && treinosUsados >= 3) {
    return NextResponse.json(
      { paywall: true, error: 'Seus 3 treinos gratuitos foram usados. Assine para continuar!' },
      { status: 402 }
    )
  }

  // ── Verificar se já tem plano ativo ──────────────────────────────────────
  const hoje = new Date().toISOString().split('T')[0]
  const { data: planoAtivo } = await supabase
    .from('training_plans')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'ativo')
    .gte('valido_ate', hoje)
    .limit(1)
    .maybeSingle()

  if (planoAtivo) {
    return NextResponse.json({ plan_id: planoAtivo.id, already_exists: true })
  }

  // ── Dados do usuário ──────────────────────────────────────────────────────
  const [profileResult, equipamentosResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('nivel_atual, objetivo, preferencia_treino, lesao_cronica, lesao_descricao, doenca_cardiaca, local_treino, dias_por_semana')
      .eq('id', user.id)
      .single(),
    supabase.from('user_equipment').select('nome_custom').eq('user_id', user.id),
  ])

  if (!profileResult.data) {
    return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 })
  }

  const profile = profileResult.data
  const equipamentos = (equipamentosResult.data ?? []).map((e) => e.nome_custom ?? '').filter(Boolean)
  const nivelAtual = profile.nivel_atual ?? 'adaptacao'
  const localTreino = profile.local_treino ?? 'condominio'
  const diasPorSemana = Math.min(5, Math.max(3, profile.dias_por_semana ?? 3))

  // ── Catálogo de exercícios ────────────────────────────────────────────────
  const catalogExercises = await fetchExerciseCatalog(localTreino, nivelAtual)
  const exerciseCatalog = formatCatalogForPrompt(catalogExercises)

  const ctx = {
    nivel: nivelAtual as Parameters<typeof buildPlanPrompt>[0]['nivel'],
    objetivo: profile.objetivo ?? 'qualidade_vida',
    preferencia_treino: profile.preferencia_treino ?? 'grupos_musculares',
    lesao_cronica: profile.lesao_cronica ?? false,
    lesao_descricao: profile.lesao_descricao,
    doenca_cardiaca: profile.doenca_cardiaca ?? false,
    local_treino: localTreino as Parameters<typeof buildPlanPrompt>[0]['local_treino'],
    equipamentos,
    dias_por_semana: diasPorSemana,
  }

  const prompt = buildPlanPrompt(ctx, exerciseCatalog)

  // ── Chamar Claude com retry ───────────────────────────────────────────────
  let generatedPlan: GeneratedPlan | null = null
  let lastError: unknown = null

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const rawText = await callClaude(prompt, apiKey)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Resposta sem JSON')
      const parsed = JSON.parse(jsonMatch[0])
      generatedPlan = PlanSchema.parse(parsed)
      break
    } catch (err) {
      lastError = err
      if (attempt === 2) break
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  if (!generatedPlan) {
    console.error('[training-plan/generate] Falha após 2 tentativas:', lastError)
    return NextResponse.json({ error: 'Não foi possível gerar o plano. Tente novamente.' }, { status: 503 })
  }

  // ── Salvar plano no banco ─────────────────────────────────────────────────
  const validadeDias = diasPorSemana + 5
  const validadeDate = new Date(Date.now() + validadeDias * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const { data: savedPlan, error: planError } = await supabase
    .from('training_plans')
    .insert({
      user_id: user.id,
      nome_plano: generatedPlan.nome_plano,
      nivel: nivelAtual,
      objetivo: profile.objetivo ?? 'qualidade_vida',
      local_treino: localTreino,
      equipamentos,
      total_dias: generatedPlan.treinos.length,
      valido_ate: validadeDate,
    })
    .select('id')
    .single()

  if (planError || !savedPlan) {
    console.error('[training-plan/generate] Erro ao salvar plano:', planError)
    return NextResponse.json({ error: 'Plano gerado mas não foi possível salvar.' }, { status: 500 })
  }

  const planWorkoutsRows = generatedPlan.treinos.map((treino, i) => ({
    plan_id: savedPlan.id,
    user_id: user.id,
    dia_numero: i + 1,
    workout_json: treino as unknown as Json,
  }))

  const { error: workoutsError } = await supabase.from('plan_workouts').insert(planWorkoutsRows)

  if (workoutsError) {
    console.error('[training-plan/generate] Erro ao salvar treinos do plano:', workoutsError)
    await supabase.from('training_plans').delete().eq('id', savedPlan.id)
    return NextResponse.json({ error: 'Erro ao salvar treinos do plano.' }, { status: 500 })
  }

  return NextResponse.json({
    plan_id: savedPlan.id,
    nome_plano: generatedPlan.nome_plano,
    total_treinos: generatedPlan.treinos.length,
    valido_ate: validadeDate,
  })
}
