// src/lib/auth.ts

import { isRecord, optionalString } from '@/lib/validate'

/**
 * What `/api/users?path=login` returns and what the UI stores: enough to greet
 * the user and decide whether to show the admin link. Never the password hash.
 */
export interface SessionUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  isAdmin?: boolean
}

const USER_KEY = 'user'

export function loginUser(user: SessionUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function logoutUser() {
  localStorage.removeItem(USER_KEY)
}

/**
 * localStorage is user-writable and outlives deploys, so what comes back is
 * `unknown` - an old or hand-edited entry must not be handed on as a
 * SessionUser.
 */
export function getCurrentUser(): SessionUser | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(USER_KEY)
  if (!stored) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(stored)
  } catch {
    return null
  }

  if (!isRecord(parsed)) return null
  const { id, email } = parsed
  if (typeof id !== 'string' || typeof email !== 'string') return null

  const firstName = optionalString(parsed.firstName)
  const lastName = optionalString(parsed.lastName)
  return {
    id,
    email,
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(typeof parsed.isAdmin === 'boolean' && { isAdmin: parsed.isAdmin }),
  }
}
