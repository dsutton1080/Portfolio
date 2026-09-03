# Personal Portfolio

The source for [portfolio.dsuttonserver.net](https://portfolio.dsuttonserver.net) — a
Next.js site whose content is stored in MongoDB and edited through a built-in
admin panel rather than by redeploying.

Built on the [Tailwind UI "Spotlight"](https://tailwindui.com) template.

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data | MongoDB via Prisma |
| Deployment | Docker |

## Requirements

- Node.js 20
- A MongoDB instance **running as a replica set**

> The replica set is not optional. Prisma's MongoDB connector wraps every write
> in a transaction, and MongoDB only supports transactions on a replica set.
> Against a standalone `mongod`, reads work but every create and update fails
> with `Prisma needs to perform transactions...`, which presents as the admin
> panel silently refusing to save. A single-node replica set is sufficient.

## Getting started

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL
npx prisma generate
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | **yes** | MongoDB connection string |
| `NEXT_PUBLIC_SITE_URL` | no | Public origin, used for absolute URLs |
| `NEXT_PUBLIC_APP_URL` | no | Base URL for server-side API calls |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | no | Umami analytics script |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | no | Umami site id |

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (runs lint and type checking) |
| `npm start` | Serve a production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Tests in watch mode |
| `npm run lighthouse` | Lighthouse CI against the deployed site |

## Content

Page content lives in MongoDB, not in the repo:

| Model | Drives |
|---|---|
| `Section` | `/resume` — grouped by `title` into Skills / Experience / Education |
| `Experience` | `/experience` and the cards on the home page |
| `Project` | `/projects` |
| `Role` | The "Work" card on the home page |
| `User` | Admin login |

Edit it at `/admin`.

Two maintenance scripts write content directly; both take `--dry-run`:

| Script | Does |
|---|---|
| `scripts/apply-content-updates.mjs` | Applies a batch of section content changes |
| `scripts/seed-roles.mjs` | Loads the work history that used to be hard-coded in `src/app/page.tsx`. Run once per environment — until it has, the "Work" card renders empty |

Role logos are bundled with the app (next/image only optimises static imports),
so a `Role` stores a key into `ROLE_LOGOS` in `src/lib/roles.ts` rather than a
path. An unknown or blank key falls back to the company initial.

## Project layout

```
src/
  app/            routes; api/ holds the route handlers
  components/     shared UI (much of it from the Spotlight template)
  lib/            data access helpers and types
  images/         logos and avatar
  styles/         Tailwind entry point
prisma/           schema
scripts/          one-off maintenance scripts
```

## Quality checks

`next build` runs ESLint and TypeScript, so a type error or lint failure breaks
the build rather than shipping.

Two GitHub Actions workflows run on top of that:

- **CI** — lint, typecheck, test and build on every pull request.
- **Lighthouse** — audits the deployed site against accessibility assertions and
  resource-size budgets defined in `lighthouserc.js`.

Tests run with [Vitest](https://vitest.dev) and Testing Library:

```bash
npm test          # once
npm run test:watch
```

They are colocated with the code (`*.test.ts` / `*.test.tsx`). The suite
deliberately targets behaviour that has regressed before rather than chasing a
coverage number.

## License

This site is built on the Tailwind UI Spotlight template, which is covered by
the [Tailwind UI license](https://tailwindui.com/license). See `LICENSE.md`.
