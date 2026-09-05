import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/apiAuth'
import { badRequest, readJsonBody, serverError } from '@/lib/apiErrors'
import { pickRoleFields } from '@/lib/writableFields'

// GET /api/roles/all or /api/roles/:id
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  // Handle /api/roles/:id
  if (id) {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
      })
      return NextResponse.json(role)
    } catch (error) {
      return serverError('GET /api/roles?id', error)
    }
  }

  // Handle /api/roles/all (default)
  try {
    // The work history reads top-down as a reverse-chronological list, so the
    // admin-supplied order has to survive the query.
    const roles = await prisma.role.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(roles)
  } catch (error) {
    return serverError('GET /api/roles', error)
  }
}

// POST /api/roles
export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const fields = pickRoleFields(await readJsonBody(request))
  if (!fields.ok) return badRequest(fields.error)

  try {
    const responseRole = await prisma.role.create({ data: fields.data })
    return NextResponse.json(responseRole, { status: 201 })
  } catch (error) {
    return serverError('POST /api/roles', error)
  }
}

// PATCH /api/roles/:id
export async function PATCH(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return badRequest('ID is required')
  }

  const fields = pickRoleFields(await readJsonBody(request))
  if (!fields.ok) return badRequest(fields.error)

  try {
    const updatedRole = await prisma.role.update({
      where: { id },
      data: fields.data,
    })
    return NextResponse.json(updatedRole)
  } catch (error) {
    return serverError('PATCH /api/roles', error)
  }
}

// DELETE /api/roles/:id
export async function DELETE(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return badRequest('ID is required')
  }

  try {
    const deletedRole = await prisma.role.delete({
      where: { id },
    })
    return NextResponse.json(deletedRole)
  } catch (error) {
    return serverError('DELETE /api/roles', error)
  }
}
