import { and, eq, gt, isNull, lte, or, sql } from "drizzle-orm"
import type { AnyPgColumn } from "drizzle-orm/pg-core"

type PublicationColumns = { status: AnyPgColumn; publishedAt: AnyPgColumn; scheduledFor: AnyPgColumn }
type Publication = { status: string; publishedAt: Date | null; scheduledFor: Date | null }

// One visibility rule for listings, direct links, metadata, series, and sitemap.
// Scheduled rows become public at read time; no background DB writer is needed.
export function publicStoryCondition(columns: PublicationColumns, now = new Date()) {
  return or(
    and(eq(columns.status, "published"), lte(columns.publishedAt, now)),
    and(eq(columns.status, "scheduled"), lte(columns.scheduledFor, now)),
  )!
}

export function pendingStoryCondition(columns: PublicationColumns, now = new Date()) {
  return or(
    and(eq(columns.status, "scheduled"), or(isNull(columns.scheduledFor), gt(columns.scheduledFor, now))),
    and(eq(columns.status, "published"), gt(columns.publishedAt, now)),
  )!
}

export function publicationDateColumn(columns: PublicationColumns) {
  return sql<Date>`case when ${columns.status} = 'scheduled' then ${columns.scheduledFor} else ${columns.publishedAt} end`
}

export function publicationDate(story: Publication) {
  return story.status === "scheduled" ? story.scheduledFor : story.publishedAt
}

export function isStoryPublic(story: Publication, now = new Date()) {
  const date = publicationDate(story)
  return (story.status === "published" || story.status === "scheduled") && date !== null && date.getTime() <= now.getTime()
}

export function effectiveStoryStatus<T extends Publication>(story: T, now = new Date()): T["status"] {
  if (isStoryPublic(story, now)) return "published"
  if (story.status === "published" && story.publishedAt && story.publishedAt > now) return "scheduled"
  return story.status
}

export const storyFilters = ["all", "draft", "published", "scheduled", "archived"] as const
export function parseStoryFilter(value: string | string[] | undefined) {
  return storyFilters.find((filter) => filter === value) ?? "all"
}
