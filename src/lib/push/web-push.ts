import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/service'

// Inicializar VAPID uma vez no módulo
webpush.setVapidDetails(
  'mailto:contato@letstrain.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
}

/**
 * Envia push notification para todos os dispositivos ativos de um usuário.
 * Falhas individuais de endpoint são ignoradas (subscription expirada, etc.).
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const supabase = createServiceClient()

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, keys')
    .eq('user_id', userId)
    .eq('ativo', true)

  if (!subscriptions?.length) return

  const payloadStr = JSON.stringify({
    ...payload,
    url: payload.url ?? '/dashboard',
    icon: payload.icon ?? '/icon-192.png',
  })

  const expiredIds: string[] = []

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          payloadStr
        )
      } catch (err: unknown) {
        // 410 Gone = subscription expirada, desativar
        if (typeof err === 'object' && err !== null && 'statusCode' in err) {
          const status = (err as { statusCode: number }).statusCode
          if (status === 410 || status === 404) {
            expiredIds.push(sub.id)
          }
        }
      }
    })
  )

  // Desativar subscriptions expiradas
  if (expiredIds.length > 0) {
    await supabase
      .from('push_subscriptions')
      .update({ ativo: false })
      .in('id', expiredIds)
  }
}
