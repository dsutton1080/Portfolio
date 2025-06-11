import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const section = await prisma.section.findUnique({
      where: {
        id: params.id,
      },
      include: {
        contents: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    // Transform the data to match the expected format
    const transformedSection = {
      ...section,
      content1: section.contents[0]?.content || '',
      content2: section.contents[1]?.content || '',
      content3: section.contents[2]?.content || '',
    }

    return NextResponse.json(transformedSection)
  } catch (error) {
    console.error('Error fetching section:', error)
    return NextResponse.json(
      { error: 'Error fetching section' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, order, header, subHeader, content1, content2, content3 } = body

    // First update the section
    const section = await prisma.section.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        order,
        header,
        subHeader,
      },
    })

    // Get existing content items
    const existingContents = await prisma.content.findMany({
      where: {
        section_id: params.id,
      },
      orderBy: {
        order: 'asc',
      },
    })

    // Update or create content items
    const contentUpdates = [
      { content: content1, order: 0 },
      { content: content2, order: 1 },
      { content: content3, order: 2 },
    ]

    for (let i = 0; i < contentUpdates.length; i++) {
      const contentData = contentUpdates[i]
      if (existingContents[i]) {
        // Update existing content
        await prisma.content.update({
          where: {
            id: existingContents[i].id,
          },
          data: {
            content: contentData.content,
            order: contentData.order,
          },
        })
      } else if (contentData.content) {
        // Create new content
        await prisma.content.create({
          data: {
            content: contentData.content,
            order: contentData.order,
            section_id: params.id,
          },
        })
      }
    }

    // Delete any extra content items
    if (existingContents.length > 3) {
      await prisma.content.deleteMany({
        where: {
          section_id: params.id,
          order: {
            gte: 3,
          },
        },
      })
    }

    // Fetch the updated section with its contents
    const updatedSection = await prisma.section.findUnique({
      where: {
        id: params.id,
      },
      include: {
        contents: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!updatedSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Transform the data to match the expected format
    const transformedSection = {
      ...updatedSection,
      content1: updatedSection.contents[0]?.content || '',
      content2: updatedSection.contents[1]?.content || '',
      content3: updatedSection.contents[2]?.content || '',
    }

    return NextResponse.json(transformedSection)
  } catch (error) {
    console.error('Error updating section:', error)
    return NextResponse.json(
      { error: 'Error updating section' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // The onDelete: Cascade in the schema will automatically delete related content
    await prisma.section.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Section deleted successfully' })
  } catch (error) {
    console.error('Error deleting section:', error)
    return NextResponse.json(
      { error: 'Error deleting section' },
      { status: 500 }
    )
  }
} 