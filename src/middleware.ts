// Default-deny gate in front of /admin and the API.
//
// The value of putting this in middleware rather than only in the handlers is
// that it covers routes that do not exist yet: a file added to src/app/api six
// months from now is closed before a line of it is written. That is the
// property the handler-level checks cannot provide, and it is why both exist.
//
// Next 14 runs middleware in the Edge runtime - true even self-hosted under
// `next start`, because it is a framework decision rather than a deployment
// one. So there is no Prisma and no bcrypt here. Everything this file decides
// has to be decidable from the signed cookie alone.

import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

/** Methods that cannot change state, and so need no authorisation. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * The only writes an anonymous caller may make. Signing in has to be reachable
 * without already being signed in, and signing out has to work even from a
 * session this middleware would otherwise reject - a user with an expired
 * cookie clicking "Logout" should get it cleared, not a 401.
 *
 * Everything absent from this list is denied, which is the direction that fails
 * safely: forgetting to add a route here breaks a feature loudly, whereas
 * forgetting to add one to a blocklist exposes it silently.
 */
function isPublicWrite(request: NextRequest): boolean {
  if (request.nextUrl.pathname !== '/api/users') return false
  if (request.method !== 'POST') return false

  const path = request.nextUrl.searchParams.get('path')
  return path === 'login' || path === 'logout'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  )
  const isAdmin = session?.isAdmin === true

  if (pathname.startsWith('/admin')) {
    if (isAdmin) return NextResponse.next()

    // Redirect rather than 403 so a signed-out admin following a bookmark gets
    // somewhere useful. `redirectTo` is a path from our own URL object, so it
    // cannot be pointed at another origin by crafting the request.
    const login = new URL('/login', request.url)
    login.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(login)
  }

  if (pathname.startsWith('/api')) {
    // Portfolio content is public; only writes are gated.
    if (SAFE_METHODS.has(request.method)) return NextResponse.next()
    if (isPublicWrite(request)) return NextResponse.next()
    if (isAdmin) return NextResponse.next()

    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/api/:path*'],
}
