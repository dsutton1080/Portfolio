// @vitest-environment node
//
// The middleware is the default-deny net: its job is to close routes that do
// not exist yet, so the cases worth pinning down are the shape of the policy
// rather than any one endpoint.

import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-characters'

import { middleware } from './middleware'
import { SESSION_COOKIE, createSessionToken } from '@/lib/session'

async function call(
  method: string,
  path: string,
  session?: { isAdmin: boolean },
) {
  const request = new NextRequest(`https://portfolio.test${path}`, { method })
  if (session) {
    request.cookies.set(
      SESSION_COOKIE,
      await createSessionToken({ userId: 'u1', isAdmin: session.isAdmin }),
    )
  }
  return middleware(request)
}

/** NextResponse.next() marks itself with this header. */
function isAllowed(response: Response) {
  return response.headers.get('x-middleware-next') === '1'
}

describe('middleware', () => {
  it('leaves public reads alone', async () => {
    expect(isAllowed(await call('GET', '/api/projects'))).toBe(true)
    expect(isAllowed(await call('GET', '/api/sections?path=all'))).toBe(true)
  })

  it('refuses anonymous writes', async () => {
    expect((await call('POST', '/api/projects')).status).toBe(401)
    expect((await call('PATCH', '/api/roles?id=1')).status).toBe(401)
    expect((await call('DELETE', '/api/experiences?id=1')).status).toBe(401)
  })

  it('closes a route that does not exist yet', async () => {
    // The property the per-handler checks cannot provide: a file added to
    // src/app/api later is denied before anyone remembers to guard it.
    expect((await call('POST', '/api/some-future-route')).status).toBe(401)
  })

  it('allows signing in and out without a session', async () => {
    expect(isAllowed(await call('POST', '/api/users?path=login'))).toBe(true)
    // Logout has to work from an expired session too, or the cookie sticks.
    expect(isAllowed(await call('POST', '/api/users?path=logout'))).toBe(true)
  })

  it('does not treat any other POST to /api/users as public', async () => {
    // Public signup is gone; this keeps the exemption from widening back out.
    expect((await call('POST', '/api/users?path=signup')).status).toBe(401)
    expect((await call('POST', '/api/users')).status).toBe(401)
  })

  it('sends an anonymous visitor away from /admin', async () => {
    const response = await call('GET', '/admin')
    expect(response.status).toBe(307)
    const location = new URL(response.headers.get('location')!)
    expect(location.pathname).toBe('/login')
    expect(location.searchParams.get('redirectTo')).toBe('/admin')
  })

  it('sends a signed-in non-admin away from /admin', async () => {
    const response = await call('GET', '/admin', { isAdmin: false })
    expect(response.status).toBe(307)
  })

  it('lets an admin into /admin and through to writes', async () => {
    expect(isAllowed(await call('GET', '/admin', { isAdmin: true }))).toBe(true)
    expect(
      isAllowed(await call('POST', '/api/projects', { isAdmin: true })),
    ).toBe(true)
  })

  it('does not let a non-admin session write', async () => {
    expect((await call('POST', '/api/projects', { isAdmin: false })).status).toBe(401)
  })
})
