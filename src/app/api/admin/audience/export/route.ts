import { desc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDb } from "@/db"
import { subscribers } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"
import { csvCell } from "@/lib/csv"
import { getSiteUrl } from "@/lib/site-url"
import { unsubscribeUrl } from "@/lib/unsubscribe"

export const runtime = "nodejs"

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await getDb()
    .select({
      id: subscribers.id,
      email: subscribers.email,
      subscribedAt: subscribers.confirmedAt,
      source: subscribers.source,
    })
    .from(subscribers)
    .where(eq(subscribers.status, "active"))
    .orderBy(desc(subscribers.confirmedAt))

  const origin = getSiteUrl().origin
  const sharedUnsubscribeUrl = unsubscribeUrl(origin)
  const exportRows = rows.map((row) => ({ ...row, unsubscribeUrl: sharedUnsubscribeUrl }))

  const csv = [
    "email,subscribed_at,source,unsubscribe_url",
    ...exportRows.map((row) =>
      [
        csvCell(row.email),
        csvCell(row.subscribedAt?.toISOString() ?? ""),
        csvCell(row.source),
        csvCell(row.unsubscribeUrl),
      ].join(","),
    ),
  ].join("\n")

  const date = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      "content-disposition": `attachment; filename="subroverse-subscribers-${date}.csv"`,
      "content-type": "text/csv; charset=utf-8",
    },
  })
}
