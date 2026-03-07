import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, PLANOS, type PlanoKey } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let plano: PlanoKey
  try {
    const body = await request.json() as { plano: string }
    if (body.plano !== 'mensal' && body.plano !== 'anual') {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }
    plano = body.plano
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const planoCfg = PLANOS[plano]

  try {
    // Reutilizar stripe_customer_id se usuário já tem assinatura
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .maybeSingle()

    let customerId = (existingSub?.stripe_customer_id ?? undefined) as string | undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      })
      customerId = customer.id
    }

    // Criar Subscription com trial de 3 dias
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price_data: {
          currency: 'brl',
          product_data: { name: planoCfg.label },
          unit_amount: planoCfg.amount,
          recurring: {
            interval: plano === 'anual' ? 'year' : 'month',
          },
        },
      }],
      trial_period_days: 3,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['pending_setup_intent'],
      metadata: { user_id: user.id, plano },
    })

    const setupIntent = subscription.pending_setup_intent as Stripe.SetupIntent | null

    if (!setupIntent?.client_secret) {
      throw new Error('SetupIntent não disponível')
    }

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      subscriptionId: subscription.id,
    })
  } catch (err) {
    console.error('[checkout/create] Erro Stripe:', err)
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 })
  }
}
