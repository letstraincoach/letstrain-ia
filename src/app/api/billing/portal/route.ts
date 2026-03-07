import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Busca o stripe_customer_id da assinatura mais recente
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .not('stripe_customer_id', 'is', null)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'Assinatura sem dados de faturamento.' },
      { status: 404 }
    )
  }

  let returnUrl: string
  try {
    const body = await request.json() as { returnUrl?: string }
    returnUrl = body.returnUrl ?? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://letstrain-ia.vercel.app'}/settings`
  } catch {
    returnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://letstrain-ia.vercel.app'}/settings`
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: returnUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[billing/portal] Erro Stripe:', err)
    return NextResponse.json({ error: 'Erro ao abrir portal de faturamento' }, { status: 500 })
  }
}
