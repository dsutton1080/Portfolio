import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({ prisma: {} }))

import * as collectionRoute from '../sections/route'
import * as itemRoute from '../sections/[id]/route'

describe('/api/sections handlers', () => {
  it('does not expose a PATCH on the collection route', async () => {
    // The ?id= PATCH upserted contents with
    //   `existingSection.contents[n]?.id || 'new'`
    // and 'new' is not a valid ObjectId, so saving a section with fewer than
    // three content rows failed. The client already moved to the [id] handler;
    // this keeps the broken one from coming back as a live endpoint.
    expect('PATCH' in collectionRoute).toBe(false)
  })

  it('still serves the paths the client uses', () => {
    expect(typeof collectionRoute.GET).toBe('function')
    expect(typeof collectionRoute.POST).toBe('function')
    expect(typeof collectionRoute.DELETE).toBe('function')
    expect(typeof itemRoute.PATCH).toBe('function')
  })
})
