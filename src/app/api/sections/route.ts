import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Add dynamic rendering configuration
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/sections/all
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  // Handle /api/sections/count
  if (path === 'count') {
    try {
      const count = await prisma.section.count()
      return NextResponse.json(count.toString())
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle /api/sections/headers
  if (path === 'headers') {
    try {
      const headers = await prisma.section.findMany({
        select: {
          id: true,
          header: true,
        },
        orderBy: {
          order: 'asc',
        },
      })
      return NextResponse.json(headers)
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle /api/sections/:id
  const id = searchParams.get('id')
  if (id) {
    try {
      const section = await prisma.section.findUnique({
        select: {
          id: true,
          title: true,
          header: true,
          subHeader: true,
          order: true,
          contents: {
            select: {
              id: true,
              content: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        where: { id },
      })
      return NextResponse.json(section)
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle /api/sections/all (default)
  try {
    const sections = await prisma.section.findMany({
      select: {
        id: true,
        title: true,
        header: true,
        subHeader: true,
        contents: {
          select: {
            id: true,
            content: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    const groupedSections = sections.reduce((grouped: any, section: { title: string }) => {
      if (!grouped[section.title]) {
        grouped[section.title] = [section]
      } else {
        grouped[section.title].push({ ...section, title: '' })
      }
      return grouped
    }, {})

    return NextResponse.json(groupedSections)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/sections
export async function POST(request: Request) {
  try {
    const section = await request.json()
    if (!section.order) {
      const count = await prisma.section.count()
      section.order = count + 1
    }
    const responseSection = await prisma.section.create({
      data: {
        ...section,
        contents: {
          create: section.contents.records,
        },
      },
    })
    return NextResponse.json(responseSection, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/sections/:id
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const { content1, content2, content3, ...section } = await request.json()
    
    // First, get existing contents
    const existingSection = await prisma.section.findUnique({
      where: { id },
      include: { contents: true }
    })

    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Update section and contents
    const updatedSection = await prisma.section.update({
      where: { id },
      data: {
        ...section,
        contents: {
          upsert: [
            {
              where: { id: existingSection.contents[0]?.id || 'new' },
              update: { content: content1 || '', order: 0 },
              create: { content: content1 || '', order: 0 }
            },
            {
              where: { id: existingSection.contents[1]?.id || 'new' },
              update: { content: content2 || '', order: 1 },
              create: { content: content2 || '', order: 1 }
            },
            {
              where: { id: existingSection.contents[2]?.id || 'new' },
              update: { content: content3 || '', order: 2 },
              create: { content: content3 || '', order: 2 }
            }
          ]
        }
      },
      include: {
        contents: true
      }
    })
    return NextResponse.json(updatedSection)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/sections/:id
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const deletedSection = await prisma.section.delete({
      where: { id },
    })
    return NextResponse.json(deletedSection)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 