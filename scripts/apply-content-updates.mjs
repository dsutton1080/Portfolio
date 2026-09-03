/**
 * One-shot content update: brings the database in line with the current resume.
 *
 *   node scripts/apply-content-updates.mjs --dry-run   # print the plan
 *   node scripts/apply-content-updates.mjs             # apply it
 *
 * REQUIRES a MongoDB replica set. Prisma's MongoDB connector uses transactions
 * for every write, so against a standalone mongod every create/update fails
 * with "Prisma needs to perform transactions, which requires your MongoDB
 * server to be run as a replica set." That is currently the case in
 * production, which is also why the /admin panel cannot save.
 *
 * Sections are matched by `header`, not by id, so this still works if ids
 * differ between environments. Re-running is safe: updates are idempotent and
 * the Omni section is only created if it is missing.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY = process.argv.includes('--dry-run')
const log = (...a) => console.log(DRY ? '[dry-run]' : '[apply]  ', ...a)

/** Replace a section's contents with exactly these strings, in order. */
async function setContents(sectionId, texts) {
  const existing = await prisma.content.findMany({
    where: { section_id: sectionId },
    orderBy: { order: 'asc' },
  })
  for (let i = 0; i < texts.length; i++) {
    if (existing[i]) {
      if (!DRY) await prisma.content.update({
        where: { id: existing[i].id }, data: { content: texts[i], order: i },
      })
    } else if (!DRY) {
      await prisma.content.create({
        data: { content: texts[i], order: i, section_id: sectionId },
      })
    }
  }
  for (const extra of existing.slice(texts.length)) {
    if (!DRY) await prisma.content.delete({ where: { id: extra.id } })
  }
}

async function updateSection(header, { newHeader, subHeader, contents }) {
  const s = await prisma.section.findFirst({ where: { header } })
  if (!s) return log(`SKIP  section not found: "${header}"`)
  log(`UPDATE section "${header}"${newHeader ? ` -> "${newHeader}"` : ''}`)
  if (!DRY) await prisma.section.update({
    where: { id: s.id },
    data: { ...(newHeader && { header: newHeader }), ...(subHeader !== undefined && { subHeader }) },
  })
  if (contents) await setContents(s.id, contents)
}

async function deleteSection(header) {
  const s = await prisma.section.findFirst({ where: { header } })
  if (!s) return log(`SKIP  already gone: "${header}"`)
  log(`DELETE section "${header}" (contents cascade)`)
  if (!DRY) await prisma.section.delete({ where: { id: s.id } })
}

