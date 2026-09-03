import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"

import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Stories written by Subrajit",
  description:
    "Read Subrajit's latest Bengali and English letters, short stories, observations, and story series on SubroVerse.",
  alternates: { canonical: "/stories" },
  openGraph: {
    title: "Stories written by Subrajit",
    description:
      "Read Subrajit's latest Bengali and English letters, short stories, observations, and story series on SubroVerse.",
    url: "/stories",
  },
}

export default async function StoriesIndexPage() {
  const { settings, stories, seriesMetadata } = await readPublicPageData()
  const origin = getSiteUrl().origin
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SubroVerse", item: origin },
      {
        "@type": "ListItem",
        position: 2,
        name: "Stories",
        item: `${origin}/stories`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PublicSite
        settings={settings}
        initialStories={stories}
        initialPage="stories"
        seriesMetadata={seriesMetadata}
      />
    </>
  )
}
