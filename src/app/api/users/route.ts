import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

// GET /api/users/all or /api/users/:id
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const path = searchParams.get('path')

  // Handle /api/users/all
  if (path === 'all') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isAdmin: true,
        },
      })
      return NextResponse.json(users)
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle /api/users/:id
  if (id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      })
      return NextResponse.json(user)
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

// POST /api/users/signup
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  // Handle /api/users/signup
  if (path === 'signup') {
    try {
      const user = await request.json()
      const hashedPassword = await bcrypt.hash(user.password, 10)
      const responseUser = await prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
        },
      })
      return NextResponse.json(responseUser)
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Handle /api/users/login
  if (path === 'login') {
    try {
      const loginInfo = await request.json()
      const user = await prisma.user.findUnique({
        where: { email: loginInfo.email },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const passwordMatch = await bcrypt.compare(loginInfo.password, user.password)
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }

      const { id, firstName, lastName, email, isAdmin } = user
      return NextResponse.json({ firstName, lastName, email, isAdmin, id })
    } catch (error: any) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

// PATCH /api/users/:id or /api/users/change-role/:id
export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const path = searchParams.get('path')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: await request.json(),
    })
    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/users?id=123
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const user = await prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        isAdmin: true,
      },
    })
    return NextResponse.json(user)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 