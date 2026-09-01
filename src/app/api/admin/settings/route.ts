import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getAdminUser } from "@/lib/admin"
import { getDb } from "@/db"
import { siteSettings } from "@/db/schema"
import { siteSettingsSchema } from "@/lib/site-settings-schema"
import { PUBLIC_SETTINGS_KEY, readSiteSettings } from "@/lib/site-settings"

export async function GET() {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    return NextResponse.json({ settings: await readSiteSettings() })
  } catch {
    return NextResponse.json({ error: "Could not load settings. Check the database connection and migrations." }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // Mutations are only accepted from this site's own origin.
  const origin = request.headers.get("origin")
  // Next's request URL may use the bind address (0.0.0.0) in development;
  // the Host header identifies the actual site visited by the browser.
  let sameHost = false
  try { sameHost = Boolean(origin && new URL(origin).host === request.headers.get("host")) } catch { /* Invalid Origin */ }
  if (!sameHost) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 })
  }
  const parsed = siteSettingsSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Check the text fields and use a delay between 0 and 60 seconds." }, { status: 400 })
  try {
    await getDb().insert(siteSettings).values({
      key: PUBLIC_SETTINGS_KEY, value: parsed.data, updatedBy: user.id,
    }).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: parsed.data, updatedBy: user.id, updatedAt: new Date() },
    })
    revalidatePath("/", "layout")
    revalidatePath("/admin/settings")
    return NextResponse.json({ settings: parsed.data })
  } catch {
    return NextResponse.json({ error: "Settings were not saved. Check the database connection and try again." }, { status: 503 })
  }
}
