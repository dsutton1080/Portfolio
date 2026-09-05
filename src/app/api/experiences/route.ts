import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/apiAuth'
import { badRequest, readJsonBody, serverError } from '@/lib/apiErrors'
import { pickExperienceFields } from '@/lib/writableFields'

// GET /api/experiences/all or /api/experiences/:id
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  // Handle /api/experiences/:id
  if (id) {
    try {
      const experience = await prisma.experience.findUnique({
        where: { id },
      })
      return NextResponse.json(experience)
    } catch (error) {
      return serverError('GET /api/experiences?id', error)
    }
  }

  // Handle /api/experiences/all (default)
  try {
    // The home page slices the first 4 as "most recent", so the order has
    // to come from the database rather than whatever Mongo returns.
    const experiences = await prisma.experience.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(experiences)
  } catch (error) {
    return serverError('GET /api/experiences', error)
  }
}

// POST /api/experiences
export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const fields = pickExperienceFields(await readJsonBody(request))
  if (!fields.ok) return badRequest(fields.error)

  try {
    const responseExperience = await prisma.experience.create({
      data: fields.data,
    })
    return NextResponse.json(responseExperience, { status: 201 })
  } catch (error) {
    return serverError('POST /api/experiences', error)
  }
}

// PATCH /api/experiences/:id
export async function PATCH(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return badRequest('ID is required')
  }

  const fields = pickExperienceFields(await readJsonBody(request))
  if (!fields.ok) return badRequest(fields.error)

  try {
    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: fields.data,
    })
    return NextResponse.json(updatedExperience)
  } catch (error) {
    return serverError('PATCH /api/experiences', error)
  }
}

// DELETE /api/experiences/:id
export async function DELETE(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return badRequest('ID is required')
  }

  try {
    const deletedExperience = await prisma.experience.delete({
      where: { id },
    })
    return NextResponse.json(deletedExperience)
  } catch (error) {
    return serverError('DELETE /api/experiences', error)
  }
}
