import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Prevent double-start: check if already fasting
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('jejum_inicio')
    .eq('id', user.id)
    .single()

  if (profile?.jejum_inicio) {
    return NextResponse.json({ ok: true, jejum_inicio: profile.jejum_inicio })
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from('user_profiles')
    .update({ jejum_inicio: now })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Erro ao iniciar jejum' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, jejum_inicio: now })
}
