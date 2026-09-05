// @vitest-environment node
//
// Every mutating handler must refuse an anonymous caller, and must refuse it
// before touching the database.
//
// Issue #12: `DELETE /api/projects` answered a stranger with 400 "ID is
// required" rather than 401, which meant the handler was running for anonymous
// callers and would have gone on to delete given a valid id. A 400 there is the
// tell, so these tests assert the status code rather than just "not a 2xx".
//
// This is also the guard that makes "a new route is not open by default"
// checkable: adding a mutating export without a requireAdmin() call fails here.

import { beforeEach, describe, expect, it, vi } from 'vitest'

process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-characters'

const cookieValue = vi.fn<() => string | undefined>(() => undefined)

vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => {
    const value = cookieValue()
    return value === undefined ? undefined : { value }
  } }),
}))

// Any property access throws, so a handler that reaches Prisma without passing
// the guard fails loudly instead of quietly returning some other status.
vi.mock('@/lib/prisma', () => ({
  prisma: new Proxy(
    {},
    {
      get(_target, model) {
        throw new Error(
          `Reached the database (prisma.${String(model)}) without authorisation`,
        )
      },
    },
  ),
}))

import * as content from '../sections/[id]/route'
import * as experiences from '../experiences/route'
import * as projects from '../projects/route'
import * as roles from '../roles/route'
import * as sections from '../sections/route'
import { createSessionToken } from '@/lib/session'

type Handler = (request: Request, context?: any) => Promise<Response>

const params = { params: { id: '507f1f77bcf86cd799439011' } }

const mutations: Array<[string, Handler, string, string]> = [
  ['POST /api/projects', projects.POST, 'POST', '/api/projects'],
  ['PATCH /api/projects', projects.PATCH, 'PATCH', '/api/projects?id=1'],
  ['DELETE /api/projects', projects.DELETE, 'DELETE', '/api/projects?id=1'],
  ['POST /api/experiences', experiences.POST, 'POST', '/api/experiences'],
  ['PATCH /api/experiences', experiences.PATCH, 'PATCH', '/api/experiences?id=1'],
  ['DELETE /api/experiences', experiences.DELETE, 'DELETE', '/api/experiences?id=1'],
  ['POST /api/roles', roles.POST, 'POST', '/api/roles'],
  ['PATCH /api/roles', roles.PATCH, 'PATCH', '/api/roles?id=1'],
  ['DELETE /api/roles', roles.DELETE, 'DELETE', '/api/roles?id=1'],
  ['POST /api/sections', sections.POST, 'POST', '/api/sections'],
  ['DELETE /api/sections', sections.DELETE, 'DELETE', '/api/sections?id=1'],
  ['PATCH /api/sections/[id]', content.PATCH, 'PATCH', '/api/sections/1'],
  ['DELETE /api/sections/[id]', content.DELETE, 'DELETE', '/api/sections/1'],
]

function request(method: string, path: string, body: unknown = {}) {
  return new Request(`https://portfolio.test${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(method === 'DELETE' ? {} : { body: JSON.stringify(body) }),
  })
}

describe('mutating route handlers', () => {
  beforeEach(() => {
    cookieValue.mockReturnValue(undefined)
  })

  it.each(mutations)('%s rejects an anonymous caller', async (_name, handler, method, path) => {
    const response = await handler(request(method, path), params)
    expect(response.status).toBe(401)
  })

  it.each(mutations)('%s rejects a forged cookie', async (_name, handler, method, path) => {
    cookieValue.mockReturnValue('not.a.valid.token')
    const response = await handler(request(method, path), params)
    expect(response.status).toBe(401)
  })

  it.each(mutations)('%s rejects a signed-in non-admin', async (_name, handler, method, path) => {
    cookieValue.mockReturnValue(
      await createSessionToken({ userId: 'u1', isAdmin: false }),
    )
    const response = await handler(request(method, path), params)
    expect(response.status).toBe(403)
  })

  it.each(mutations)('%s lets an admin through to the database', async (_name, handler, method, path) => {
    // The mirror of the tests above: without this they would all still pass if
    // the guard denied everyone, which is a broken admin panel rather than a
    // secure one.
    //
    // Reaching the Prisma proxy is what "got past the guard" looks like here.
    // The handlers catch it and answer 500, so the proof is in what they
    // logged - which incidentally also checks that the detail stays in the log
    // and out of the response body.
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    cookieValue.mockReturnValue(
      await createSessionToken({ userId: 'u1', isAdmin: true }),
    )

    const response = await handler(request(method, path), params)

    expect(response.status).toBe(500)
    expect(logged.mock.calls.flat().map(String).join(' ')).toMatch(
      /without authorisation/,
    )
    await expect(response.json()).resolves.not.toHaveProperty(
      'error',
      expect.stringContaining('prisma'),
    )
  })
})

describe('/api/users', () => {
  it('no longer exposes user listing, lookup, update or delete', async () => {
    // These had no caller in the UI and between them leaked the password hash
    // and allowed mass assignment of isAdmin. Deleted rather than guarded.
    const users = await import('../users/route')
    expect('GET' in users).toBe(false)
    expect('PATCH' in users).toBe(false)
    expect('DELETE' in users).toBe(false)
    expect(typeof users.POST).toBe('function')
  })
})
