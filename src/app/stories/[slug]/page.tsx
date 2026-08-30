import type { Metadata } from "next"
import Link from "next/link"
import { and, eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { getDb } from "@/db"
import { stories } from "@/db/schema"
import PublicAnalytics from "@/components/PublicAnalytics"
import { publicAnalyticsLocation } from "@/lib/analytics-policy"

type StoryPageProps = { params: Promise<{ slug: string }> }

async function findStory(slug: string) {
  if (!process.env.DATABASE_URL) return null
  const [story] = await getDb().select().from(stories).where(and(eq(stories.slug, slug), eq(stories.status, "published"))).limit(1)
  return story ?? null
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = await findStory((await params).slug)
  if (!story) return { title: "Story not found" }
  return {
    title: story.seoTitle || story.title,
    description: story.seoDescription || story.excerpt,
    alternates: story.canonicalUrl ? { canonical: story.canonicalUrl } : undefined,
    openGraph: { type: "article", title: story.seoTitle || story.title, description: story.seoDescription || story.excerpt, publishedTime: story.publishedAt?.toISOString() },
  }
}

export default async function PublicStoryPage({ params }: StoryPageProps) {
  const story = await findStory((await params).slug)
  if (!story) notFound()

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8443"
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.seoTitle || story.title,
    description: story.seoDescription || story.excerpt,
    author: { "@type": "Person", name: "Subro" },
    datePublished: (story.publishedAt ?? story.createdAt).toISOString(),
    dateModified: story.updatedAt.toISOString(),
    wordCount: story.wordCount,
    url: `${origin}/stories/${story.slug}`,
    publisher: {
      "@type": "Organization",
      name: "SubroVerse",
      url: origin,
    },
  }

  return (
    <div className="min-h-screen text-[#f0ebf5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <PublicAnalytics location={publicAnalyticsLocation("stories", story)} />
      <nav className="border-b border-[rgba(184,150,209,.08)] px-6 py-6"><div className="mx-auto flex max-w-3xl items-center justify-between"><Link href="/" className="font-cursive text-xl text-[#b896d1]">subroverse</Link><Link href="/stories" className="text-xs uppercase tracking-[.18em] text-[#8474a0] hover:text-[#b896d1]">all stories</Link></div></nav>
      <main className="mx-auto max-w-2xl px-6 pb-32 pt-14">
        <p className="font-cursive text-base text-[#b896d1]">{story.format}{story.series ? ` · ${story.series}` : ""}</p>
        <h1 className="font-display mt-3 text-4xl font-light italic leading-tight md:text-6xl">{story.title}</h1>
        {story.subtitle && <p className="font-display mt-5 text-2xl italic text-[#9e90af]">{story.subtitle}</p>}
        <p className="mt-6 text-xs text-[#8474a0]">{(story.publishedAt ?? story.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {story.readingMinutes} min read</p>
        <article className="prose-story mt-16">{story.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>
        <div className="mt-16 border-t border-[rgba(184,150,209,.1)] pt-10 text-center"><p className="font-cursive text-xl text-[#b896d1]/60">— written with love</p><Link href="/stories" className="mt-8 inline-flex min-h-11 items-center text-xs uppercase tracking-[.18em] text-[#8474a0] hover:text-[#b896d1]">← back to stories</Link></div>
      </main>
    </div>
  )
}
