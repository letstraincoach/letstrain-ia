/**
 * Supabase Edge Function — send-push-reminders
 *
 * Agendamento recomendado: a cada hora (cron "0 * * * *")
 * Via Supabase Dashboard → Edge Functions → Schedules
 * ou via SQL: SELECT cron.schedule('send-reminders', '0 * * * *', $$SELECT net.http_post(...)$$);
 *
 * Runtime: Deno
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @deno-types="npm:@types/web-push"
import webpush from 'npm:web-push'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!

webpush.setVapidDetails('mailto:contato@letstrain.app', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const MOTIVATIONAL_MESSAGES = [
  'Seu treino de hoje está pronto. Bora lá! 💪',
  'É hora do treino! A consistência faz toda a diferença. 🔥',
  'Esse é o momento. Seu treino de hoje te espera! ⚡',
  'Cada treino conta. Não deixa passar o de hoje! 🏆',
  'Quem treina hoje agradece amanhã. Vamos! 🌟',
  'Hora de manter a sequência. Você está indo muito bem! 💎',
  'Treino na agenda, bom humor garantido depois. Bora! 🎯',
  'Sua melhor versão começa com esse treino agora. 🚀',
]

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Hora e dia atual no fuso de Brasília (UTC-3)
  const now = new Date()
  const brasiliaOffset = -3 * 60
  const brasiliaTime = new Date(now.getTime() + (brasiliaOffset + now.getTimezoneOffset()) * 60 * 1000)

  const currentHour = brasiliaTime.getHours()
  const currentMinute = brasiliaTime.getMinutes()
  const currentDay = brasiliaTime.getDay() // 0=dom … 6=sab

  // Formatos de hora para comparar com horario_lembrete (HH:00 ± 30min)
  const hourStart = `${String(currentHour).padStart(2, '0')}:00`
  const hourEnd = `${String(currentHour).padStart(2, '0')}:59`

  // Buscar subscriptions ativas onde:
  // - dia atual está no array dias_treino
  // - horario_lembrete está na hora atual
  // - usuário tem assinatura ativa
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select(`
      id,
      user_id,
      endpoint,
      keys,
      horario_lembrete,
      dias_treino
    `)
    .eq('ativo', true)
    .gte('horario_lembrete', hourStart)
    .lte('horario_lembrete', hourEnd)

  if (!subscriptions?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
  }

  // Filtrar apenas os que incluem o dia atual
  const todaySubscriptions = subscriptions.filter((sub) => {
    const dias = sub.dias_treino as number[]
    return dias?.includes(currentDay)
  })

  if (!todaySubscriptions.length) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
  }

  // Verificar quais usuários têm assinatura ativa
  const userIds = [...new Set(todaySubscriptions.map((s) => s.user_id as string))]
  const gracePeriodEnd = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  const { data: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('user_id')
    .in('user_id', userIds)
    .eq('status', 'ativa')
    .gte('fim', gracePeriodEnd)

  const activeUserIds = new Set((activeSubscriptions ?? []).map((s) => s.user_id as string))

  // Enviar notificações
  const validSubs = todaySubscriptions.filter((s) => activeUserIds.has(s.user_id as string))
  const expiredEndpoints: string[] = []
  let sentCount = 0

  // Mensagem aleatória
  const message = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]

  // Calcular hora formatada para o body
  const horaFormatada = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

  await Promise.allSettled(
    validSubs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint as string,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          JSON.stringify({
            title: 'Lets Train 💪',
            body: message,
            url: '/workout/checkin',
            icon: '/icon-192.png',
          })
        )
        sentCount++
      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'statusCode' in err) {
          const status = (err as { statusCode: number }).statusCode
          if (status === 410 || status === 404) {
            expiredEndpoints.push(sub.endpoint as string)
          }
        }
      }
    })
  )

  // Desativar endpoints expirados
  if (expiredEndpoints.length > 0) {
    await supabase
      .from('push_subscriptions')
      .update({ ativo: false })
      .in('endpoint', expiredEndpoints)
  }

  console.log(`[send-push-reminders] Enviado: ${sentCount} | Hora: ${horaFormatada} | Dia: ${currentDay}`)

  // ── Streak em risco — dispara às 19h Brasília ─────────────────────────────
  let streakSentCount = 0

  if (currentHour === 19) {
    const hoje = brasiliaTime.toISOString().split('T')[0]

    // Usuários com streak >= 3 e push ativo
    const { data: streakSubs } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, keys')
      .eq('ativo', true)

    if (streakSubs?.length) {
      const streakUserIds = [...new Set(streakSubs.map((s) => s.user_id as string))]

      // Filtrar: assinatura ativa
      const { data: activeSubs2 } = await supabase
        .from('subscriptions')
        .select('user_id')
        .in('user_id', streakUserIds)
        .in('status', ['ativa', 'trial'])

      const activeIds2 = new Set((activeSubs2 ?? []).map((s) => s.user_id as string))

      // Buscar streaks >= 3
      const { data: streakData } = await supabase
        .from('user_progress')
        .select('id, streak_atual')
        .in('id', [...activeIds2])
        .gte('streak_atual', 3)

      if (streakData?.length) {
        const atRiskIds = new Set(streakData.map((p) => p.id as string))
        const streakMap = new Map(streakData.map((p) => [p.id as string, p.streak_atual as number]))

        // Verificar quem JÁ treinou hoje (excluir do alerta)
        const { data: treinosHoje } = await supabase
          .from('workouts')
          .select('user_id')
          .in('user_id', [...atRiskIds])
          .eq('data', hoje)
          .eq('status', 'executado')

        const treinouHoje = new Set((treinosHoje ?? []).map((w) => w.user_id as string))

        // Usuários em risco: streak >= 3 e não treinou hoje
        const atRiskSubs = streakSubs.filter((s) =>
          atRiskIds.has(s.user_id as string) && !treinouHoje.has(s.user_id as string)
        )

        const streakExpired: string[] = []

        await Promise.allSettled(
          atRiskSubs.map(async (sub) => {
            const streak = streakMap.get(sub.user_id as string) ?? 3
            try {
              await webpush.sendNotification(
                {
                  endpoint: sub.endpoint as string,
                  keys: sub.keys as { p256dh: string; auth: string },
                },
                JSON.stringify({
                  title: `🔥 Streak de ${streak} dias em risco!`,
                  body: `Você ainda não treinou hoje. Não quebre sua sequência agora — falta pouco!`,
                  url: '/workout/checkin',
                  icon: '/icon-192.png',
                })
              )
              streakSentCount++
            } catch (err: unknown) {
              if (typeof err === 'object' && err !== null && 'statusCode' in err) {
                const status = (err as { statusCode: number }).statusCode
                if (status === 410 || status === 404) {
                  streakExpired.push(sub.endpoint as string)
                }
              }
            }
          })
        )

        if (streakExpired.length > 0) {
          await supabase
            .from('push_subscriptions')
            .update({ ativo: false })
            .in('endpoint', streakExpired)
        }

        console.log(`[streak-risk] Enviado: ${streakSentCount} | Em risco: ${atRiskSubs.length}`)
      }
    }
  }

  return new Response(
    JSON.stringify({ sent: sentCount, streak_sent: streakSentCount, expired: expiredEndpoints.length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
