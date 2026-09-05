import { describe, expect, it } from 'vitest'
import {
  pickContentRows,
  pickExperienceFields,
  pickProjectFields,
  pickRoleFields,
  pickSectionFields,
} from './writableFields'

describe('field allowlists', () => {
  it('drops keys the route does not own', () => {
    // The handlers used to pass the parsed body straight to Prisma, so whatever
    // the caller sent was written. This is the regression guard for that.
    const result = pickProjectFields({
      name: 'Portfolio',
      id: 'someone-elses-id',
      isAdmin: true,
      createdAt: '1999-01-01',
    })

    expect(result).toEqual({ ok: true, data: { name: 'Portfolio' } })
  })

  it('leaves absent fields out so PATCH stays partial', () => {
    const result = pickRoleFields({ title: 'Engineer' })
    expect(result.ok && Object.keys(result.data)).toEqual(['title'])
  })

  it('rejects a value of the wrong type instead of coercing it', () => {
    const result = pickProjectFields({ name: 'ok', order: 'first' })
    expect(result).toEqual({ ok: false, error: 'Invalid value for "order"' })
  })

  it('accepts null for the columns that are nullable', () => {
    const result = pickProjectFields({ logo: null, order: null })
    expect(result).toEqual({ ok: true, data: { logo: null, order: null } })
  })

  it('rejects a body that is not an object', () => {
    expect(pickExperienceFields(null).ok).toBe(false)
    expect(pickExperienceFields([{ title: 'x' }]).ok).toBe(false)
  })

  it('allows every column the admin UI actually edits', () => {
    // An allowlist that is too narrow breaks the panel, which is the failure
    // this direction trades for - loud rather than silent.
    expect(
      pickSectionFields({
        title: 'About',
        header: 'Header',
        subHeader: 'Sub',
        order: 1,
      }),
    ).toEqual({
      ok: true,
      data: { title: 'About', header: 'Header', subHeader: 'Sub', order: 1 },
    })

    expect(
      pickRoleFields({
        company: 'Acme',
        title: 'Engineer',
        logo: 'acme',
        start: '2020',
        end: 'Present',
        order: 2,
      }).ok,
    ).toBe(true)
  })
})

describe('pickContentRows', () => {
  it('keeps only content and order', () => {
    // section_id is the interesting one: taking it from the body would let a
    // caller attach rows to a section they do not own.
    const result = pickContentRows([
      { content: 'hello', order: 0, section_id: 'somewhere-else' },
    ])
    expect(result).toEqual({ ok: true, data: [{ content: 'hello', order: 0 }] })
  })

  it('treats absent rows as none', () => {
    expect(pickContentRows(undefined)).toEqual({ ok: true, data: [] })
  })

  it('rejects a malformed row', () => {
    expect(pickContentRows([{ content: 42, order: 0 }]).ok).toBe(false)
    expect(pickContentRows([{ content: 'x' }]).ok).toBe(false)
    expect(pickContentRows('nope').ok).toBe(false)
  })
})
