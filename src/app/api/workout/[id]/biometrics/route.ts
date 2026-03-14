import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface Props {
  params: Promise<{ id: string }>
}

interface BiometricPayload {
  fc_media?: number | null
  fc_maxima?: number | null
  calorias_reais?: number | null
  peso_treino?: number | null
}

export async function PATCH(request: Request, { params }: Props) {
  const { id: workoutId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let body: BiometricPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  // Only save fields that were actually provided
  const updates: Record<string, number | string | null> = { origem_bio: 'manual' }
  if (body.fc_media != null && body.fc_media > 0) updates.fc_media = body.fc_media
  if (body.fc_maxima != null && body.fc_maxima > 0) updates.fc_maxima = body.fc_maxima
  if (body.calorias_reais != null && body.calorias_reais > 0) updates.calorias_reais = body.calorias_reais
  if (body.peso_treino != null && body.peso_treino > 0) updates.peso_treino = body.peso_treino

  const { error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', workoutId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Erro ao salvar dados biométricos' }, { status: 500 })
  }

  // Se peso foi informado, atualiza também o perfil (mantém o LBS Score atualizado)
  if (body.peso_treino != null && body.peso_treino > 0) {
    await supabase
      .from('user_profiles')
      .update({ peso: body.peso_treino })
      .eq('id', user.id)
  }

  return NextResponse.json({ ok: true })
}
