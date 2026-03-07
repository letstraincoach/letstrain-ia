import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rotas que exigem auth + assinatura ativa
const PROTECTED_ROUTES = ['/dashboard', '/workout', '/progress', '/settings']
// Rotas que exigem auth mas não assinatura (onboarding + página de assinatura)
const AUTH_ONLY_ROUTES = ['/assinatura', '/quiz', '/local', '/nivel', '/equipamentos', '/desempenho']
// Rotas de autenticação (redirect para dashboard se já logado)
const AUTH_PAGES = ['/login', '/cadastro', '/recuperar-senha', '/nova-senha']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAuthPage = AUTH_PAGES.some((p) => path.startsWith(p))
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((p) => path.startsWith(p))
  const isProtectedRoute = PROTECTED_ROUTES.some((p) => path.startsWith(p))

  // Sem sessão → redirecionar para login
  if (!user && (isProtectedRoute || isAuthOnlyRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Já logado tentando acessar página de auth → dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Verificação de assinatura (rotas protegidas do app)
  if (user && isProtectedRoute) {
    const gracePeriodEnd = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()

    // Assinatura ativa (com grace period de 3 dias)
    const { data: activeSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'ativa')
      .gte('fim', gracePeriodEnd)
      .limit(1)
      .maybeSingle()

    // Trial válido (trial_ends_at no futuro)
    const { data: trialSub } = !activeSub ? await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'trial')
      .gt('trial_ends_at', now)
      .limit(1)
      .maybeSingle() : { data: null }

    if (!activeSub && !trialSub) {
      return NextResponse.redirect(new URL('/assinatura', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|manifest\\.json|sw\\.js)$).*)',
  ],
}
