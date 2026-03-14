import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Tabela de opções de resgate: coins → valor em reais
const RESGATES = {
  100: 5,    // 100 coins = R$5
  200: 12,   // 200 coins = R$12
  500: 35,   // 500 coins = R$35 (melhor custo-benefício)
} as const

type CoinsOpcao = keyof typeof RESGATES

function gerarCodigo(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem I, O, 0, 1 (confundem)
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `LETS-${seg()}-${seg()}`
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let coins: number
  try {
    const body = await request.json() as { coins: number }
    coins = body.coins
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  if (!(coins in RESGATES)) {
    return NextResponse.json({ error: 'Opção de resgate inválida' }, { status: 400 })
  }

  const valorBrl = RESGATES[coins as CoinsOpcao]

  // Verificar saldo atual
  const { data: progress } = await supabase
    .from('user_progress')
    .select('lets_coins')
    .eq('id', user.id)
    .single()

  if (!progress || (progress.lets_coins ?? 0) < coins) {
    return NextResponse.json({ error: 'Saldo insuficiente de Lets Coins' }, { status: 400 })
  }

  const codigo = gerarCodigo()

  // Debitar coins + registrar resgate + registrar transação (atomicamente via Promise.all)
  const [updateResult, , transactionResult] = await Promise.all([
    supabase
      .from('user_progress')
      .update({ lets_coins: (progress.lets_coins ?? 0) - coins })
      .eq('id', user.id)
      .eq('lets_coins', progress.lets_coins), // optimistic lock

    supabase
      .from('lets_coins_resgates')
      .insert({
        user_id: user.id,
        coins_gastos: coins,
        valor_brl: valorBrl,
        codigo,
      }),

    supabase
      .from('lets_coins_transactions')
      .insert({
        user_id: user.id,
        amount: -coins,
        tipo: 'resgate',
        descricao: `Cupom ${codigo} — R$${valorBrl.toFixed(2)} na loja Lets Train`,
      }),
  ])

  if (updateResult.error) {
    return NextResponse.json({ error: 'Saldo alterado. Tente novamente.' }, { status: 409 })
  }

  void transactionResult

  return NextResponse.json({
    ok: true,
    codigo,
    valorBrl,
    coins,
  })
}
