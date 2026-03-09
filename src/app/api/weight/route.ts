import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { peso } = await req.json() as { peso: number }
  if (!peso || typeof peso !== 'number' || peso < 20 || peso > 400) {
    return NextResponse.json({ error: 'Peso inválido' }, { status: 400 })
  }

  const hoje = new Date().toISOString().slice(0, 10)

  // Upsert: only 1 record per day
  const { data, error } = await supabase
    .from('peso_historico')
    .upsert(
      { user_id: user.id, peso: Math.round(peso * 10) / 10, data: hoje },
      { onConflict: 'user_id,data' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also update user_profiles.peso with the latest weight
  await supabase
    .from('user_profiles')
    .update({ peso: Math.round(peso * 10) / 10 })
    .eq('id', user.id)

  return NextResponse.json({ ok: true, data })
}
