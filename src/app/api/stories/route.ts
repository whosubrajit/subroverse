import { and, desc, eq, lte } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDb } from "@/db"
import { stories } from "@/db/schema"

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ stories: [], configured: false })
  }

  const rows = await getDb()
    .select()
    .from(stories)
    .where(
      and(
        eq(stories.status, "published"),
        lte(stories.publishedAt, new Date()),
      ),
    )
    .orderBy(desc(stories.featured), desc(stories.publishedAt))

  return NextResponse.json({
    configured: true,
    stories: rows.map((story) => ({
      id: story.id,
      slug: story.slug,
      title: story.title,
      category: story.format,
      series: story.series ?? undefined,
      date: (story.publishedAt ?? story.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      readTime: `${story.readingMinutes} min`,
      excerpt: story.excerpt,
      body: story.body.split(/\n\s*\n/).filter(Boolean),
    })),
  })
}
