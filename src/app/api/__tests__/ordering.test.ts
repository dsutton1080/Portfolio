import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.mock is hoisted above const declarations, so the stub has to be created
// inside vi.hoisted or the factory runs before `prisma` exists.
const prisma = vi.hoisted(() => ({
  project: { findMany: vi.fn(), findUnique: vi.fn() },
  experience: { findMany: vi.fn() },
}))
vi.mock('@/lib/prisma', () => ({ prisma }))

import { GET as getProjects } from '../projects/route'
import { GET as getExperiences } from '../experiences/route'

describe('list endpoints return a deterministic order', () => {
  beforeEach(() => {
    prisma.project.findMany.mockReset().mockResolvedValue([])
    prisma.project.findUnique.mockReset().mockResolvedValue(null)
    prisma.experience.findMany.mockReset().mockResolvedValue([])
  })

  it('sorts projects by their order field', async () => {
    // Regression: findMany() had no orderBy, so the projects page rendered in
    // whatever order Mongo happened to return, ignoring the order the admin
    // UI collects.
    await getProjects(new Request('http://localhost/api/projects'))

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { order: 'asc' } }),
    )
  })

  it('sorts experiences newest first', async () => {
    // Regression: the home page slices the first 4 as "most recent", which
    // only means anything if the query is ordered.
    await getExperiences(new Request('http://localhost/api/experiences'))

    expect(prisma.experience.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { date: 'desc' } }),
    )
  })

  it('still looks up a single project by id without ordering', async () => {
    prisma.project.findUnique.mockReset().mockResolvedValue(null)
    await getProjects(new Request('http://localhost/api/projects?id=abc'))

    expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 'abc' } })
    expect(prisma.project.findMany).not.toHaveBeenCalled()
  })
})
