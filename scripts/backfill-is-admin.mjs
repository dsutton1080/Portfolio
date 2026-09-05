// Demote every account except the named administrator.
//
//   ADMIN_EMAIL=you@example.com node scripts/backfill-is-admin.mjs
//   ADMIN_EMAIL=you@example.com node scripts/backfill-is-admin.mjs --apply
//
// Changing `@default(true)` to `@default(false)` in schema.prisma governs rows
// inserted from now on. It does not touch rows that already exist - a default
// is applied at write time, not enforced as a constraint - so every account
// created while signup was open is still an administrator after that change
// deploys. Schema migrations and data migrations are separate jobs and you
// almost always need both; this is the second one.
//
// Defaults to a dry run. Pass --apply to write.

import { PrismaClient } from '@prisma/client'

const email = process.env.ADMIN_EMAIL
const apply = process.argv.includes('--apply')

if (!email) {
  console.error('Set ADMIN_EMAIL to the account that should stay an administrator.')
  process.exit(1)
}

const prisma = new PrismaClient()

try {
  const keeper = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  // Refuse rather than demote everyone: locking yourself out of the admin panel
  // is recoverable only by another shell session, and a typo in an email
  // address should not cost that.
  if (!keeper) {
    console.error(
      `No account with email ${email}. Run scripts/seed-admin.mjs first.`,
    )
    process.exit(1)
  }

  const toDemote = await prisma.user.findMany({
    where: { isAdmin: true, NOT: { id: keeper.id } },
    select: { id: true, email: true },
  })

  if (toDemote.length === 0) {
    console.log(`No other administrators. ${email} is the only one.`)
  } else {
    console.log(`${toDemote.length} account(s) would be demoted:`)
    for (const user of toDemote) console.log(`  ${user.email} (${user.id})`)

    if (!apply) {
      console.log('\nDry run. Re-run with --apply to write.')
    } else {
      const { count } = await prisma.user.updateMany({
        where: { isAdmin: true, NOT: { id: keeper.id } },
        data: { isAdmin: false },
      })
      console.log(`\nDemoted ${count} account(s).`)
    }
  }
} finally {
  await prisma.$disconnect()
}
