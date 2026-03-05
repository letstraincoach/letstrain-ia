import { NextResponse } from 'next/server'
import { stripe, PLANOS, type PlanoKey } from '@/lib/stripe/config'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  let paymentIntentId: string
  try {
    const body = await request.json() as { paymentIntentId: string }
    if (!body.paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId obrigatório' }, { status: 400 })
    }
    paymentIntentId = body.paymentIntentId
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const pi = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (pi.status !== 'succeeded') {
    return NextResponse.json({ error: 'Pagamento ainda não confirmado' }, { status: 402 })
  }

  const { user_id, plano: planoRaw } = pi.metadata ?? {}
  if (!user_id || (planoRaw !== 'mensal' && planoRaw !== 'anual')) {
    return NextResponse.json({ error: 'Metadata inválido' }, { status: 400 })
  }

  const plano = planoRaw as PlanoKey
  const supabase = createServiceClient()

  // Idempotência: já foi processado (via webhook ou chamada anterior)?
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ ok: true })
  }

  const planoCfg = PLANOS[plano]
  const inicio = new Date()
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + planoCfg.duracao_dias)

  const { data: activeSub } = await supabase
    .from('subscriptions')
    .select('id, fim')
    .eq('user_id', user_id)
    .eq('status', 'ativa')
    .order('fim', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (activeSub) {
    const novoFim = new Date(activeSub.fim)
    novoFim.setDate(novoFim.getDate() + planoCfg.duracao_dias)
    await supabase
      .from('subscriptions')
      .update({ plano, stripe_payment_intent_id: paymentIntentId, fim: novoFim.toISOString() })
      .eq('id', activeSub.id)
  } else {
    await supabase.from('subscriptions').insert({
      user_id,
      plano,
      status: 'ativa',
      stripe_payment_intent_id: paymentIntentId,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    })
  }

  return NextResponse.json({ ok: true })
}
