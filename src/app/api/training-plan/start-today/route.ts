import { createClient } from '@/lib/supabase/server'
import { WorkoutSchema } from '@/lib/ai/workout-schemas'
import { adjustWorkout, type DailyCheckin } from '@/lib/training/daily-adjustment'
import { NextResponse } from 'next/server'
import type { Json } from '@/types/database.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any

export const maxDuration = 30

export async function POST(request: Request) {
  const supabase = await createClient()
  const sb = supabase as AnySupabase
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let checkin: DailyCheckin
  try {
    checkin = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  // ── Verificar se já treinou hoje ─────────────────────────────────────────
  const hoje = new Date().toISOString().split('T')[0]
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
      { error: 'Você já concluiu um treino hoje!', workout_id: treinoHoje.id },
      { status: 409 }
    )
  }

  if (treinoHoje?.status === 'gerado') {
    return NextResponse.json({ workout_id: treinoHoje.id })
  }

  // ── Buscar plano ativo e próximo treino não executado ─────────────────────
  const { data: planoAtivo } = await sb
    .from('training_plans')
    .select('id, nome_plano, nivel, local_treino, plan_workouts(id, dia_numero, workout_json, executado)')
    .eq('user_id', user.id)
    .eq('status', 'ativo')
    .gte('valido_ate', hoje)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!planoAtivo) {
    return NextResponse.json({ no_plan: true, error: 'Nenhum plano ativo encontrado.' }, { status: 404 })
  }

  const planWorkouts = (planoAtivo.plan_workouts as Array<{
    id: string; dia_numero: number; workout_json: Json; executado: boolean
  }>).sort((a, b) => a.dia_numero - b.dia_numero)

  const proximoTreino = planWorkouts.find((pw) => !pw.executado)

  if (!proximoTreino) {
    await sb.from('training_plans').update({ status: 'concluido' }).eq('id', planoAtivo.id)
    return NextResponse.json({ plan_complete: true, error: 'Plano concluído! Gere um novo plano.' }, { status: 404 })
  }

  // ── Aplicar ajustes do dia (sem IA) ──────────────────────────────────────
  let workout
  try {
    workout = WorkoutSchema.parse(proximoTreino.workout_json)
  } catch {
    return NextResponse.json({ error: 'Erro ao carregar treino do plano.' }, { status: 500 })
  }

  const workoutAjustado = adjustWorkout(workout, checkin)

  // ── Buscar nível do perfil ────────────────────────────────────────────────
  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('nivel_atual, local_treino')
    .eq('id', user.id)
    .single()

  // ── Salvar como workout (mesmo formato de antes) ──────────────────────────
  const { data: savedWorkout, error: saveError } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      data: hoje,
      nivel: profileData?.nivel_atual ?? planoAtivo.nivel,
      local_treino: profileData?.local_treino ?? planoAtivo.local_treino,
      duracao_estimada: workoutAjustado.duracao_estimada,
      checkin_ultima_refeicao: checkin.ultima_refeicao,
      checkin_tempo_disponivel: checkin.tempo_disponivel,
      checkin_disposicao: checkin.disposicao,
      exercicios: workoutAjustado as unknown as Json,
      status: 'gerado',
    })
    .select('id')
    .single()

  if (saveError || !savedWorkout) {
    console.error('[training-plan/start-today] Erro ao salvar workout:', saveError)
    return NextResponse.json({ error: 'Erro ao iniciar treino. Tente novamente.' }, { status: 500 })
  }

  // ── Marcar plan_workout como executado e linkar workout_id ────────────────
  await sb
    .from('plan_workouts')
    .update({ executado: true, workout_id: savedWorkout.id })
    .eq('id', proximoTreino.id)

  return NextResponse.json({
    workout_id: savedWorkout.id,
    dia_numero: proximoTreino.dia_numero,
    total_dias: planWorkouts.length,
    nome_plano: planoAtivo.nome_plano,
  })
}
