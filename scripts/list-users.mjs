// Read-only inventory of the User collection.
//
//   node scripts/list-users.mjs
//
// Run this before changing anything. Public signup with isAdmin defaulting to
// true means the question "who has an administrator account?" currently has an
// unknown answer, and a fix does not undo an exploitation - it only makes the
// two indistinguishable afterwards. Establish the current state first.
//
// Selects columns explicitly so the password hash cannot end up on a terminal
// or in a scrollback buffer.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isAdmin: true,
    },
  })

  if (users.length === 0) {
    console.log('No users.')
  } else {
    console.table(users)
    const admins = users.filter((user) => user.isAdmin)
    console.log(`${users.length} user(s), ${admins.length} administrator(s).`)
    if (admins.length > 1) {
      console.log(
        '\nMore than one administrator. If you did not create them all, treat this as an incident rather than a cleanup.',
      )
    }
  }
} finally {
  await prisma.$disconnect()
}
