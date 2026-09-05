import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/apiAuth'
import { badRequest, readJsonBody, serverError } from '@/lib/apiErrors'
import { pickProjectFields } from '@/lib/writableFields'

// GET /api/projects/all or /api/projects/:id
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  // Handle /api/projects/:id
  if (id) {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
      })
      return NextResponse.json(project)
    } catch (error) {
      return serverError('GET /api/projects?id', error)
    }
  }

  // Handle /api/projects/all (default)
  try {
    // The admin UI collects an `order` for each project, so honour it here.
    // Without this the list came back in whatever order Mongo produced.
    const projects = await prisma.project.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(projects)
  } catch (error) {
    return serverError('GET /api/projects', error)
  }
}

// POST /api/projects
export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const fields = pickProjectFields(await readJsonBody(request))
  if (!fields.ok) return badRequest(fields.error)

  try {
    const responseProject = await prisma.project.create({ data: fields.data })
    return NextResponse.json(responseProject, { status: 201 })
  } catch (error) {
    return serverError('POST /api/projects', error)
  }
}

// PATCH /api/projects/:id
export async function PATCH(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return badRequest('ID is required')
  }

  const fields = pickProjectFields(await readJsonBody(request))
  if (!fields.ok) return badRequest(fields.error)

  try {
    const updatedProject = await prisma.project.update({
      where: { id },
      data: fields.data,
    })
    return NextResponse.json(updatedProject)
  } catch (error) {
    return serverError('PATCH /api/projects', error)
  }
}

// DELETE /api/projects/:id
export async function DELETE(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return badRequest('ID is required')
  }

  try {
    const deletedProject = await prisma.project.delete({
      where: { id },
    })
    return NextResponse.json(deletedProject)
  } catch (error) {
    return serverError('DELETE /api/projects', error)
  }
}
