import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SubscribeBody {
  subscription: {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }
  diasTreino: number[]   // 0=dom … 6=sab
  horarioLembrete: string | null  // "HH:MM"
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let body: SubscribeBody
  try {
    body = await request.json() as SubscribeBody
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { subscription, diasTreino, horarioLembrete } = body

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: 'Subscription inválida' }, { status: 400 })
  }

  // Upsert pelo endpoint único
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        dias_treino: diasTreino,
        horario_lembrete: horarioLembrete,
        ativo: true,
      },
      { onConflict: 'endpoint' }
    )

  if (error) {
    console.error('[push/subscribe]', error)
    return NextResponse.json({ error: 'Erro ao salvar configuração' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let body: { endpoint: string }
  try {
    body = await request.json() as { endpoint: string }
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  await supabase
    .from('push_subscriptions')
    .update({ ativo: false })
    .eq('user_id', user.id)
    .eq('endpoint', body.endpoint)

  return NextResponse.json({ ok: true })
}
