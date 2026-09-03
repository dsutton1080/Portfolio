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
| `npm run lighthouse` | Lighthouse CI against the deployed site |

## Content

Page content lives in MongoDB, not in the repo:

| Model | Drives |
|---|---|
| `Section` | `/resume` — grouped by `title` into Skills / Experience / Education |
| `Experience` | `/experience` and the cards on the home page |
| `Project` | `/projects` |
| `User` | Admin login |

Edit it at `/admin`. `scripts/apply-content-updates.mjs` applies a batch of
content changes in one command and supports `--dry-run`.

The work history on the home page is the exception — it is hard-coded in
`src/app/page.tsx`.

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

- **CI** — lint, typecheck and build on every pull request.
- **Lighthouse** — audits the deployed site against accessibility assertions and
  resource-size budgets defined in `lighthouserc.js`.

There is currently no automated test suite.

## License

This site is built on the Tailwind UI Spotlight template, which is covered by
the [Tailwind UI license](https://tailwindui.com/license). See `LICENSE.md`.
