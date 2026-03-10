import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import { LEVEL_CONFIG } from '@/lib/training/levels.config'
import type { TrainingLevel } from '@/types/database.types'
import { sendPushToUser } from '@/lib/push/web-push'

interface Props {
  params: Promise<{ id: string }>
}

interface AchievementRow {
  id: string
  codigo: string
  nome: string
  icone_emoji: string
  criterio_tipo: string
  criterio_valor: number | null
  criterio_extra: string | null
}

export async function POST(_request: Request, { params }: Props) {
  const { id: workoutId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Verificar propriedade do treino e pegar executado_em para critério de horário
  const { data: workout } = await supabase
    .from('workouts')
    .select('id, status, executado_em')
    .eq('id', workoutId)
    .eq('user_id', user.id)
    .single()

  if (!workout || workout.status !== 'executado') {
    return NextResponse.json({ error: 'Treino não concluído' }, { status: 400 })
  }

  // Buscar progresso e perfil em paralelo
  const [progressResult, profileResult] = await Promise.all([
    supabase
      .from('user_progress')
      .select('treinos_totais, treinos_nivel_atual, streak_atual, streak_maximo, lets_coins')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_profiles')
      .select('nivel_atual')
      .eq('id', user.id)
      .single(),
  ])

  const progress = progressResult.data
  const profile = profileResult.data

  if (!progress || !profile) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  const nivelAtual = (profile.nivel_atual ?? 'adaptacao') as TrainingLevel
  const levelCfg = LEVEL_CONFIG[nivelAtual]

  let leveledUp = false
  let newLevel: TrainingLevel | null = null

  // ── Level-up check ──────────────────────────────────────────────────────
  if (
    levelCfg.proximo !== null &&
    levelCfg.treinos_necessarios !== null &&
    progress.treinos_nivel_atual >= levelCfg.treinos_necessarios
  ) {
    newLevel = levelCfg.proximo

    const [, , reset] = await Promise.all([
      // Atualiza nível no perfil
      supabase
        .from('user_profiles')
        .update({ nivel_atual: newLevel })
        .eq('id', user.id),
      // noop para manter 3 items no Promise.all
      supabase.from('workouts').select('id').limit(0),
      // Zera contador do nível
      supabase
        .from('user_progress')
        .update({ treinos_nivel_atual: 0 })
        .eq('id', user.id),
    ])
    void reset
    leveledUp = true
  }

  // ── Achievement check ────────────────────────────────────────────────────
  const [allAchievementsResult, unlockedResult] = await Promise.all([
    supabase.from('achievements').select('*'),
    supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id),
  ])

  const allAchievements = (allAchievementsResult.data ?? []) as AchievementRow[]
  const unlockedIds = new Set((unlockedResult.data ?? []).map((r) => r.achievement_id))

  // Contar avaliações do usuário
  const { count: avaliacoesCount } = await supabase
    .from('workout_evaluations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Hora e dia do treino (para critérios de horário)
  const executadoDate = workout.executado_em ? new Date(workout.executado_em) : null
  const executadoHour = executadoDate ? executadoDate.getHours() : null
  const executadoDay  = executadoDate ? executadoDate.getDay()  : null // 0=Dom, 6=Sáb

  // Contar exercícios distintos (para critério diversidade)
  // Só executa a query se existirem conquistas de diversidade ainda bloqueadas
  const hasDiversidadeAch = allAchievements.some(
    (a) => !unlockedIds.has(a.id) && a.criterio_tipo === 'diversidade'
  )
  let distinctExerciseCount = 0
  if (hasDiversidadeAch) {
    const { data: workoutsData } = await supabase
      .from('workouts')
      .select('exercicios')
      .eq('user_id', user.id)
      .eq('status', 'executado')

    const names = new Set<string>()
    for (const row of workoutsData ?? []) {
      const principal = (row.exercicios as Record<string, unknown> | null)?.principal
      if (Array.isArray(principal)) {
        for (const ex of principal as { nome?: string }[]) {
          if (ex.nome) names.add(ex.nome.toLowerCase().trim())
        }
      }
    }
    distinctExerciseCount = names.size
  }

  const toUnlock: AchievementRow[] = []

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue

    let meetsCondition = false

    switch (ach.criterio_tipo) {
      case 'treinos_totais':
        meetsCondition =
          ach.criterio_valor !== null &&
          progress.treinos_totais >= ach.criterio_valor
        break

      case 'streak':
        meetsCondition =
          ach.criterio_valor !== null &&
          progress.streak_atual >= ach.criterio_valor
        break

      case 'level_up':
        meetsCondition = leveledUp && ach.criterio_extra === newLevel
        break

      case 'horario':
        if (executadoHour !== null) {
          switch (ach.criterio_extra) {
            case 'antes_7h':
              meetsCondition = executadoHour < 7
              break
            case 'apos_21h':
              meetsCondition = executadoHour >= 21
              break
            case 'fim_semana':
              meetsCondition = executadoDay === 0 || executadoDay === 6
              break
            case 'hora_almoco':
              meetsCondition = executadoHour >= 12 && executadoHour < 14
              break
            case 'golden_hour':
              meetsCondition = executadoHour >= 17 && executadoHour < 19
              break
          }
        }
        break

      case 'diversidade':
        meetsCondition =
          ach.criterio_valor !== null &&
          distinctExerciseCount >= ach.criterio_valor
        break

      case 'avaliacoes':
        meetsCondition =
          ach.criterio_valor !== null &&
          (avaliacoesCount ?? 0) >= ach.criterio_valor
        break

      default:
        break
    }

    if (meetsCondition) {
      toUnlock.push(ach)
    }
  }

  // Inserir novas conquistas (ON CONFLICT garante idempotência)
  let newAchievements: Pick<AchievementRow, 'codigo' | 'nome' | 'icone_emoji'>[] = []

  if (toUnlock.length > 0) {
    const { data: inserted } = await supabase
      .from('user_achievements')
      .upsert(
        toUnlock.map((a) => ({ user_id: user.id, achievement_id: a.id })),
        { onConflict: 'user_id,achievement_id', ignoreDuplicates: true }
      )
      .select()

    const insertedIds = new Set((inserted ?? []).map((r: { achievement_id: string }) => r.achievement_id))
    newAchievements = toUnlock
      .filter((a) => insertedIds.has(a.id))
      .map((a) => ({ codigo: a.codigo, nome: a.nome, icone_emoji: a.icone_emoji }))
  }

  // ── Lets Coins ───────────────────────────────────────────────────────────
  const coinTransactions: { tipo: string; amount: number; descricao: string }[] = []

  // +10 por treino concluído (sempre)
  coinTransactions.push({ tipo: 'treino', amount: 10, descricao: 'Treino concluído 💪' })

  // +25 a cada múltiplo de 7 dias de streak
  if (progress.streak_atual > 0 && progress.streak_atual % 7 === 0) {
    coinTransactions.push({ tipo: 'streak', amount: 25, descricao: `Streak de ${progress.streak_atual} dias 🔥` })
  }

  // +15 no primeiro treino do mês
  const mesAtual = new Date().toISOString().slice(0, 7) // "2026-03"
  const { count: treinseMes } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'executado')
    .gte('executado_em', `${mesAtual}-01T00:00:00Z`)

  if ((treinseMes ?? 0) === 1) {
    coinTransactions.push({ tipo: 'primeiro_mes', amount: 15, descricao: 'Primeiro treino do mês 🌟' })
  }

  const totalCoins = coinTransactions.reduce((sum, t) => sum + t.amount, 0)

  // Atualiza saldo e registra transações
  await Promise.all([
    supabase
      .from('user_progress')
      .update({ lets_coins: (progress.lets_coins ?? 0) + totalCoins })
      .eq('id', user.id),
    supabase
      .from('lets_coins_transactions')
      .insert(coinTransactions.map((t) => ({ user_id: user.id, ...t }))),
  ])

  // ── Push notifications (fire-and-forget) ───────────────────────────────
  const pushTasks: Promise<void>[] = []

  if (leveledUp && newLevel) {
    const cfg = LEVEL_CONFIG[newLevel]
    pushTasks.push(
      sendPushToUser(user.id, {
        title: `Level Up! ${cfg.emoji} ${cfg.label}`,
        body: `Você subiu para o nível ${cfg.label}! Continue assim 🚀`,
        url: '/progress',
      })
    )
  }

  for (const ach of newAchievements) {
    pushTasks.push(
      sendPushToUser(user.id, {
        title: `${ach.icone_emoji} Conquista desbloqueada!`,
        body: ach.nome,
        url: '/progress',
      })
    )
  }

  void Promise.allSettled(pushTasks)

  // ── Notificação pós-treino agendada para 1h depois (fire-and-forget) ────
  void (async () => {
    try {
      const serviceClient = createServiceClient()
      const scheduledFor = new Date(Date.now() + 60 * 60 * 1000).toISOString() // +1h
      await serviceClient.from('scheduled_push_notifications').insert({
        user_id: user.id,
        scheduled_for: scheduledFor,
        title: '🍽️ Hora da refeição pós-treino!',
        body: 'Registre o que você comeu para otimizar sua recuperação e manter o progresso.',
        url: '/nutricao',
        icon: '/icon-192.png',
      })
    } catch {
      // best-effort — não bloqueia a resposta
    }
  })()

  return NextResponse.json({
    leveledUp,
    newLevel: newLevel ?? null,
    newAchievements,
    coinsGanhos: totalCoins,
    coinTransactions,
  })
}
