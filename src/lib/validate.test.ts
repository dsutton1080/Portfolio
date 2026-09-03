import { beforeEach, describe, expect, it, vi } from 'vitest'

// The lib modules are the boundary these tests are about, so the service layer
// (which is just `fetch(...).json()`) is stubbed and fed the sort of payloads a
// database or an error response can actually produce.
const services = vi.hoisted(() => ({
  getProjects: vi.fn(),
  getExperiences: vi.fn(),
  getSections: vi.fn(),
}))
vi.mock('@/app/services', () => services)

import { getAllExperiences } from '@/lib/experiences'
import { getAllProjects } from '@/lib/projects'
import { getResume } from '@/lib/resume'

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('getAllProjects', () => {
  it('keeps well-formed projects and normalises Prisma nulls', async () => {
    services.getProjects.mockResolvedValue([
      { name: 'A', description: 'd', link: 'l', label: 'b', order: 1, logo: null },
    ])

    expect(await getAllProjects()).toEqual([
      { name: 'A', description: 'd', link: 'l', label: 'b', order: 1 },
    ])
  })

  it('drops rows that are missing a required field', async () => {
    services.getProjects.mockResolvedValue([
      { name: 'A', description: 'd', link: 'l', label: 'b' },
      { name: 'B', description: 'd', link: 'l' },
      null,
    ])

    expect(await getAllProjects()).toHaveLength(1)
  })

  it('returns an empty list when the endpoint returns an error body', async () => {
    // Previously this was cast to Project[], so `{ error }` reached the page
    // and `projects.map` threw at render time.
    services.getProjects.mockResolvedValue({ error: 'boom' })

    expect(await getAllProjects()).toEqual([])
  })
})

describe('getAllExperiences', () => {
  it('drops rows whose fields are not strings', async () => {
    services.getExperiences.mockResolvedValue([
      { title: 'T', content: 'c', date: '2024-01-01' },
      { title: 'T2', content: 'c', date: 20240101 },
    ])

    expect(await getAllExperiences()).toEqual([
      { title: 'T', content: 'c', date: '2024-01-01' },
    ])
  })

  it('returns an empty list rather than null', async () => {
    services.getExperiences.mockResolvedValue(null)

    expect(await getAllExperiences()).toEqual([])
  })
})

describe('getResume', () => {
  it('validates each group of sections', async () => {
    services.getSections.mockResolvedValue({
      Skills: [
        {
          id: 's1',
          title: 'Skills',
          header: 'Languages',
          subHeader: null,
          contents: [{ id: 'c1', content: 'TypeScript' }, { id: 'c2' }],
        },
        { title: 'Skills' },
      ],
    })

    expect(await getResume()).toEqual({
      Skills: [
        {
          id: 's1',
          title: 'Skills',
          header: 'Languages',
          contents: [{ content: 'TypeScript' }],
        },
      ],
    })
  })

  it('returns an empty resume when the response is not an object', async () => {
    services.getSections.mockResolvedValue('nope')

    expect(await getResume()).toEqual({})
  })
})
