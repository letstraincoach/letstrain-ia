import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export const maxDuration = 30

interface Palavra {
  versiculo_referencia: string
  versiculo_texto: string
  interpretacao: string
}

async function generatePalavra(apiKey: string): Promise<Palavra> {
  const prompt = `Você é um ministro cristão e conselheiro espiritual.

Selecione UM versículo bíblico poderoso e adequado para alguém que está:
- Desmotivado, sem energia para se exercitar
- Possivelmente deprimido ou em isolamento
- Precisando de força para se levantar e agir
- Buscando propósito e esperança

Priorize versículos de: Salmos, Filipenses, Isaías, João, Romanos, Provérbios, Josué, Jeremias, Efésios, Gálatas.
Use linguagem da Bíblia NVT (Nova Versão Transformadora) em português brasileiro.

Após o versículo, escreva uma INTERPRETAÇÃO PRÁTICA de 2 a 3 frases, conectando a palavra ao dia a dia de quem está em casa, sedentário, querendo mudar mas sem força para começar. Seja caloroso, encorajador e próximo — não pregue, acolha.

Responda SOMENTE com JSON válido:
{
  "versiculo_referencia": "Livro capítulo:versículo",
  "versiculo_texto": "O texto completo do versículo em português",
  "interpretacao": "A interpretação prática e encorajadora de 2 a 3 frases"
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`Anthropic ${res.status}`)
  const data = await res.json() as { content: { type: string; text: string }[] }
  const text = data.content[0]?.type === 'text' ? data.content[0].text : ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('JSON not found in response')
  const parsed = JSON.parse(match[0]) as Partial<Palavra>

  return {
    versiculo_referencia: parsed.versiculo_referencia ?? 'Filipenses 4:13',
    versiculo_texto: parsed.versiculo_texto ?? 'Tudo posso naquele que me fortalece.',
    interpretacao: parsed.interpretacao ?? 'Deus te equipou com uma força que você ainda não conhece por completo. Hoje é o dia de dar o primeiro passo — seja levantar, se mover, cuidar do seu corpo. Ele está com você.',
  }
}

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Data de hoje em Brasília (UTC-3)
  const hoje = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Cache: verifica se já existe palavra gerada hoje
  const { data: existing } = await supabase
    .from('palavras_do_dia')
    .select('versiculo_referencia, versiculo_texto, interpretacao')
    .eq('user_id', user.id)
    .eq('data', hoje)
    .maybeSingle()

  if (existing) return NextResponse.json(existing)

  // Gera nova palavra com Claude Haiku
  const palavra = await generatePalavra(apiKey)

  // Persiste para não rechamar a IA no mesmo dia
  const svc = createServiceClient()
  await svc.from('palavras_do_dia').upsert(
    {
      user_id: user.id,
      data: hoje,
      versiculo_referencia: palavra.versiculo_referencia,
      versiculo_texto: palavra.versiculo_texto,
      interpretacao: palavra.interpretacao,
    },
    { onConflict: 'user_id,data', ignoreDuplicates: true }
  )

  return NextResponse.json(palavra)
}
