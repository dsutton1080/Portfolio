// Error responses for route handlers.
//
// The handlers used to return `error.message` straight to the caller. Prisma's
// messages name models, fields and constraints, so a few malformed requests
// returned a usable sketch of the schema. Logs and responses have opposite
// audiences: the log wants everything, the client wants to know only that it
// failed.

import { NextResponse } from 'next/server'

/**
 * Log the real error, return a generic one.
 *
 * `context` is a short label identifying the call site, so a 500 seen by a user
 * can still be found in the log without the response carrying any detail.
 */
export function serverError(context: string, error: unknown): NextResponse {
  console.error(`[${context}]`, error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

/** A malformed or missing request body. */
export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 })
}

/**
 * Parse a JSON body, returning null rather than throwing when it is absent or
 * malformed - which is a client mistake (400), not a server fault (500).
 */
export async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return null
    }
    return body as Record<string, unknown>
  } catch {
    return null
  }
}
