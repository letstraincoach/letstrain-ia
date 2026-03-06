import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildWorkoutPrompt } from '@/lib/ai/workout-generator'
import { WorkoutSchema, type GeneratedWorkout } from '@/lib/ai/workout-schemas'
import { NextResponse } from 'next/server'
import type { Json } from '@/types/database.types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface CheckinPayload {
  local_treino?: string
  ultima_refeicao: string
  tempo_disponivel: number
  disposicao: number
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let checkin: CheckinPayload
  try {
    checkin = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  // Buscar perfil + equipamentos do usuário em paralelo
  const [profileResult, equipamentosResult, historicoResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select(
        'nivel_atual, objetivo, preferencia_treino, lesao_cronica, lesao_descricao, doenca_cardiaca, local_treino'
      )
      .eq('id', user.id)
      .single(),

    supabase
      .from('user_equipment')
      .select('nome_custom, equipment_catalog(nome)')
      .eq('user_id', user.id),

    supabase
      .from('workouts')
      .select('exercicios')
      .eq('user_id', user.id)
      .eq('status', 'executado')
      .order('criado_em', { ascending: false })
      .limit(3),
  ])

  if (profileResult.error || !profileResult.data) {
    return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 })
  }

  const profile = profileResult.data

  // Montar lista de equipamentos (nome_custom tem prioridade, senão nome do catálogo)
  const equipamentos: string[] = (equipamentosResult.data ?? []).map((e) => {
    if (e.nome_custom) return e.nome_custom
    const catalog = e.equipment_catalog as { nome: string } | null
    return catalog?.nome ?? ''
  }).filter(Boolean)

  // Montar histórico: extrair nomes dos exercícios principais dos últimos 3 treinos
  const historico = (historicoResult.data ?? []).map((w) => {
    const exercicios = w.exercicios as { principal?: { nome: string }[] }
    const principais = (exercicios?.principal ?? []).map((e) => e.nome)
    return { exercicios_principais: principais }
  })

  const context = {
    nivel: profile.nivel_atual as Parameters<typeof buildWorkoutPrompt>[0]['nivel'],
    objetivo: profile.objetivo ?? 'qualidade_vida',
    preferencia_treino: profile.preferencia_treino ?? 'grupos_musculares',
    lesao_cronica: profile.lesao_cronica ?? false,
    lesao_descricao: profile.lesao_descricao,
    doenca_cardiaca: profile.doenca_cardiaca ?? false,
    local_treino: (checkin.local_treino ?? profile.local_treino) as Parameters<typeof buildWorkoutPrompt>[0]['local_treino'],
    equipamentos,
    ultima_refeicao: checkin.ultima_refeicao,
    tempo_disponivel: checkin.tempo_disponivel,
    disposicao: checkin.disposicao,
    historico_recente: historico,
  }

  const prompt = buildWorkoutPrompt(context)

  // Chamar Claude com retry em caso de JSON inválido
  let generatedWorkout: GeneratedWorkout | null = null
  let lastError: unknown = null

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      })

      const rawText =
        response.content[0].type === 'text' ? response.content[0].text : ''

      // Extrair JSON (defensivo contra prefixos de texto)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Resposta sem JSON')

      const parsed = JSON.parse(jsonMatch[0])
      generatedWorkout = WorkoutSchema.parse(parsed)
      break
    } catch (err) {
      lastError = err
      if (attempt === 2) break
      // Aguardar brevemente antes da 2ª tentativa
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  if (!generatedWorkout) {
    console.error('[workout/generate] Falha após 2 tentativas:', lastError)
    return NextResponse.json(
      { error: 'Não foi possível gerar o treino. Tente novamente.' },
      { status: 503 }
    )
  }

  // Salvar treino no banco
  const { data: savedWorkout, error: saveError } = await supabase
    .from('workouts')
    .insert([{
      user_id: user.id,
      data: new Date().toISOString().split('T')[0],
      nivel: profile.nivel_atual,
      local_treino: checkin.local_treino ?? profile.local_treino ?? 'condominio',
      duracao_estimada: generatedWorkout.duracao_estimada,
      checkin_ultima_refeicao: checkin.ultima_refeicao,
      checkin_tempo_disponivel: checkin.tempo_disponivel,
      checkin_disposicao: checkin.disposicao,
      exercicios: generatedWorkout as unknown as Json,
      status: 'gerado',
    }])
    .select('id')
    .single()

  if (saveError || !savedWorkout) {
    console.error('[workout/generate] Erro ao salvar treino:', saveError)
    return NextResponse.json(
      { error: 'Treino gerado mas não foi possível salvar. Tente novamente.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    workout_id: savedWorkout.id,
    workout: generatedWorkout,
  })
}
