/**
 * One-shot: moves the work history off the home page and into the database.
 *
 *   node scripts/seed-roles.mjs --dry-run   # print the plan
 *   node scripts/seed-roles.mjs             # apply it
 *
 * The three roles below are exactly what src/app/page.tsx used to hard-code.
 * Run this once per environment; until it has run, the "Work" card on the home
 * page renders empty.
 *
 * REQUIRES a MongoDB replica set - see scripts/apply-content-updates.mjs.
 *
 * Roles are matched by company + title, so re-running is safe: an existing row
 * is updated in place rather than duplicated.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY = process.argv.includes('--dry-run')
const log = (...a) => console.log(DRY ? '[dry-run]' : '[apply]  ', ...a)

// `logo` is a key into ROLE_LOGOS in src/lib/roles.ts, not a path.
const ROLES = [
  { company: 'Omni Federal', title: 'Software Engineer', logo: 'omni-federal', start: '2024', end: 'Present', order: 0 },
  { company: 'AT&T', title: 'Software Engineer II', logo: 'att', start: '2022', end: '2024', order: 1 },
  { company: 'AT&T', title: 'Software Engineer I', logo: 'att', start: '2021', end: '2022', order: 2 },
]

async function main() {
  for (const role of ROLES) {
    const existing = await prisma.role.findFirst({
      where: { company: role.company, title: role.title },
    })

    if (existing) {
      log(`UPDATE ${role.company} - ${role.title}`)
      if (!DRY) await prisma.role.update({ where: { id: existing.id }, data: role })
    } else {
      log(`CREATE ${role.company} - ${role.title}`)
      if (!DRY) await prisma.role.create({ data: role })
    }
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
