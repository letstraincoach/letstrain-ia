import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completo, onboarding_etapa')
          .eq('id', user.id)
          .single()

        if (!profile?.onboarding_completo) {
          const etapa = profile?.onboarding_etapa
          const redirectPath = etapa && etapa !== 'completo'
            ? (etapa.startsWith('/') ? etapa : '/' + etapa)
            : '/quiz'
          return NextResponse.redirect(`${origin}${redirectPath}`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
