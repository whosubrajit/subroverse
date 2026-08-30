# SubroVerse

A public story garden with a private writer's room. SubroVerse is built with Next.js, React, Neon Postgres, Drizzle ORM, Neon Auth, and Vercel Blob.

## What is included

- Animated public homepage, story archive, individual story pages, and author/contact sections
- Database-backed stories, revisions, tags, media metadata, subscribers, campaigns, and contact messages
- Protected admin dashboard with story editing, audience export, media management, analytics, and settings
- First-visit mailing-list invitation that stores addresses directly in Neon
- CSV export for sending newsletter messages manually through Gmail
- Dynamic metadata, robots rules, and sitemap entries for published stories

## Requirements

- Node.js 22 or newer
- pnpm 10 or newer
- A Neon project with Neon Auth enabled
- A Vercel Blob store if uploads will be managed through the admin dashboard

## Local setup

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm db:migrate
pnpm dev
```

Open [http://localhost:8443](http://localhost:8443). 
## Database workflow

The schema lives in `src/db/schema.ts`; generated SQL is checked into `drizzle/`.

```bash
# After changing the schema
pnpm db:generate

# Review the generated SQL, then apply it
pnpm db:migrate
```

The initial migration includes the existing published stories and is safe to rerun through Drizzle's migration journal.

## Admin and newsletter workflow

Visit `/admin` and sign in using an allowlisted Neon Auth account. Subscriber addresses are stored as active records immediately. From **Audience**, use **Export active CSV**, then place recipients in Gmail's BCC field so addresses remain private.

## Verification

### Web Analytics

Enable **Web Analytics** for the project in Vercel, then deploy. The `@vercel/analytics` React integration records public pages, including the site's hash-based About, Stories and Write to me routes and individual stories. Automatic history tracking is disabled in favor of explicit route updates to prevent double counting. Admin pages, local development and Do Not Track visits are excluded. This integration strips query strings and does not send form content.

The admin Overview and Analytics pages read visitors and page views from Vercel's official `visits/count` API. Set `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and (for a team project) `VERCEL_TEAM_ID` in the server environment, then restart/redeploy. Never expose the token in a `NEXT_PUBLIC_` variable. Collection does not require this token; reading counts does.

Totals cover production traffic since Web Analytics was enabled and are cached for five minutes. Vercel visitor IDs reset daily, so visitors are not lifetime-unique people. Missing credentials and API failures show a clear status, not fabricated zero counts. Existing visits cannot be recovered from before analytics was enabled. Vercel-side activation and live reporting must be checked after deployment.

References: [Quickstart](https://vercel.com/docs/analytics/quickstart), [Web Analytics API](https://vercel.com/docs/analytics/web-analytics-api).

```bash
pnpm check
```

The same checks run for pull requests and pushes to `main` through GitHub Actions.

## Deployment

Vercel is the intended host:

1. Import the GitHub repository into Vercel.
2. Add the production values listed in `.env.example`.
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
4. Run `pnpm db:migrate` against the production Neon branch before the first release and after schema migrations.
5. Deploy. Vercel detects the Next.js application automatically.

Do not expose database URLs, authentication secrets, Blob tokens, or the private admin allowlist in issues, screenshots, or commits.
