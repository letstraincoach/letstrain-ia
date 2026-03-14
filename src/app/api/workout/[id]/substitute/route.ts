import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import type { Json } from '@/types/database.types'

const MAX_SUBSTITUICOES = 3

type WorkoutJson = {
  preparacao?: { nome: string }[]
  forca?: { nome: string }[]
  circuito?: { nome: string }[]
  cardio?: { nome: string }[]
  finisher?: { nome: string }[]
  substituicoes?: number
  [key: string]: unknown
}

// POST — buscar alternativas
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workoutId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { grupoMuscular } = await request.json() as { grupoMuscular: string }
  if (!grupoMuscular) return NextResponse.json({ error: 'grupoMuscular obrigatório' }, { status: 400 })

  // Buscar workout + perfil em paralelo
  const [{ data: workout }, { data: profile }] = await Promise.all([
    supabase
      .from('workouts')
      .select('exercicios, nivel, local_treino')
      .eq('id', workoutId)
      .eq('user_id', user.id)
      .eq('status', 'gerado')
      .single(),
    supabase
      .from('user_profiles')
      .select('nivel_atual, local_treino')
      .eq('id', user.id)
      .single(),
  ])

  if (!workout) return NextResponse.json({ error: 'Treino não encontrado' }, { status: 404 })

  const exercicios = workout.exercicios as WorkoutJson
  const subsFeitas = exercicios.substituicoes ?? 0
  if (subsFeitas >= MAX_SUBSTITUICOES) {
    return NextResponse.json({ error: 'Limite de 3 trocas atingido' }, { status: 429 })
  }

  // Nomes de exercícios já no treino (para excluir)
  const nomesNoTreino = new Set<string>()
  for (const secao of ['preparacao', 'forca', 'circuito', 'cardio', 'finisher'] as const) {
    const lista = exercicios[secao]
    if (Array.isArray(lista)) lista.forEach((e) => nomesNoTreino.add(e.nome))
  }

  // Buscar alternativas do catálogo
  const local = (profile?.local_treino ?? workout.local_treino ?? 'condominio') as string
  const localNorm = local === 'hotel' ? 'condominio' : local

  // Normaliza grupo muscular: lowercase + pega só a primeira palavra (IA pode gerar "Peito e Ombros")
  const grupoNorm = grupoMuscular.toLowerCase().split(/\s+e\s+|\s*[,/]\s*/)[0].trim()

  const serviceClient = createServiceClient()

  // Tenta buscar por grupo muscular exato (case-insensitive) com filtro de local
  let { data: catalogExercises } = await serviceClient
    .from('exercise_catalog')
    .select('nome, instrucoes, equipamentos, grupo_muscular')
    .eq('ativo', true)
    .ilike('grupo_muscular', grupoNorm)
    .contains('locais', [localNorm])
    .limit(20)

  // Fallback: se não encontrou, busca sem filtro de grupo (mesmo local)
  if (!catalogExercises || catalogExercises.length === 0) {
    const { data: fallback } = await serviceClient
      .from('exercise_catalog')
      .select('nome, instrucoes, equipamentos, grupo_muscular')
      .eq('ativo', true)
      .contains('locais', [localNorm])
      .limit(20)
    catalogExercises = fallback
  }

  // Filtrar os que já estão no treino e pegar 5
  const alternatives = (catalogExercises ?? [])
    .filter((e) => !nomesNoTreino.has(e.nome))
    .slice(0, 5)
    .map((e) => ({
      nome: e.nome,
      instrucoes: e.instrucoes,
      equipamentos: e.equipamentos ?? [],
    }))

  return NextResponse.json({
    alternatives,
    substituicoesRestantes: MAX_SUBSTITUICOES - subsFeitas,
  })
}

// PATCH — aplicar substituição
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workoutId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { secao, exerciseIndex, novoExercicio } = await request.json() as {
    secao: string
    exerciseIndex: number
    novoExercicio: { nome: string; instrucoes: string }
  }

  if (!secao || exerciseIndex === undefined || !novoExercicio?.nome) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  const { data: workout } = await supabase
    .from('workouts')
    .select('exercicios')
    .eq('id', workoutId)
    .eq('user_id', user.id)
    .eq('status', 'gerado')
    .single()

  if (!workout) return NextResponse.json({ error: 'Treino não encontrado' }, { status: 404 })

  const exercicios = workout.exercicios as WorkoutJson
  const subsFeitas = exercicios.substituicoes ?? 0
  if (subsFeitas >= MAX_SUBSTITUICOES) {
    return NextResponse.json({ error: 'Limite de 3 trocas atingido' }, { status: 429 })
  }

  const lista = exercicios[secao]
  if (!Array.isArray(lista) || !lista[exerciseIndex]) {
    return NextResponse.json({ error: 'Exercício não encontrado na seção' }, { status: 400 })
  }

  // Substituir: manter series/reps/descanso, trocar nome + instrucoes
  lista[exerciseIndex] = {
    ...lista[exerciseIndex],
    nome: novoExercicio.nome,
    instrucoes: novoExercicio.instrucoes,
  }
  exercicios.substituicoes = subsFeitas + 1

  const { error: updateError } = await supabase
    .from('workouts')
    .update({ exercicios: exercicios as unknown as Json })
    .eq('id', workoutId)

  if (updateError) {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    exercicioAtualizado: lista[exerciseIndex],
    substituicoesRestantes: MAX_SUBSTITUICOES - (subsFeitas + 1),
  })
}
