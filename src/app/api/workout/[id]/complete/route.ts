import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Verificar que o treino pertence ao usuário e ainda não foi executado
  const { data: workout } = await supabase
    .from('workouts')
    .select('id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!workout) {
    return NextResponse.json({ error: 'Treino não encontrado' }, { status: 404 })
  }

  if (workout.status === 'executado') {
    // Já executado — idempotente, retorna ok
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase
    .from('workouts')
    .update({
      status: 'executado',
      executado_em: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Erro ao concluir treino' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
