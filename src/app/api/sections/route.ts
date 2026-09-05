import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/apiAuth'
import { badRequest, readJsonBody, serverError } from '@/lib/apiErrors'
import { pickContentRows, pickSectionFields } from '@/lib/writableFields'

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
    } catch (error) {
      return serverError('GET /api/sections?path=count', error)
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
    } catch (error) {
      return serverError('GET /api/sections?path=headers', error)
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
    } catch (error) {
      return serverError('GET /api/sections?id', error)
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
  } catch (error) {
    return serverError('GET /api/sections', error)
  }
}

// POST /api/sections
export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const body = await readJsonBody(request)
  const fields = pickSectionFields(body)
  if (!fields.ok) return badRequest(fields.error)

  // The client nests the rows as `contents.records`; anything else in that
  // object is not ours to write.
  const nested = body?.contents
  const rows = pickContentRows(
    typeof nested === 'object' && nested !== null
      ? (nested as Record<string, unknown>).records
      : undefined,
  )
  if (!rows.ok) return badRequest(rows.error)

  try {
    const order = fields.data.order ?? (await prisma.section.count()) + 1

    const responseSection = await prisma.section.create({
      data: {
        ...fields.data,
        order,
        contents: {
          create: rows.data,
        },
      },
    })
    return NextResponse.json(responseSection, { status: 201 })
  } catch (error) {
    return serverError('POST /api/sections', error)
  }
}

// There is deliberately no PATCH here. Updates go to the /api/sections/[id]
// handler: the version that used to live in this file upserted contents with
// `existingSection.contents[n]?.id || 'new'`, and 'new' is not a valid
// ObjectId, so saving any section with fewer than three content rows failed.
// Removing it keeps the broken path from being reachable over HTTP.

// DELETE /api/sections/:id
export async function DELETE(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return badRequest('ID is required')
  }

  try {
    const deletedSection = await prisma.section.delete({
      where: { id },
    })
    return NextResponse.json(deletedSection)
  } catch (error) {
    return serverError('DELETE /api/sections', error)
  }
} 