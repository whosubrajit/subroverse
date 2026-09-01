import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Story Series",
  description: "Browse all story collections and series written by Subrajit.",
  alternates: { canonical: "/series" },
  openGraph: {
    title: "Story Series",
    description: "Browse all story collections and series written by Subrajit.",
    url: "/series",
  },
}

export default async function SeriesIndexPage() {
  const { settings, stories } = await readPublicPageData()
  return <PublicSite settings={settings} initialStories={stories} initialPage="series-index" />
}
