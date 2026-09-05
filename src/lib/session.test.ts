// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createSessionToken,
  getSessionSecret,
  verifySessionToken,
} from './session'

const SECRET = 'test-secret-that-is-at-least-32-characters'

describe('session tokens', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET
  })

  afterEach(() => {
    process.env.SESSION_SECRET = SECRET
  })

  it('round-trips a session', async () => {
    const token = await createSessionToken({ userId: 'abc123', isAdmin: true })
    expect(await verifySessionToken(token)).toEqual({
      userId: 'abc123',
      isAdmin: true,
    })
  })

  it('rejects a token whose payload has been edited', async () => {
    // The whole reason a signed cookie can be trusted: the client holds the
    // claims and can read them, but changing isAdmin invalidates the signature.
    const token = await createSessionToken({ userId: 'abc123', isAdmin: false })
    const [header, payload, signature] = token.split('.')

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
    expect(decoded.isAdmin).toBe(false)
    decoded.isAdmin = true

    const forged = [
      header,
      Buffer.from(JSON.stringify(decoded)).toString('base64url'),
      signature,
    ].join('.')

    expect(await verifySessionToken(forged)).toBeNull()
  })

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken({ userId: 'abc123', isAdmin: true })
    process.env.SESSION_SECRET = 'a-completely-different-secret-32-chars'
    expect(await verifySessionToken(token)).toBeNull()
  })

  it('rejects an expired token', async () => {
    const { SignJWT } = await import('jose')
    const expired = await new SignJWT({ isAdmin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('abc123')
      .setIssuer('portfolio')
      .setIssuedAt(0)
      .setExpirationTime(1)
      .sign(new TextEncoder().encode(SECRET))

    expect(await verifySessionToken(expired)).toBeNull()
  })

  it('rejects a missing or unparseable token', async () => {
    expect(await verifySessionToken(undefined)).toBeNull()
    expect(await verifySessionToken('')).toBeNull()
    expect(await verifySessionToken('not-a-jwt')).toBeNull()
  })
})

describe('getSessionSecret', () => {
  afterEach(() => {
    process.env.SESSION_SECRET = SECRET
  })

  it('throws rather than falling back when the secret is missing', () => {
    // A default key here would mean a server that boots, looks healthy and
    // accepts forged sessions. The failure has to be loud.
    delete process.env.SESSION_SECRET
    expect(() => getSessionSecret()).toThrow(/SESSION_SECRET is not set/)
  })

  it('rejects a secret too short to be worth having', () => {
    process.env.SESSION_SECRET = 'short'
    expect(() => getSessionSecret()).toThrow(/at least 32 characters/)
  })
})
