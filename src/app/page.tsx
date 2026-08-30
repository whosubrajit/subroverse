import PublicSite from "@/components/PublicSite"
import { readPublicSiteSettings } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  return <PublicSite settings={await readPublicSiteSettings()} />
}
