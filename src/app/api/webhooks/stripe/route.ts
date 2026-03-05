import { NextResponse } from 'next/server'
import { stripe, PLANOS, type PlanoKey } from '@/lib/stripe/config'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''

  let event: ReturnType<typeof stripe.webhooks.constructEvent>
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe/webhook] Assinatura inválida:', err)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ ok: true })
  }

  const pi = event.data.object
  const paymentIntentId = pi.id
  const { user_id, plano: planoRaw } = pi.metadata ?? {}

  if (!user_id || (planoRaw !== 'mensal' && planoRaw !== 'anual')) {
    console.error('[stripe/webhook] metadata inválido:', pi.metadata)
    return NextResponse.json({ ok: true })
  }

  const plano = planoRaw as PlanoKey
  const supabase = createServiceClient()

  // Idempotência: já processamos este payment_intent?
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

  // Verifica se há assinatura ativa para renovação
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

    const { error } = await supabase
      .from('subscriptions')
      .update({
        plano,
        stripe_payment_intent_id: paymentIntentId,
        fim: novoFim.toISOString(),
      })
      .eq('id', activeSub.id)

    if (error) {
      console.error('[stripe/webhook] Erro ao renovar assinatura:', error)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
  } else {
    const { error } = await supabase.from('subscriptions').insert({
      user_id,
      plano,
      status: 'ativa',
      stripe_payment_intent_id: paymentIntentId,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    })

    if (error) {
      console.error('[stripe/webhook] Erro ao criar assinatura:', error)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
