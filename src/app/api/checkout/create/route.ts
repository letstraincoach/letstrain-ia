import { NextResponse } from 'next/server'
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://letstrain.com.br'

  try {
    // Reutilizar stripe_customer_id se usuário já tem registro
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

    // Stripe Checkout Session — pagamento direto, sem trial nem cartão antecipado
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      locale: 'pt-BR',
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: { name: planoCfg.label },
          unit_amount: planoCfg.amount,
          recurring: {
            interval: plano === 'anual' ? 'year' : 'month',
          },
        },
        quantity: 1,
      }],
      // Metadata no subscription para o webhook conseguir identificar o usuário
      subscription_data: {
        metadata: { user_id: user.id, plano },
      },
      success_url: `${appUrl}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/assinatura`,
      metadata: { user_id: user.id, plano },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout/create] Erro Stripe:', err)
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 })
  }
}
