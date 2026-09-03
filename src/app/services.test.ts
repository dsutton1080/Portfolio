import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { updateSection } from './services'

describe('updateSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('targets the /api/sections/[id] handler, not the ?id= one', async () => {
    // The ?id= PATCH upserts contents with
    //   `existingSection.contents[n]?.id || 'new'`
    // and 'new' is not a valid ObjectId, so any section with fewer than three
    // content rows fails to save. The [id] handler loops and creates instead.
    await updateSection('abc', { title: 'T' })

    const [url, init] = (fetch as any).mock.calls[0]
    expect(url).toContain('/api/sections/abc')
    expect(url).not.toContain('?id=')
    expect(init.method).toBe('PATCH')
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))
    await expect(updateSection('abc', {})).rejects.toThrow('Failed to update section')
  })
})
