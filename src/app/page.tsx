import PublicSite from "@/components/PublicSite"
import { readPublicSiteSettings } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const settings = await readPublicSiteSettings()
  return (
    <>
      <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: 0 }}>
        SubroVerse, a storyverse by {settings.profileName}
      </h1>
      <PublicSite settings={settings} />
    </>
  )
}
