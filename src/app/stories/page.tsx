import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Stories written by Subrajit",
  description: "Read Subrajit's latest Bengali and English letters, short stories, observations, and story series on SubroVerse.",
  alternates: { canonical: "/stories" },
  openGraph: {
    title: "Stories written by Subrajit",
    description: "Read Subrajit's latest Bengali and English letters, short stories, observations, and story series on SubroVerse.",
    url: "/stories",
  },
}

export default async function StoriesIndexPage() {
  const { settings, stories, seriesMetadata } = await readPublicPageData()
  return <PublicSite settings={settings} initialStories={stories} initialPage="stories" seriesMetadata={seriesMetadata} />
}
