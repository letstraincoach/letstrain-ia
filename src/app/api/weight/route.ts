import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function gerarInsight(
  entries: Array<{ data: string; peso: number }>,
  objetivo: string | null,
) {
  const sorted = [...entries].sort((a, b) => a.data.localeCompare(b.data))
  const linhas = sorted.map(e =>
    `${new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}: ${e.peso} kg`
  ).join('\n')

  const primeiroPeso = sorted[0].peso
  const ultimoPeso   = sorted[sorted.length - 1].peso
  const diff         = (ultimoPeso - primeiroPeso).toFixed(1)
  const dias         = Math.round((new Date(sorted[sorted.length - 1].data).getTime() - new Date(sorted[0].data).getTime()) / 86400000)

  const prompt = `Você é o personal trainer do app Lets Train. O usuário registrou o seguinte histórico de peso:

${linhas}

Variação: ${diff} kg em ${dias} dias.
Objetivo do usuário: ${objetivo ?? 'não informado'}.

Escreva um insight motivacional e prático com exatamente 2 frases curtas em português. Seja direto, use dados reais (kg, dias, ritmo), sem emojis. Se o progresso é positivo (perda de peso e objetivo é emagrecer, ou ganho de massa), elogie e projete o futuro. Se não há variação, encoraje a consistência. Se é negativo para o objetivo, seja honesto mas motivador e sugira uma ação concreta.`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 120,
    messages: [{ role: 'user', content: prompt }],
  })

  return (msg.content[0] as { type: string; text: string }).text.trim()
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { peso } = await req.json() as { peso: number }
  if (!peso || typeof peso !== 'number' || peso < 20 || peso > 400) {
    return NextResponse.json({ error: 'Peso inválido' }, { status: 400 })
  }

  const hoje = new Date().toISOString().slice(0, 10)

  // Upsert: 1 registro por dia
  const { data, error } = await supabase
    .from('peso_historico')
    .upsert(
      { user_id: user.id, peso: Math.round(peso * 10) / 10, data: hoje },
      { onConflict: 'user_id,data' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Atualiza user_profiles.peso
  await supabase
    .from('user_profiles')
    .update({ peso: Math.round(peso * 10) / 10 })
    .eq('id', user.id)

  // Gera insight IA se houver >= 3 registros
  const { data: historico } = await supabase
    .from('peso_historico')
    .select('data, peso')
    .eq('user_id', user.id)
    .order('data', { ascending: false })
    .limit(30)

  let insight: string | null = null

  if (historico && historico.length >= 3) {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('objetivo')
        .eq('id', user.id)
        .single()

      insight = await gerarInsight(
        historico.map(e => ({ data: e.data as string, peso: Number(e.peso) })),
        profile?.objetivo ?? null,
      )

      await supabase
        .from('user_profiles')
        .update({ peso_insight: insight, peso_insight_at: new Date().toISOString() })
        .eq('id', user.id)
    } catch {
      // Insight is non-critical — don't fail the request
    }
  }

  return NextResponse.json({ ok: true, data, insight })
}
