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

  return new Response(
    JSON.stringify({ sent: sentCount, expired: expiredEndpoints.length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
