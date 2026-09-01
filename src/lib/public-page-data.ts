import { readPublicSiteSettings } from "@/lib/site-settings"
import { readPublicStoryFeed } from "@/lib/stories"
import { getAllSeriesMetadata } from "@/lib/series-metadata"

export async function readPublicPageData() {
  const [settings, stories, seriesMetadata] = await Promise.all([
    readPublicSiteSettings(),
    readPublicStoryFeed({ featuredFirst: true }),
    getAllSeriesMetadata(),
  ])

  return { settings, stories, seriesMetadata }
}
