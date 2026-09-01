import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { findPublicSeries } from "@/lib/stories"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"
import { getSiteUrl } from "@/lib/site-url"
import { getAllSeriesMetadata } from "@/lib/series-metadata"

type SeriesPageProps = { params: Promise<{ slug: string }> }
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug)
  const seriesName = await findPublicSeries(slug)
  if (!seriesName) return { title: "Series not found" }
  const allMeta = await getAllSeriesMetadata()
  const description = allMeta.find(m => m.name === seriesName)?.description || `Read all stories in the ${seriesName} collection by Subrajit.`

  return {
    title: seriesName,
    description,
    alternates: { canonical: `/series/${slug}` },
    openGraph: {
      title: seriesName,
      description,
      url: `/series/${slug}`,
    },
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const slug = decodeURIComponent((await params).slug)
  const seriesName = await findPublicSeries(slug)
  if (!seriesName) notFound()

  const { settings, stories, seriesMetadata } = await readPublicPageData()
  const origin = getSiteUrl().origin
  const seriesStories = stories.filter((story) => story.series === seriesName)
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${origin}/series/${slug}#collection`,
        name: seriesName,
        description: seriesMetadata.find(m => m.name === seriesName)?.description || `Read all stories in the ${seriesName} collection by Subrajit.`,
        url: `${origin}/series/${slug}`,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: seriesStories.length,
          itemListElement: seriesStories.map((story, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: story.title,
            url: `${origin}/stories/${story.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "SubroVerse", item: origin },
          { "@type": "ListItem", position: 2, name: "Series", item: `${origin}/series` },
          { "@type": "ListItem", position: 3, name: seriesName, item: `${origin}/series/${slug}` },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }} />
      <PublicSite settings={settings} initialStories={stories} initialPage="series" initialSeries={seriesName} seriesMetadata={seriesMetadata} />
    </>
  )
}
