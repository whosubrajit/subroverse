# SubroVerse contributor guide

SubroVerse is a Next.js App Router application backed by Neon Postgres, Drizzle ORM, Neon Auth, and Vercel Blob.

## Commands

- `pnpm dev` — run the local site on port 8443
- `pnpm typecheck` — run TypeScript checks
- `pnpm build` — create a production build
- `pnpm check` — run the complete local/CI verification
- `pnpm db:generate` — generate a Drizzle migration after schema changes
- `pnpm db:migrate` — apply checked-in migrations

## Project conventions

- Keep credentials in `.env.local`; never commit real secrets or admin addresses.
- Make database changes in `src/db/schema.ts`, then generate and review a migration.
- Public story reads live in `src/lib/stories.ts`; protected admin authorization lives in `src/lib/admin.ts`.
- Preserve the existing editorial visual language and respect reduced-motion preferences.
- Run `pnpm check` before handing off changes.

## Next.js version

This project uses the locally installed Next.js version. For framework behavior, consult the documentation bundled in `node_modules/next/dist/docs/` before relying on older API assumptions.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
