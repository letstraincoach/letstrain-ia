import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendPushToUser } from '@/lib/push/web-push'

// ── Food achievement check (fire-and-forget) ────────────────────────────────
async function checkFoodAchievements(userId: string): Promise<void> {
  try {
    const svc = createServiceClient()

    const [achResult, unlockedResult] = await Promise.all([
      svc.from('achievements').select('*').like('criterio_tipo', 'nutricao%'),
      svc.from('user_achievements').select('achievement_id').eq('user_id', userId),
    ])

    const all = achResult.data ?? []
    const unlockedIds = new Set((unlockedResult.data ?? []).map((r) => r.achievement_id))
    const locked = all.filter((a) => !unlockedIds.has(a.id))
    if (locked.length === 0) return

    // Buscar todos os logs do usuário (leve — só campos necessários)
    const { data: logs } = await svc
      .from('food_logs')
      .select('data, tipo, proteina_total')
      .eq('user_id', userId)

    if (!logs?.length) return

    // Dias únicos com registro
    const diasSet = new Set(logs.map((l) => l.data as string))

    // Proteína por dia
    const protByDay: Record<string, number> = {}
    for (const l of logs) protByDay[l.data as string] = (protByDay[l.data as string] ?? 0) + Number(l.proteina_total)
    const diasComProteina = Object.values(protByDay).filter((p) => p >= 100).length

    // Tipos por dia (diário completo = 4+ tipos)
    const tiposByDay: Record<string, Set<string>> = {}
    for (const l of logs) {
      if (!tiposByDay[l.data as string]) tiposByDay[l.data as string] = new Set()
      tiposByDay[l.data as string].add(l.tipo as string)
    }
    const diasCompletos = Object.values(tiposByDay).filter((t) => t.size >= 4).length

    // Contagens por tipo
    const posReinoCount = logs.filter((l) => l.tipo === 'pos_treino').length
    const cafeManha = logs.filter((l) => l.tipo === 'cafe_manha').length

    // Streak de dias seguidos (horário de Brasília UTC-3)
    const hoje = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const sortedDates = [...diasSet].sort().reverse()
    let streak = 0
    let checkDate = hoje
    for (const d of sortedDates) {
      if (d === checkDate) {
        streak++
        const prev = new Date(checkDate + 'T12:00:00Z')
        prev.setUTCDate(prev.getUTCDate() - 1)
        checkDate = prev.toISOString().slice(0, 10)
      } else if (d < checkDate) break
    }

    // Combo: dias com treino executado E registro alimentar
    const { data: workouts } = await svc
      .from('workouts')
      .select('data')
      .eq('user_id', userId)
      .eq('status', 'executado')
    const workoutDays = new Set((workouts ?? []).map((w) => w.data as string))
    const comboDays = [...diasSet].filter((d) => workoutDays.has(d)).length

    // Verificar quais conquistas devem ser desbloqueadas
    const toUnlock = locked.filter((ach) => {
      const v = ach.criterio_valor as number | null
      switch (ach.criterio_tipo) {
        case 'nutricao_dias':      return v !== null && diasSet.size >= v
        case 'nutricao_proteina':  return v !== null && diasComProteina >= v
        case 'nutricao_completa':  return v !== null && diasCompletos >= v
        case 'nutricao_pos_treino':return v !== null && posReinoCount >= v
        case 'nutricao_cafe':      return v !== null && cafeManha >= v
        case 'nutricao_streak':    return v !== null && streak >= v
        case 'nutricao_combo':     return v !== null && comboDays >= v
        default: return false
      }
    })

    if (toUnlock.length === 0) return

    const { data: inserted } = await svc
      .from('user_achievements')
      .upsert(
        toUnlock.map((a) => ({ user_id: userId, achievement_id: a.id })),
        { onConflict: 'user_id,achievement_id', ignoreDuplicates: true }
      )
      .select()

    const insertedIds = new Set((inserted ?? []).map((r: { achievement_id: string }) => r.achievement_id))

    // Push para cada conquista desbloqueada
    for (const ach of toUnlock.filter((a) => insertedIds.has(a.id))) {
      void sendPushToUser(userId, {
        title: `${ach.icone_emoji} Conquista desbloqueada!`,
        body: ach.nome as string,
        url: '/progress',
      })
    }
  } catch {
    // best-effort — não bloqueia a resposta
  }
}

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

  // Verificar conquistas de nutrição (fire-and-forget)
  void checkFoodAchievements(user.id)

  return NextResponse.json({ ok: true, log })
}
