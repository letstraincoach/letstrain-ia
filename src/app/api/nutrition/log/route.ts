import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface FoodLogItem {
  food_id: string
  nome: string
  icone: string
  quantidade: number
  calorias: number
  proteina_g: number
  carbo_g: number
  gordura_g: number
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)

  const { data: logs, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('data', date)
    .order('criado_em', { ascending: true })

  if (error) return NextResponse.json({ error: 'Erro ao buscar registros' }, { status: 500 })

  const totais = (logs ?? []).reduce(
    (acc, log) => ({
      calorias: acc.calorias + (log.calorias_total ?? 0),
      proteina: acc.proteina + Number(log.proteina_total ?? 0),
      carbo: acc.carbo + Number(log.carbo_total ?? 0),
      gordura: acc.gordura + Number(log.gordura_total ?? 0),
    }),
    { calorias: 0, proteina: 0, carbo: 0, gordura: 0 }
  )

  return NextResponse.json({ logs: logs ?? [], totais })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let body: { data?: string; tipo: string; items: FoodLogItem[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { tipo, items } = body
  const data = body.data ?? new Date().toISOString().slice(0, 10)

  const TIPOS_VALIDOS = ['cafe_manha', 'almoco', 'lanche', 'jantar', 'pos_treino', 'outro']
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Nenhum alimento selecionado' }, { status: 400 })
  }

  // Calcula totais na API para garantir consistência
  const calorias_total = Math.round(items.reduce((s, i) => s + i.calorias * i.quantidade, 0))
  const proteina_total = parseFloat(items.reduce((s, i) => s + i.proteina_g * i.quantidade, 0).toFixed(1))
  const carbo_total = parseFloat(items.reduce((s, i) => s + i.carbo_g * i.quantidade, 0).toFixed(1))
  const gordura_total = parseFloat(items.reduce((s, i) => s + i.gordura_g * i.quantidade, 0).toFixed(1))

  const { data: log, error } = await supabase
    .from('food_logs')
    .insert({
      user_id: user.id,
      data,
      tipo,
      items: items as unknown as import('@/types/database.types').Json,
      calorias_total,
      proteina_total,
      carbo_total,
      gordura_total,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Erro ao salvar registro' }, { status: 500 })

  return NextResponse.json({ ok: true, log })
}
