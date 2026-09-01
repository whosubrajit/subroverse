import App from "@/App"
import type { PublicSiteSettings } from "@/lib/site-settings-schema"
import type { PublicStory } from "@/lib/story-feed"

export default function PublicSite({
  settings,
  initialStories,
  initialPage = "home",
  initialSeries = null,
  seriesMetadata = [],
}: {
  settings: PublicSiteSettings
  initialStories: PublicStory[]
  initialPage?: string
  initialSeries?: string | null
  seriesMetadata?: Array<{ name: string; description: string }>
}) {
  return <App settings={settings} initialStories={initialStories} initialPage={initialPage} initialSeries={initialSeries} seriesMetadata={seriesMetadata} />
}
