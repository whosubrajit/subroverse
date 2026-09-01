import assert from "node:assert/strict"
import test from "node:test"
import { PgDialect } from "drizzle-orm/pg-core"
import { stories } from "../src/db/schema.ts"
import { effectiveStoryStatus, isStoryPublic, parseStoryFilter, pendingStoryCondition, publicationDate, publicationDateColumn, publicStoryCondition } from "../src/lib/story-publication.ts"

const now = new Date("2026-09-01T12:00:00Z")
const past = new Date("2026-09-01T11:00:00Z")
const future = new Date("2026-09-01T13:00:00Z")

test("drafts and archived stories remain private even with old publication dates", () => {
  for (const status of ["draft", "archived"]) {
    const story = { status, publishedAt: past, scheduledFor: past }
    assert.equal(isStoryPublic(story, now), false)
    assert.equal(effectiveStoryStatus(story, now), status)
  }
})

test("published and scheduled stories appear only at the inclusive publication boundary", () => {
  for (const status of ["published", "scheduled"]) {
    for (const date of [null, past, now, future]) {
      const story = { status, publishedAt: status === "published" ? date : past, scheduledFor: status === "scheduled" ? date : future }
      assert.equal(isStoryPublic(story, now), date !== null && date <= now)
      assert.equal(publicationDate(story), date)
    }
  }
})

test("scheduled visibility works without a cron job and admin filters match public state", () => {
  const scheduled = { status: "scheduled", scheduledFor: future, publishedAt: past }
  assert.equal(effectiveStoryStatus(scheduled, now), "scheduled")
  assert.equal(effectiveStoryStatus(scheduled, future), "published")
  assert.equal(effectiveStoryStatus({ status: "published", publishedAt: future, scheduledFor: null }, now), "scheduled")
  for (const status of ["all", "draft", "published", "scheduled", "archived"]) assert.equal(parseStoryFilter(status), status)
  for (const input of [undefined, "invalid", ["draft", "published"]]) assert.equal(parseStoryFilter(input), "all")
})

test("database predicate guards each status with its own timestamp", () => {
  const dialect = new PgDialect()
  const query = dialect.sqlToQuery(publicStoryCondition(stories, now))
  assert.deepEqual(query.params, ["published", now.toISOString(), "scheduled", now.toISOString()])
  assert.match(query.sql, /"status" = \$1 and "stories"\."published_at" <= \$2/)
  assert.match(query.sql, /"status" = \$3 and "stories"\."scheduled_for" <= \$4/)
  assert.match(query.sql, / or /)
  const pending = dialect.sqlToQuery(pendingStoryCondition(stories, now))
  assert.match(pending.sql, /"scheduled_for" is null/)
  assert.match(pending.sql, /"published_at" > /)
  assert.match(dialect.sqlToQuery(publicationDateColumn(stories)).sql, /case when .*scheduled.*scheduled_for.*published_at.*end/)
})
