import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "SubroVerse — Subrajit's Letters",
  description:
    "Subrajit's Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SubroVerse — Subrajit's Letters",
    description:
      "Subrajit's Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
    url: "/",
  },
}

export default async function HomePage() {
  const { settings, stories, seriesMetadata } = await readPublicPageData()
  return (
    <PublicSite
      settings={settings}
      initialStories={stories}
      seriesMetadata={seriesMetadata}
    />
  )
}
