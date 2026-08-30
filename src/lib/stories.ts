import { z } from "zod"

export const storyInputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().max(190).optional().default(""),
  subtitle: z.string().trim().max(240).optional().nullable(),
  excerpt: z.string().trim().min(1).max(700),
  body: z.string().trim().min(1),
  format: z.string().trim().min(1).max(40).default("Prose"),
  series: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["draft", "scheduled", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  scheduledFor: z.iso.datetime().optional().nullable(),
  seoTitle: z.string().trim().max(70).optional().nullable(),
  seoDescription: z.string().trim().max(170).optional().nullable(),
  canonicalUrl: z.url().optional().nullable().or(z.literal("")),
  publishedAt: z.iso.datetime().optional().nullable(),
})

export type StoryInput = z.infer<typeof storyInputSchema>

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 190)
}

export function storyMetrics(body: string) {
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0
  return { wordCount, readingMinutes: Math.max(1, Math.ceil(wordCount / 220)) }
}
