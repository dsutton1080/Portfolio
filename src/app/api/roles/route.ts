import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
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
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/roles
export async function POST(request: Request) {
  try {
    const role = await request.json()
    const responseRole = await prisma.role.create({
      data: role,
    })
    return NextResponse.json(responseRole, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/roles/:id
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const updatedRole = await prisma.role.update({
      where: { id },
      data: await request.json(),
    })
    return NextResponse.json(updatedRole)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/roles/:id
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const deletedRole = await prisma.role.delete({
      where: { id },
    })
    return NextResponse.json(deletedRole)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
