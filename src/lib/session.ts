// Server-side session handling.
//
// HTTP is stateless, so identity has to travel with every request in something
// the browser cannot author. That is a signed JWT in an httpOnly cookie: the
// browser stores and returns it but cannot read it from JavaScript, and any
// edit invalidates the signature.
//
// `src/lib/auth.ts` also holds a user object, in localStorage. That copy is
// decoration - it decides whether the nav renders an "Admin" link. Nothing here
// reads it, and no authorisation decision anywhere may depend on it.
//
// Everything in this file has to run in the Edge runtime as well as Node,
// because `src/middleware.ts` imports it and Next 14 always runs middleware on
// Edge. That rules out `node:crypto` and Prisma; `jose` is built on Web Crypto
// and works in both.

import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'portfolio_session'

const ISSUER = 'portfolio'
const ALGORITHM = 'HS256'

/**
 * Seven days. The token is stateless - nothing is stored server-side - so this
 * is also the revocation window: a session cannot be cancelled early, it can
 * only expire. Rotating SESSION_SECRET invalidates every session immediately,
 * which is the "log everyone out" lever if one is ever needed.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

/** The minimum that makes an HMAC-SHA256 key worth having. */
const MIN_SECRET_LENGTH = 32

export interface Session {
  userId: string
  isAdmin: boolean
}

/**
 * Read and validate SESSION_SECRET.
 *
 * Throwing here is deliberate. The alternative - falling back to a default key
 * when the variable is missing - produces a server that boots, serves 200s and
 * looks healthy while accepting forged sessions. A missing secret has to be a
 * loud failure, so this throws on every call and `src/instrumentation.ts` calls
 * it once at startup to surface the problem before any request arrives.
 */
export function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET

  if (!secret) {
    throw new Error(
      'SESSION_SECRET is not set. Generate one with `openssl rand -base64 32`.',
    )
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters (got ${secret.length}).`,
    )
  }

  return new TextEncoder().encode(secret)
}

/**
 * `isAdmin` is copied into the token rather than looked up per request, because
 * middleware runs on Edge and cannot reach the database. The cost is staleness:
 * revoking admin on a user does not take effect until their token expires. At
 * one administrator that is a fair trade; with a real user table it would not
 * be, and the check would have to move to the route handlers where Prisma is
 * available.
 */
export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ isAdmin: session.isAdmin })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(session.userId)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret())
}

/**
 * Returns null for anything that is not a currently valid token - bad
 * signature, expired, wrong issuer, unexpected claim shape. Callers get one
 * yes/no answer and cannot accidentally treat a malformed token as a session.
 */
export async function verifySessionToken(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      issuer: ISSUER,
      algorithms: [ALGORITHM],
    })

    // A token signed by us should always match, but the claims are still typed
    // `unknown` - verifying the signature says who wrote the payload, not that
    // its shape is what this version of the code expects.
    if (typeof payload.sub !== 'string') return null
    if (typeof payload.isAdmin !== 'boolean') return null

    return { userId: payload.sub, isAdmin: payload.isAdmin }
  } catch {
    return null
  }
}

/**
 * `secure` is conditional only so that plain-HTTP local development still
 * works; production is served over HTTPS. `sameSite: 'lax'` is enough because
 * every caller is same-origin, and it keeps the cookie off cross-site requests,
 * which is what makes CSRF a non-issue for the mutating routes.
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}
