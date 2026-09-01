import { z } from "zod"
import { and, desc, eq, sql } from "drizzle-orm"
import { getDb } from "@/db"
import { stories } from "@/db/schema"
import { publicationDateColumn, publicStoryCondition } from "@/lib/story-publication"
import { publicationDate } from "@/lib/story-publication"
import type { PublicStory } from "@/lib/story-feed"

export const storyInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().max(190).optional().default(""),
  subtitle: z.string().trim().max(240).optional().nullable(),
  excerpt: z.string().trim().min(1),
  body: z.string().trim().min(1),
  format: z.string().trim().min(1).max(50),
  series: z.string().trim().max(100).optional().transform(v => v || null),
  seriesSlug: z.string().trim().max(100).optional().transform(v => v || null),
  status: z.enum(["draft", "scheduled", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  scheduledFor: z.iso.datetime().optional().nullable(),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
  canonicalUrl: z.string().trim().optional().nullable(),
  publishedAt: z.iso.datetime().optional().nullable(),
}).refine((story) => story.status !== "scheduled" || Boolean(story.scheduledFor), {
  message: "Choose a publishing time before scheduling.",
  path: ["scheduledFor"],
})

export type StoryInput = z.infer<typeof storyInputSchema>

export function slugify(value: string) {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 190)
}

export function storyMetrics(body: string) {
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0
  return { wordCount, readingMinutes: Math.max(1, Math.ceil(wordCount / 220)) }
}

export async function readPublicStories({ featuredFirst = false, now = new Date() } = {}) {
  if (!process.env.DATABASE_URL) return []
  return getDb().select().from(stories).where(publicStoryCondition(stories, now)).orderBy(
    ...(featuredFirst ? [desc(stories.featured)] : []),
    desc(publicationDateColumn(stories)), desc(stories.id),
  )
}

export function toPublicStory(story: typeof stories.$inferSelect): PublicStory {
  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    category: story.format,
    series: story.series ?? undefined,
    seriesSlug: story.seriesSlug ?? undefined,
    date: (publicationDate(story) ?? story.createdAt).toLocaleDateString("en-US", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    readTime: `${story.readingMinutes} min`,
    excerpt: story.excerpt,
    body: story.body.split(/\n\s*\n/).filter(Boolean),
  }
}

export async function readPublicStoryFeed(options: Parameters<typeof readPublicStories>[0] = {}) {
  return (await readPublicStories(options)).map(toPublicStory)
}

export async function findPublicStory(slug: string, now = new Date()) {
  if (!process.env.DATABASE_URL) return null
  const [story] = await getDb().select().from(stories)
    .where(and(eq(stories.slug, slug), publicStoryCondition(stories, now))).limit(1)
  return story ?? null
}

export async function findPublicSeries(slug: string) {
  if (!process.env.DATABASE_URL) return null
  const db = getDb()
  const visible = publicStoryCondition(stories)
  const [bySlug] = await db.select({ series: stories.series }).from(stories)
    .where(and(eq(stories.seriesSlug, slug), visible)).limit(1)
  return bySlug?.series ?? null
}
