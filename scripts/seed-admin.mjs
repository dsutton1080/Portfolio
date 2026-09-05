// Create or update the single administrator.
//
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' node scripts/seed-admin.mjs
//
// This replaces the public signup page. One administrator, created
// deliberately by someone with shell access to the server, is the whole user
// management requirement of a personal portfolio - and a capability that does
// not exist over HTTP cannot be abused over HTTP.
//
// Safe to re-run: it updates the password of an existing account rather than
// failing on the unique email.

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const firstName = process.env.ADMIN_FIRST_NAME ?? null
const lastName = process.env.ADMIN_LAST_NAME ?? null

if (!email || !password) {
  console.error(
    'Set ADMIN_EMAIL and ADMIN_PASSWORD.\n' +
      "  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' node scripts/seed-admin.mjs",
  )
  process.exit(1)
}

// Short passwords are the weak link in a system whose only account is an
// administrator, and there is no rate limiting in front of the login route.
if (password.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters.')
  process.exit(1)
}

const prisma = new PrismaClient()

try {
  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    // isAdmin is set here, on the server, by someone who already has access to
    // the database. It is never read from an HTTP request body.
    update: { password: hashedPassword, isAdmin: true },
    create: { email, password: hashedPassword, firstName, lastName, isAdmin: true },
    select: { id: true, email: true, isAdmin: true },
  })

  console.log(`Administrator ready: ${user.email} (${user.id})`)
} finally {
  await prisma.$disconnect()
}
