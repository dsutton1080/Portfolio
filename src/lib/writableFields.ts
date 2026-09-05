// Explicit allowlists of the fields each API route may write.
//
// The handlers used to pass `await request.json()` straight to Prisma. That
// makes the set of writable fields implicit - whatever columns the model
// happens to have - so adding a column to schema.prisma silently adds a
// writable public field, with no change to any handler for a reviewer to
// notice. Naming the fields here inverts that: a new column is not writable
// until someone adds it to this file on purpose.
//
// This is not the same job as validation. Validation asks whether a value is
// well-formed; an allowlist asks whether the field is the caller's to write at
// all. `isAdmin` is the field that makes the difference obvious - a perfectly
// well-formed `true` still must never come from a request body.

import { isRecord } from '@/lib/validate'

type FieldType = 'string' | 'number' | 'optionalString' | 'optionalNumber'

type FieldSpec = Record<string, FieldType>

export type PickResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

function matches(type: FieldType, value: unknown): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string'
    case 'number':
      return typeof value === 'number' && Number.isFinite(value)
    case 'optionalString':
      return value === null || typeof value === 'string'
    case 'optionalNumber':
      return value === null || (typeof value === 'number' && Number.isFinite(value))
  }
}

/**
 * Copy across the fields named in `spec` that are present in `body`, and reject
 * anything whose type is wrong.
 *
 * Absent fields are left out rather than defaulted, so the same spec serves
 * both POST (client sends everything) and PATCH (client sends what changed).
 * Unknown keys are dropped silently: they carry no meaning to this route, and
 * echoing them back would tell a prober which columns exist.
 */
function pick<T>(spec: FieldSpec, body: unknown): PickResult<T> {
  if (!isRecord(body)) {
    return { ok: false, error: 'Expected a JSON object' }
  }

  const data: Record<string, unknown> = {}

  for (const [field, type] of Object.entries(spec)) {
    if (!(field in body)) continue

    const value = body[field]
    if (!matches(type, value)) {
      return { ok: false, error: `Invalid value for "${field}"` }
    }

    data[field] = value
  }

  return { ok: true, data: data as T }
}

// The specs below mirror prisma/schema.prisma, minus anything the client has no
// business setting: `id` is assigned by the database, and `section_id` is a
// relation the section routes own.

export interface ProjectFields {
  name?: string
  description?: string
  link?: string
  label?: string
  order?: number | null
  logo?: string | null
}

export function pickProjectFields(body: unknown): PickResult<ProjectFields> {
  return pick(
    {
      name: 'string',
      description: 'string',
      link: 'string',
      label: 'string',
      order: 'optionalNumber',
      logo: 'optionalString',
    },
    body,
  )
}

export interface ExperienceFields {
  title?: string
  content?: string
  date?: string
}

export function pickExperienceFields(body: unknown): PickResult<ExperienceFields> {
  return pick(
    {
      title: 'string',
      content: 'string',
      date: 'string',
    },
    body,
  )
}

export interface RoleFields {
  company?: string
  title?: string
  logo?: string | null
  start?: string
  end?: string
  order?: number | null
}

export function pickRoleFields(body: unknown): PickResult<RoleFields> {
  return pick(
    {
      company: 'string',
      title: 'string',
      logo: 'optionalString',
      start: 'string',
      end: 'string',
      order: 'optionalNumber',
    },
    body,
  )
}

export interface SectionFields {
  title?: string
  header?: string | null
  subHeader?: string | null
  order?: number | null
}

export function pickSectionFields(body: unknown): PickResult<SectionFields> {
  return pick(
    {
      title: 'string',
      header: 'optionalString',
      subHeader: 'optionalString',
      order: 'optionalNumber',
    },
    body,
  )
}

export interface ContentRow {
  content: string
  order: number
}

/**
 * The rows nested under `contents.records` on POST /api/sections.
 *
 * `section_id` is pointedly not accepted. It is the relation Prisma sets from
 * the section being created, and taking it from the body would let a caller
 * attach content rows to somebody else's section - the same mass-assignment
 * shape as `isAdmin`, one level down in the object graph. Nested writes are
 * easy to overlook precisely because the dangerous field is not top-level.
 */
export function pickContentRows(value: unknown): PickResult<ContentRow[]> {
  if (value === undefined) return { ok: true, data: [] }

  if (!Array.isArray(value)) {
    return { ok: false, error: 'Expected "contents.records" to be a list' }
  }

  const rows: ContentRow[] = []

  for (const item of value) {
    if (!isRecord(item)) {
      return { ok: false, error: 'Expected each content row to be an object' }
    }
    if (typeof item.content !== 'string') {
      return { ok: false, error: 'Invalid value for "content"' }
    }
    if (typeof item.order !== 'number' || !Number.isFinite(item.order)) {
      return { ok: false, error: 'Invalid value for "order"' }
    }
    rows.push({ content: item.content, order: item.order })
  }

  return { ok: true, data: rows }
}
