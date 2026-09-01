import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Bengali Letters & Stories",
  description: "Read Subrajit's latest Bengali and English letters, short stories, observations, and story series on SubroVerse.",
  alternates: { canonical: "/stories" },
  openGraph: {
    title: "Bengali Letters & Stories",
    description: "Letters, short stories, observations, and story series by Subrajit.",
    url: "/stories",
  },
}

export default async function StoriesPage() {
  const { settings, stories } = await readPublicPageData()
  return <PublicSite settings={settings} initialStories={stories} initialPage="stories" />
}
