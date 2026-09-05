// Sign in and sign out. Nothing else.
//
// This file used to also expose user listing, lookup by id, update, delete and
// public signup. None of them had a caller in the UI, and between them they
// leaked the bcrypt hash and let any anonymous request set `isAdmin` on any
// account. Unused code cannot be verified by using the app, which is why the
// most dangerous handlers here were also the least exercised. They are gone
// rather than guarded: a deleted endpoint has no bugs, and git remembers it.
//
// The single administrator is created by `npm run seed:admin`.

import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { readJsonBody, serverError } from '@/lib/apiErrors'
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from '@/lib/session'

/**
 * A real bcrypt hash of a value nobody knows, compared against when the email
 * does not exist. Without it, a missing user returns as soon as the query does
 * while a real one waits for bcrypt, and the difference is measurable - so the
 * endpoint would answer "does this address have an account?" to anyone willing
 * to time it. Doing the same work either way keeps the two paths alike.
 */
const DUMMY_HASH = '$2b$10$EKRsRK3PvR/b3xd8a.hWWOYcZb1Bnq4ZahsRwBv.xOPX2CirHkQrC'

/** One message for every failure: a distinct "no such user" is an account oracle. */
const INVALID_CREDENTIALS = 'Invalid email or password'

async function handleLogin(request: Request) {
  const body = await readJsonBody(request)
  const email = body?.email
  const password = body?.password

  // Note the absence of any logging of `body`. It holds a plaintext password,
  // and logs travel further than the database: aggregators, backups, and
  // anyone with read access to a dashboard.
  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  const passwordMatch = await bcrypt.compare(
    password,
    user?.password || DUMMY_HASH,
  )

  if (!user || !passwordMatch) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 })
  }

  const token = await createSessionToken({
    userId: user.id,
    isAdmin: user.isAdmin,
  })

  // The body is what the client stores for display - a greeting and whether to
  // render the admin link. It is not what authorises anything; the cookie is.
  // Deliberately no `password` field, hashed or otherwise.
  const response = NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isAdmin: user.isAdmin,
  })
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  return response
}

function handleLogout() {
  const response = NextResponse.json({ ok: true })
  // maxAge 0 tells the browser to drop it. Every other attribute has to match
  // what was set, or the browser treats it as a different cookie and keeps the
  // original.
  response.cookies.set(SESSION_COOKIE, '', {
    ...sessionCookieOptions(),
    maxAge: 0,
  })
  return response
}

// POST /api/users?path=login | /api/users?path=logout
export async function POST(request: Request) {
  const path = new URL(request.url).searchParams.get('path')

  try {
    if (path === 'login') return await handleLogin(request)
    if (path === 'logout') return handleLogout()
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return serverError('POST /api/users', error)
  }
}
