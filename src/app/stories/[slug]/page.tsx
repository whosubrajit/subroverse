import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { findPublicStory, readPublicStories } from "@/lib/stories"
import { publicationDate } from "@/lib/story-publication"
import PublicAnalytics from "@/components/PublicAnalytics"
import { publicAnalyticsLocation } from "@/lib/analytics-policy"
import { getSiteUrl } from "@/lib/site-url"

type StoryPageProps = { params: Promise<{ slug: string }> }
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug)
  const story = await findPublicStory(slug)
  if (!story) return { title: "Story not found" }
  const storyPath = `/stories/${story.slug}`
  const title = story.seoTitle || story.title
  const description = story.seoDescription || story.excerpt
  return {
    title,
    description,
    authors: [{ name: "Dibyo Singho Barua Subrajit", url: "/about" }],
    alternates: { canonical: story.canonicalUrl || storyPath },
    openGraph: {
      type: "article",
      title,
      description,
      url: storyPath,
      publishedTime: publicationDate(story)?.toISOString(),
      modifiedTime: story.updatedAt.toISOString(),
      authors: ["/about"],
      images: [{ url: `${storyPath}/opengraph-image`, alt: story.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${storyPath}/opengraph-image`],
    },
  }
}

export default async function PublicStoryPage({ params }: StoryPageProps) {
  const slug = decodeURIComponent((await params).slug)
  const now = new Date()
  const story = await findPublicStory(slug, now)
  if (!story) notFound()

  const allStories = await readPublicStories({ now })
  const publishedDate = publicationDate(story) ?? story.createdAt

  const origin = getSiteUrl().origin
  const storyUrl = `${origin}/stories/${story.slug}`
  const languages = [
    /[\u0980-\u09ff]/.test(story.body) ? "bn" : null,
    /[A-Za-z]/.test(story.body) ? "en" : null,
  ].filter((language): language is string => Boolean(language))
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${storyUrl}#article`,
        headline: story.seoTitle || story.title,
        description: story.seoDescription || story.excerpt,
        author: { "@id": `${origin}/about#author` },
        datePublished: publishedDate.toISOString(),
        dateModified: story.updatedAt.toISOString(),
        wordCount: story.wordCount,
        url: storyUrl,
        mainEntityOfPage: { "@type": "WebPage", "@id": storyUrl },
        image: `${storyUrl}/opengraph-image`,
        inLanguage: languages.length === 1 ? languages[0] : languages,
        publisher: {
          "@type": "Organization",
          name: "SubroVerse",
          url: origin,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "SubroVerse", item: origin },
          { "@type": "ListItem", position: 2, name: "Stories", item: `${origin}/stories` },
          { "@type": "ListItem", position: 3, name: story.title, item: storyUrl },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen text-[#f0ebf5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <PublicAnalytics location={publicAnalyticsLocation("stories", story)} />
      <nav className="border-b border-[rgba(184,150,209,.08)] px-6 py-6"><div className="mx-auto flex max-w-3xl items-center justify-between"><Link href="/" className="font-cursive text-xl text-[#b896d1]">subroverse</Link><Link href="/stories" className="text-xs uppercase tracking-[.18em] text-[#8474a0] hover:text-[#b896d1]">all stories</Link></div></nav>
      <main className="mx-auto max-w-2xl px-6 pb-32 pt-14">
        <p className="font-cursive text-base text-[#b896d1]">{story.format}{story.series ? ` · ${story.series}` : ""}</p>
        <h1 className="font-display mt-3 text-4xl font-light italic leading-tight md:text-6xl">{story.title}</h1>
        {story.subtitle && <p className="font-display mt-5 text-2xl italic text-[#9e90af]">{story.subtitle}</p>}
        <p className="mt-6 text-xs text-[#8474a0]">{publishedDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {story.readingMinutes} min read</p>
        <article lang={languages[0] || "en"} className="prose-story mt-16">{story.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>

        <div className="mt-16 border-t border-[rgba(184,150,209,.1)] pt-10">
          <p className="font-cursive text-center text-[#b896d1]/60 text-xl mb-12">— written with love</p>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex-1 text-center sm:text-left">
              {(() => {
                const currentIndex = allStories.findIndex(s => s.id === story.id)
                const nextStory = allStories[currentIndex - 1] // Newer story
                if (nextStory) {
                  return (
                    <Link href={`/stories/${nextStory.slug}`} className="group block">
                      <p className="font-display italic text-2xl text-[#9e90af] group-hover:text-[#b896d1] transition-colors">← {nextStory.title}</p>
                    </Link>
                  )
                }
                return null
              })()}
            </div>

            <div className="flex-1 text-center sm:text-right">
              {(() => {
                const currentIndex = allStories.findIndex(s => s.id === story.id)
                const prevStory = allStories[currentIndex + 1] // Older story
                if (prevStory) {
                  return (
                    <Link href={`/stories/${prevStory.slug}`} className="group block">
                      <p className="font-display italic text-2xl text-[#9e90af] group-hover:text-[#b896d1] transition-colors">{prevStory.title} →</p>
                    </Link>
                  )
                }
                return null
              })()}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/stories" className="inline-flex min-h-11 items-center text-xs uppercase tracking-[.18em] text-[#8474a0] hover:text-[#b896d1] transition-colors">back to stories</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
