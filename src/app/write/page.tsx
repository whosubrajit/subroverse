import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"

import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Write to Subrajit",
  description: "Send a private note to Subrajit through SubroVerse.",
  alternates: { canonical: "/write" },
  openGraph: {
    title: "Write to Subrajit",
    description: "Send a private note through SubroVerse.",
    url: "/write",
  },
}

export default async function WriteIndexPage() {
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
        name: "Write",
        item: `${origin}/write`,
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
        initialPage="write"
        seriesMetadata={seriesMetadata}
      />
    </>
  )
}
