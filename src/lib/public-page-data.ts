import { readPublicSiteSettings } from "@/lib/site-settings"
import { readPublicStoryFeed } from "@/lib/stories"

export async function readPublicPageData() {
  const [settings, stories] = await Promise.all([
    readPublicSiteSettings(),
    readPublicStoryFeed({ featuredFirst: true }),
  ])

  return { settings, stories }
}
