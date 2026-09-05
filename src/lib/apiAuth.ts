// Per-request authorisation for route handlers.
//
// `src/middleware.ts` already refuses unauthenticated writes before they reach
// a handler. This is the second, independent check, and the redundancy is the
// point: the two fail for unrelated reasons. Middleware fails by matcher
// misconfiguration - silently, with nothing red in CI - while a handler check
// fails by being left out, which is visible in the diff and catchable by a
// test. Either one alone has a blind spot the other covers.

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, type Session, verifySessionToken } from '@/lib/session'

/** Read the caller's session, or null if they do not have a valid one. */
export async function getSession(): Promise<Session | null> {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value)
}

/**
 * Guard for every mutating handler. Returns a response to send when the caller
 * is not an administrator, and null when they are:
 *
 *     const denied = await requireAdmin()
 *     if (denied) return denied
 *
 * The null-means-allowed shape is deliberate - forgetting to handle the return
 * value leaves an unused variable that lint flags, whereas a boolean would fail
 * open on `if (isAdmin)` written the wrong way round.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getSession()

  // 401 for "we do not know who you are", 403 for "we do, and the answer is
  // no". Both bodies are generic: a distinct "not an admin" message would
  // confirm to an anonymous caller that their forged token parsed.
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
