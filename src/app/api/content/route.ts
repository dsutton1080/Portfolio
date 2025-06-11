import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/content/all or /api/content/:id
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  // Handle /api/content/:id
  if (id) {
    try {
      const content = await prisma.content.findUnique({
        where: { id },
      })
      return NextResponse.json(content)
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle /api/content/all (default)
  try {
    const content = await prisma.content.findMany()
    return NextResponse.json(content)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/content
export async function POST(request: Request) {
  try {
    const content = await request.json()
    const responseContent = await prisma.content.create({
      data: content,
    })
    return NextResponse.json(responseContent, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/content/:id
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const updatedContent = await prisma.content.update({
      where: { id },
      data: await request.json(),
    })
    return NextResponse.json(updatedContent)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/content/:id
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const deletedContent = await prisma.content.delete({
      where: { id },
    })
    return NextResponse.json(deletedContent)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 