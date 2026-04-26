import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/admin', '/dashboard']
const AUTH_ROUTES = ['/login', '/register']
// Routes publiques : pas de vérification auth, accès libre
const PUBLIC_ROUTES = ['/demo', '/signup', '/rdv', '/guide', '/api/rdv']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { pathname } = request.nextUrl

  // Court-circuit immédiat pour toutes les routes publiques
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  if (isPublicRoute) return supabaseResponse

  // Variables d'env manquantes → on laisse passer sans bloquer
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do NOT remove, required for SSR auth
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Si Supabase est injoignable, on laisse passer (pas de blocage)
    return supabaseResponse
  }

  const isDemo = request.nextUrl.searchParams.get('demo') === 'true'
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // 2. Dashboard en mode démo — accessible sans auth
  if (pathname.startsWith('/dashboard') && isDemo) return supabaseResponse

  // 3. Routes protégées sans session → login
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Utilisateur connecté sur login/register → dashboard
  if (isAuthRoute && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    dashboardUrl.searchParams.delete('redirect')
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public assets
     * - /rdv, /guide (pages publiques sans auth)
     * - /api/rdv/* (API publique RDV)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|rdv|guide|api/rdv|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)',
  ],
}
