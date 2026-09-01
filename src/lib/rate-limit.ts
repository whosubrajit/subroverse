import { sql } from "drizzle-orm"
import { getDb } from "@/db"
import { requestRateLimits } from "@/db/schema"
import { getRequestIdentifier, rateLimitKey } from "@/lib/request-identity"

export { getRequestIdentifier } from "@/lib/request-identity"

type RateLimitOptions = {
  action: string
  identifier: string
  limit: number
  windowMs: number
  now?: Date
}

function rateLimitSecret() {
  return process.env.RATE_LIMIT_SECRET
    || process.env.NEON_AUTH_COOKIE_SECRET
    || "subroverse-rate-limit"
}

export async function consumeRateLimit({
  action,
  identifier,
  limit,
  windowMs,
  now = new Date(),
}: RateLimitOptions) {
  const key = rateLimitKey(action, identifier, rateLimitSecret())
  const cutoff = new Date(now.getTime() - windowMs)
  const staleBefore = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const result = await getDb().execute<{ count: number; window_start: Date }>(sql`
    with cleanup as (
      delete from ${requestRateLimits}
      where updated_at < ${staleBefore}
    ), upserted as (
      insert into ${requestRateLimits} (key, action, count, window_start, updated_at)
      values (${key}, ${action}, 1, ${now}, ${now})
      on conflict (key) do update set
        count = case
          when ${requestRateLimits.windowStart} <= ${cutoff} then 1
          else ${requestRateLimits.count} + 1
        end,
        window_start = case
          when ${requestRateLimits.windowStart} <= ${cutoff} then ${now}
          else ${requestRateLimits.windowStart}
        end,
        updated_at = ${now}
      returning count, window_start
    )
    select count, window_start from upserted
  `)

  const row = result.rows[0]
  const count = Number(row?.count ?? limit + 1)
  const windowStart = row?.window_start ? new Date(row.window_start) : now
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStart.getTime() + windowMs - now.getTime()) / 1000),
  )

  return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfterSeconds }
}