async function main() {
  // ---- Skills: refresh from the resume (also fixes the truncated "Swift, Jav") ----
  await updateSection('Development ', {
    contents: [
      'Languages: Python, JavaScript, TypeScript, C#, Java, HTML, CSS',
      'Frameworks: React, Angular, Node, Next.js, .NET, Flask, Spring Boot',
      'Technologies: SQL Server, PostGIS, Power Automate, Azure, AWS, Docker, OpenShift, Playwright, Celery',
    ],
  })

  // ---- Current role: create if missing, ordered ahead of the AT&T entries ----
  const omniHeader = 'Software Engineer, Omni Federal'
  const omni = await prisma.section.findFirst({ where: { header: omniHeader } })
  const omniContents = [
    'Full-stack developer on a geospatial data-validation platform for a federal customer, rebuilt to serve both cloud and desktop users. React and TypeScript on the front end, Python and Flask on the back end, deployed on AWS via OpenShift.',
    'Designed and implemented a range of geospatial validation checks across multiple data domains, and added ingestion support for additional schema formats to widen the set of data the platform accepts.',
    "Built the end-to-end test suite in Playwright and overhauled the CI pipeline's test infrastructure - resolving fragile locators, timeouts and Docker image dependencies - to get reliable pipeline runs. Also led a multi-phase code-quality remediation effort across the codebase.",
  ]
  if (omni) {
    await updateSection(omniHeader, { subHeader: 'July 2024 - Present', contents: omniContents })
  } else {
    log(`CREATE section "${omniHeader}"`)
    if (!DRY) {
      const created = await prisma.section.create({
        data: { title: 'Experience', order: 3, header: omniHeader, subHeader: 'July 2024 - Present' },
      })
      await setContents(created.id, omniContents)
    }
  }

  // ---- AT&T: correct the end date and rewrite around what shipped ----
  await updateSection('Software Engineer II, AT&T ', {
    subHeader: 'September 2022 - July 2024',
    contents: [
      "Helped launch 'Scoop Mail', a new internal messaging platform for AT&T employees, contributing from early development through release. Built the React front end and the C# .NET and SQL Server back end.",
      "Sustained and enhanced 'Ask&Get', AT&T's company-wide portal for employee hardware and software requests, delivering new features while keeping the existing service stable for its enterprise user base. Extended its request workflows across the Angular front end and Java back end as new business requirements arrived.",
      'Packaged and deployed services to Microsoft Azure with Docker for consistent releases across environments, working with developers and product owners in an agile setting.',
    ],
  })

  await updateSection('Software Engineer I, AT&T ', {
    subHeader: 'July 2021 - September 2022',
    contents: [
      "Delivered multiple client-facing GUIs using Angular, Bootstrap and internal AT&T component libraries, translating each client's requirements into working interfaces.",
      'Partnered with back-end developers to wire those interfaces into databases and APIs with full CRUD support.',
      'Built dashboards in Power BI, Grafana and Snowflake giving teams visibility into KPIs and uptime metrics.',
    ],
  })

  // ---- Internships: the resume lists none ----
  await deleteSection('Technical Intern II, AT&T')
  await deleteSection('Technical Intern I, AT&T')
  await deleteSection('Programmer Analyst Intern, Express Scripts')

  // ---- Education: drop the Udemy course (never completed) ----
  await deleteSection('Online')

  // ---- Education: add the MBA ----
  await updateSection('College', {
    contents: [
      'University of Missouri-St. Louis - MBA, Management Focus, May 2026',
      'University of Kansas, Lawrence KS - BS in Computer Science, May 2021',
    ],
  })

  // ---- Experience entries: engineering write-ups, not a learning log ----
  const entries = [
    { title: 'Rebuilt this site for performance and accessibility', date: '2026-09-02',
      content: 'Audited my own portfolio and found the home page shipping 628 KB - 80% of it three logos rendered as 28-pixel circles. One was an 880x880 PNG served at full size because the image optimizer had been bypassed; two others were auto-traced bitmaps, one a single SVG path with a 265,617-character definition. I fixed the raster path through next/image, re-optimized the vectors at a precision chosen by measuring rendered pixel error rather than by eye, and brought total page weight from 628 KB down to roughly 150 KB. I also fixed five WCAG AA contrast failures and added Lighthouse CI with byte budgets and axe assertions so none of it can quietly regress.' },
    { title: 'Decoupled validation templates from jobs', date: '2025-08-15',
      content: 'Validation templates were tied directly to individual jobs, so users could not reuse or adjust criteria without starting over. I designed and implemented a template management system that separates the two, adding editing, duplication and download. The outcome is that users configure their own validation criteria instead of filing a request for an engineer to do it.' },
    { title: 'Made an unreliable CI pipeline trustworthy', date: '2025-03-10',
      content: 'Built the end-to-end test suite for the geospatial data-validation platform I work on, covering validation runs, CRUD operations, data ingestion, condition reports and template creation in Playwright. The harder half was the pipeline itself: the existing automated tests failed unpredictably, so I worked through fragile locators, timeout handling and Docker image dependencies until CI runs could be trusted. Removing the manual QA pass before every release mattered more than the number of tests.' },
    { title: 'Launched an internal messaging platform at AT&T', date: '2023-06-01',
      content: "Helped take 'Scoop Mail', a messaging platform for AT&T employees, from early development through release - building the React front end and the C# .NET and SQL Server back end. In parallel I sustained 'Ask&Get', the company-wide portal for hardware and software requests, shipping new workflow features across an Angular front end and Java back end while keeping a service the entire company relied on stable." },
  ]

  const existing = await prisma.experience.findMany({ orderBy: { date: 'asc' } })
  for (let i = 0; i < entries.length; i++) {
    if (existing[i]) {
      log(`UPDATE experience "${existing[i].title}" -> "${entries[i].title}"`)
      if (!DRY) await prisma.experience.update({ where: { id: existing[i].id }, data: entries[i] })
    } else {
      log(`CREATE experience "${entries[i].title}"`)
      if (!DRY) await prisma.experience.create({ data: entries[i] })
    }
  }

  log('done.')
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
