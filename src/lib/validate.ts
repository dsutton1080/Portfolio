/**
 * Small runtime checks for data crossing the API boundary.
 *
 * The service layer returns `response.json()`, i.e. `any`. Casting that to an
 * interface makes the declared return type a claim rather than a check: a
 * renamed column or an error body (`{ error: "..." }`) type-checks fine and
 * then blows up in a server component at render time. These helpers keep the
 * checks short enough that the lib modules can actually do them.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Prisma sends `null` for unset optional columns; treat that as absent. */
export function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/**
 * Parse a list, dropping entries that do not match. A malformed row costs one
 * card, not the whole page - and it says so in the server log rather than
 * failing silently.
 */
export function parseList<T>(
  value: unknown,
  parse: (item: unknown) => T | null,
  label: string,
): T[] {
  if (!Array.isArray(value)) {
    console.warn(`Expected a list of ${label}, got ${JSON.stringify(value)}`)
    return []
  }

  const parsed: T[] = []
  let dropped = 0
  for (const item of value) {
    const one = parse(item)
    if (one === null) dropped++
    else parsed.push(one)
  }
  if (dropped > 0) {
    console.warn(`Dropped ${dropped} malformed ${label} from the API response`)
  }
  return parsed
}
