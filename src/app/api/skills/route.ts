import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/skills/all
export async function GET() {
  try {
    const skills = await prisma.skills.findMany()
    return NextResponse.json(skills)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/skills
export async function POST(request: Request) {
  try {
    const newSkill = await prisma.skills.create({
      data: await request.json(),
      orderBy: {
        order: 'desc',
      },
    })
    return NextResponse.json(newSkill, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/skills/:id
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const skill = await prisma.skills.update({
      where: { id },
      data: await request.json(),
    })
    return NextResponse.json(skill)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/skills/:id
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const skill = await prisma.skills.delete({
      where: { id },
    })
    return NextResponse.json(skill)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 