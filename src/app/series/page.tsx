import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"

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
  return <PublicSite settings={settings} initialStories={stories} initialPage="series-index" seriesMetadata={seriesMetadata} />
}
