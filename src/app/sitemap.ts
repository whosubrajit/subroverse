import type { MetadataRoute } from "next"
import { desc, eq } from "drizzle-orm"
import { getDb } from "@/db"
import { stories } from "@/db/schema"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://subroverse.vercel.app"
  const base: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: "weekly", priority: 1 },
  ]
  if (!process.env.DATABASE_URL) return base
  const published = await getDb().select({ slug: stories.slug, updatedAt: stories.updatedAt }).from(stories).where(eq(stories.status, "published")).orderBy(desc(stories.publishedAt))
  return [...base, ...published.map((story) => ({ url: `${origin}/stories/${story.slug}`, lastModified: story.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 }))]
}
