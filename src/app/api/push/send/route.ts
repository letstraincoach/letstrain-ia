/**
 * Endpoint interno para envio de push notifications.
 * Protegido por CRON_SECRET — chamado pelo Edge Function agendado.
 */
import { NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/push/web-push'

interface SendBody {
  userId: string
  title: string
  body: string
  url?: string
}

export async function POST(request: Request) {
  // Verificar secret interno
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: SendBody
  try {
    body = await request.json() as SendBody
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!body.userId || !body.title || !body.body) {
    return NextResponse.json({ error: 'Campos obrigatórios: userId, title, body' }, { status: 400 })
  }

  try {
    await sendPushToUser(body.userId, {
      title: body.title,
      body: body.body,
      url: body.url,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[push/send]', err)
    return NextResponse.json({ error: 'Erro ao enviar notificação' }, { status: 500 })
  }
}
