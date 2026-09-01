import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"

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

export default async function WritePage() {
  const { settings, stories } = await readPublicPageData()
  return <PublicSite settings={settings} initialStories={stories} initialPage="write" />
}
