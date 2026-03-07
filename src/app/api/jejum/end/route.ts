import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/push/web-push'

interface AchievementRow {
  id: string
  codigo: string
  nome: string
  icone_emoji: string
  criterio_tipo: string
  criterio_valor: number | null
  criterio_extra: string | null
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Get current fast start time
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('jejum_inicio')
    .eq('id', user.id)
    .single()

  if (!profile?.jejum_inicio) {
    return NextResponse.json({ error: 'Nenhum jejum ativo' }, { status: 400 })
  }

  const fim = new Date()
  const inicio = new Date(profile.jejum_inicio as string)
  const duracaoMs = fim.getTime() - inicio.getTime()
  const duracaoHoras = duracaoMs / (1000 * 60 * 60)

  // Record session + clear jejum_inicio atomically
  await Promise.all([
    supabase.from('jejum_sessions').insert({
      user_id: user.id,
      inicio: profile.jejum_inicio,
      fim: fim.toISOString(),
    }),
    supabase
      .from('user_profiles')
      .update({ jejum_inicio: null })
      .eq('id', user.id),
  ])

  // Count total completed fasts (including the one just inserted)
  const { count: totalFasts } = await supabase
    .from('jejum_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const totalFastsCount = totalFasts ?? 1

  // Fetch all achievements + already unlocked
  const [allAchievementsResult, unlockedResult] = await Promise.all([
    supabase.from('achievements').select('*'),
    supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
  ])

  const allAchievements = (allAchievementsResult.data ?? []) as AchievementRow[]
  const unlockedIds = new Set((unlockedResult.data ?? []).map((r) => r.achievement_id))

  const toUnlock: AchievementRow[] = []

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue

    let meetsCondition = false

    switch (ach.criterio_tipo) {
      case 'jejum_duracao':
        meetsCondition = ach.criterio_valor !== null && duracaoHoras >= ach.criterio_valor
        break

      case 'jejum_total':
        meetsCondition = ach.criterio_valor !== null && totalFastsCount >= ach.criterio_valor
        break

      default:
        break
    }

    if (meetsCondition) toUnlock.push(ach)
  }

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

  // Push notifications for new achievements (fire-and-forget)
  const pushTasks = newAchievements.map((ach) =>
    sendPushToUser(user.id, {
      title: `${ach.icone_emoji} Conquista desbloqueada!`,
      body: ach.nome,
      url: '/progress',
    })
  )
  void Promise.allSettled(pushTasks)

  return NextResponse.json({
    ok: true,
    duracao_horas: Math.round(duracaoHoras * 10) / 10,
    newAchievements,
  })
}
