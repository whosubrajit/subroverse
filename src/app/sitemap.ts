import type { MetadataRoute } from "next"
import { readPublicStories } from "@/lib/stories"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://subroverse.com"
  const base: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/stories`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${origin}/series`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${origin}/write`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${origin}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ]
  if (!process.env.DATABASE_URL) return base

  const published = await readPublicStories()

  const storyUrls: MetadataRoute.Sitemap = published.map((story) => ({ url: `${origin}/stories/${story.slug}`, lastModified: story.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 }))

  const seriesMap = new Map<string, string>()
  for (const s of published) {
    if (s.series && s.seriesSlug) {
      seriesMap.set(s.series.toLowerCase(), s.seriesSlug)
    }
  }

  const seriesUrls: MetadataRoute.Sitemap = Array.from(seriesMap.values()).map((slug) => ({
    url: `${origin}/series/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8
  }))

  return [...base, ...seriesUrls, ...storyUrls]
}
