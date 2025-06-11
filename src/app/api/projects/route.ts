import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle /api/projects/all (default)
  try {
    const projects = await prisma.project.findMany()
    return NextResponse.json(projects)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/projects
export async function POST(request: Request) {
  try {
    const project = await request.json()
    const responseProject = await prisma.project.create({
      data: project,
    })
    return NextResponse.json(responseProject, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/projects/:id
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id },
      data: await request.json(),
    })
    return NextResponse.json(updatedProject)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/projects/:id
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const deletedProject = await prisma.project.delete({
      where: { id },
    })
    return NextResponse.json(deletedProject)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 