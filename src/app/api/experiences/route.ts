import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle /api/experiences/all (default)
  try {
    const experiences = await prisma.experience.findMany()
    return NextResponse.json(experiences)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/experiences
export async function POST(request: Request) {
  try {
    const experience = await request.json()
    const responseExperience = await prisma.experience.create({
      data: experience,
    })
    return NextResponse.json(responseExperience, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/experiences/:id
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: await request.json(),
    })
    return NextResponse.json(updatedExperience)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/experiences/:id
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const deletedExperience = await prisma.experience.delete({
      where: { id },
    })
    return NextResponse.json(deletedExperience)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 