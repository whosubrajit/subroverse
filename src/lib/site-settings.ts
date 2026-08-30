import { eq } from "drizzle-orm"
import { getDb } from "@/db"
import { siteSettings } from "@/db/schema"
import { defaultSiteSettings, siteSettingsSchema } from "@/lib/site-settings-schema"

export const PUBLIC_SETTINGS_KEY = "public-site"

export async function readSiteSettings() {
  const [row] = await getDb().select({ value: siteSettings.value }).from(siteSettings)
    .where(eq(siteSettings.key, PUBLIC_SETTINGS_KEY)).limit(1)
  return row ? siteSettingsSchema.parse({ ...defaultSiteSettings, ...(row.value as object) }) : { ...defaultSiteSettings }
}

export async function readPublicSiteSettings() {
  try {
    return await readSiteSettings()
  } catch {
    // A settings outage must not prevent readers from opening the site.
    return { ...defaultSiteSettings }
  }
}
