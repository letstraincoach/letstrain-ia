import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getTrainer } from '@/lib/trainers/config'
import { NextResponse } from 'next/server'

export const maxDuration = 30

const CATEGORIA_LABELS: Record<string, string> = {
  treino: 'Treino',
  nutrição: 'Nutrição',
  recuperacao: 'Recuperação',
  mindset: 'Mindset',
}

async function generateTip(params: {
  firstName: string
  trainerNome: string
  trainerEstilo: string
  nivel: string
  objetivo: string
  streak: number
  treinosTotal: number
  ultimoTreino: string | null
  apiKey: string
}): Promise<{ tip: string; categoria: string }> {
  const objetivoLabel: Record<string, string> = {
    perda_peso: 'perda de gordura',
    ganho_massa: 'ganho de massa muscular',
    qualidade_vida: 'qualidade de vida e saúde',
  }

  const objetivos = params.objetivo
    .split(',')
    .map((o) => objetivoLabel[o.trim()] ?? o.trim())
    .join(' e ')

  const prompt = `Você é ${params.trainerNome}, personal trainer certificado. Estilo: ${params.trainerEstilo}.
Envie UMA dica personalizada para ${params.firstName} em 2 frases diretas e motivadoras.

Perfil do aluno:
- Nível: ${params.nivel.replace(/_/g, ' ')}
- Objetivo: ${objetivos}
- Treinos concluídos: ${params.treinosTotal}
- Sequência atual: ${params.streak} dias
${params.ultimoTreino ? `- Último treino: ${params.ultimoTreino}` : ''}

Categorize em uma das opções: treino, nutrição, recuperacao, mindset.
Responda APENAS com JSON válido: {"tip": "...", "categoria": "..."}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': params.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`Anthropic ${res.status}`)
  const data = await res.json() as { content: { type: string; text: string }[] }
  const text = data.content[0]?.type === 'text' ? data.content[0].text : ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('JSON not found')
  const parsed = JSON.parse(match[0]) as { tip?: string; categoria?: string }
  return {
    tip: parsed.tip ?? 'Consistência é o segredo. Cada treino conta!',
    categoria: parsed.categoria && CATEGORIA_LABELS[parsed.categoria] ? parsed.categoria : 'treino',
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

  // Verificar se já existe dica para hoje (idempotente)
  const { data: existing } = await supabase
    .from('daily_tips')
    .select('tip, categoria')
    .eq('user_id', user.id)
    .eq('data', hoje)
    .maybeSingle()

  if (existing) return NextResponse.json(existing)

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('nome, nivel_atual, objetivo, personal_slug')
    .eq('id', user.id)
    .single()

  const { data: progress } = await supabase
    .from('user_progress')
    .select('treinos_totais, streak_atual')
    .eq('id', user.id)
    .single()

  const { data: lastWorkout } = await supabase
    .from('workouts')
    .select('exercicios')
    .eq('user_id', user.id)
    .eq('status', 'executado')
    .order('executado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  const firstName = profile?.nome?.split(' ')[0] ?? 'Atleta'
  const trainer = getTrainer(profile?.personal_slug)
  const ultimoTreino = (lastWorkout?.exercicios as { nome?: string } | null)?.nome ?? null

  // Gerar dica com Claude Haiku
  const { tip, categoria } = await generateTip({
    firstName,
    trainerNome: trainer.nome,
    trainerEstilo: trainer.estilo,
    nivel: profile?.nivel_atual ?? 'iniciante',
    objetivo: profile?.objetivo ?? 'qualidade_vida',
    streak: progress?.streak_atual ?? 0,
    treinosTotal: progress?.treinos_totais ?? 0,
    ultimoTreino,
    apiKey,
  })

  // Salvar no banco (service client para bypass RLS)
  const svc = createServiceClient()
  await svc.from('daily_tips').upsert(
    { user_id: user.id, data: hoje, tip, categoria, personal_slug: profile?.personal_slug ?? 'guilherme' },
    { onConflict: 'user_id,data', ignoreDuplicates: true }
  )

  return NextResponse.json({ tip, categoria })
}
