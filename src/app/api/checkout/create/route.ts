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

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: planoCfg.amount,
      currency: 'brl',
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: user.id,
        user_email: user.email ?? '',
        plano,
      },
      description: planoCfg.label,
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('[checkout/create] Erro Stripe:', err)
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento' }, { status: 500 })
  }
}
