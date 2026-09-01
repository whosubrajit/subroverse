import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import AdminAccessGate from "@/components/admin/AdminAccessGate"
import StoryEditor from "@/components/admin/StoryEditor"
import { getDb } from "@/db"
import { stories } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "Edit story", robots: { index: false, follow: false } }

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return <AdminAccessGate />
  const { id } = await params
  const [story] = await getDb().select().from(stories).where(eq(stories.id, id)).limit(1)
  if (!story) notFound()
  return <StoryEditor key={story.id} initialStory={{
    id: story.id,
    title: story.title,
    slug: story.slug,
    subtitle: story.subtitle ?? "",
    excerpt: story.excerpt,
    body: story.body,
    format: story.format,
    series: story.series ?? "",
    seriesSlug: story.seriesSlug ?? "",
    status: story.status,
    featured: story.featured,
    scheduledFor: story.scheduledFor?.toISOString() ?? "",
    publishedAt: story.publishedAt?.toISOString() ?? "",
    seoTitle: story.seoTitle ?? "",
    seoDescription: story.seoDescription ?? "",
    canonicalUrl: story.canonicalUrl ?? "",
  }} />
}
