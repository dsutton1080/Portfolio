import { beforeEach, describe, expect, it, vi } from 'vitest'

const services = vi.hoisted(() => ({ getRoles: vi.fn() }))
vi.mock('@/app/services', () => services)

import { ROLE_LOGOS, getAllRoles } from '@/lib/roles'

const ROW = {
  id: 'r1',
  company: 'Omni Federal',
  title: 'Software Engineer',
  start: '2024',
  end: 'Present',
  order: 0,
  logo: 'omni-federal',
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('getAllRoles', () => {
  it('resolves the stored logo key to a bundled image', async () => {
    services.getRoles.mockResolvedValue([ROW])

    const [role] = await getAllRoles()
    expect(role.logo).toBe(ROLE_LOGOS['omni-federal'])
  })

  it('drops an unknown logo key instead of passing it to next/image', async () => {
    // A bad key would otherwise reach <Image src>, which needs a real source.
    // Without a logo the card falls back to the company initial.
    services.getRoles.mockResolvedValue([{ ...ROW, logo: 'nope' }])

    expect((await getAllRoles())[0].logo).toBeUndefined()
  })

  it('gives "Present" a machine-readable dateTime', async () => {
    services.getRoles.mockResolvedValue([ROW])

    const [role] = await getAllRoles()
    expect(role.end).toEqual({
      label: 'Present',
      dateTime: new Date().getFullYear().toString(),
    })
    expect(role.start).toEqual({ label: '2024', dateTime: '2024' })
  })

  it('drops rows missing the fields the card renders', async () => {
    services.getRoles.mockResolvedValue([ROW, { id: 'r2', company: 'X' }])

    expect(await getAllRoles()).toHaveLength(1)
  })

  it('returns an empty list when the endpoint errors', async () => {
    services.getRoles.mockResolvedValue({ error: 'boom' })

    expect(await getAllRoles()).toEqual([])
  })
})
