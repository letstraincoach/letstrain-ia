import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, PLANOS, type PlanoKey } from '@/lib/stripe/config'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe/webhook] Assinatura inválida:', err)
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // ── customer.subscription.created (trial iniciado) ──────────────────────
  if (event.type === 'customer.subscription.created') {
    const sub = event.data.object as Stripe.Subscription
    const { user_id, plano: planoRaw } = sub.metadata ?? {}

    if (!user_id || (planoRaw !== 'mensal' && planoRaw !== 'anual')) {
      console.error('[stripe/webhook] metadata inválido:', sub.metadata)
      return NextResponse.json({ ok: true })
    }

    // Idempotência: já existe registro para esta subscription?
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', sub.id)
      .maybeSingle()

    if (existing) return NextResponse.json({ ok: true })

    const plano = planoRaw as PlanoKey
    const planoCfg = PLANOS[plano]
    const inicio = new Date()
    const trialEndsAt = sub.trial_end
      ? new Date(sub.trial_end * 1000)
      : new Date(inicio.getTime() + 3 * 24 * 60 * 60 * 1000)
    const fim = new Date(inicio.getTime() + planoCfg.duracao_dias * 24 * 60 * 60 * 1000)

    const { error } = await supabase.from('subscriptions').insert({
      user_id,
      plano,
      status: 'trial',
      stripe_subscription_id: sub.id,
      stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      trial_ends_at: trialEndsAt.toISOString(),
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    })

    if (error) {
      console.error('[stripe/webhook] Erro ao criar assinatura (trial):', error)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  // ── invoice.paid (trial expirou e pagamento processado) ─────────────────
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : (invoice.subscription as Stripe.Subscription | null)?.id

    if (!subscriptionId) return NextResponse.json({ ok: true })

    // Busca a assinatura no Stripe para pegar o metadata
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId)
    const { user_id, plano: planoRaw } = stripeSub.metadata ?? {}

    if (!user_id || (planoRaw !== 'mensal' && planoRaw !== 'anual')) {
      return NextResponse.json({ ok: true })
    }

    const plano = planoRaw as PlanoKey
    const planoCfg = PLANOS[plano]
    const inicio = new Date()
    const fim = new Date(inicio.getTime() + planoCfg.duracao_dias * 24 * 60 * 60 * 1000)

    // Atualiza ou cria assinatura como 'ativa'
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle()

    if (existingSub) {
      await supabase
        .from('subscriptions')
        .update({ status: 'ativa', fim: fim.toISOString() })
        .eq('id', existingSub.id)
    } else {
      await supabase.from('subscriptions').insert({
        user_id,
        plano,
        status: 'ativa',
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer.id,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      })
    }

    return NextResponse.json({ ok: true })
  }

  // ── customer.subscription.deleted (cancelamento) ────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription

    await supabase
      .from('subscriptions')
      .update({ status: 'cancelada' })
      .eq('stripe_subscription_id', sub.id)

    return NextResponse.json({ ok: true })
  }

  // ── invoice.payment_failed (pagamento falhou após trial) ─────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : (invoice.subscription as Stripe.Subscription | null)?.id

    if (subscriptionId) {
      await supabase
        .from('subscriptions')
        .update({ status: 'expirada' })
        .eq('stripe_subscription_id', subscriptionId)
        .eq('status', 'trial')
    }

    return NextResponse.json({ ok: true })
  }

  // ── payment_intent.succeeded (compatibilidade retroativa) ────────────────
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const { user_id, plano: planoRaw } = pi.metadata ?? {}

    if (!user_id || (planoRaw !== 'mensal' && planoRaw !== 'anual')) {
      return NextResponse.json({ ok: true })
    }

    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_payment_intent_id', pi.id)
      .maybeSingle()

    if (existing) return NextResponse.json({ ok: true })

    const plano = planoRaw as PlanoKey
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
        .update({ plano, stripe_payment_intent_id: pi.id, fim: novoFim.toISOString() })
        .eq('id', activeSub.id)
    } else {
      await supabase.from('subscriptions').insert({
        user_id,
        plano,
        status: 'ativa',
        stripe_payment_intent_id: pi.id,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      })
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
