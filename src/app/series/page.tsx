import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"

import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Story Series",
  description: "Read all story series written by Subrajit on SubroVerse.",
  alternates: { canonical: "/series" },
  openGraph: {
    title: "Story Series",
    description: "Read all story series written by Subrajit on SubroVerse.",
    url: "/series",
  },
}

export default async function SeriesIndexPage() {
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
        name: "Series",
        item: `${origin}/series`,
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
        initialPage="series-index"
        seriesMetadata={seriesMetadata}
      />
    </>
  )
}
