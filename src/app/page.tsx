import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

export default async function HomePage() {
  const { settings, stories } = await readPublicPageData()
  return <PublicSite settings={settings} initialStories={stories} />
}
