import { desc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDb } from "@/db"
import { subscribers } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"

export const runtime = "nodejs"

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await getDb()
    .select({
      email: subscribers.email,
      subscribedAt: subscribers.confirmedAt,
      source: subscribers.source,
    })
    .from(subscribers)
    .where(eq(subscribers.status, "active"))
    .orderBy(desc(subscribers.confirmedAt))

  const csv = [
    "email,subscribed_at,source",
    ...rows.map((row) =>
      [
        csvCell(row.email),
        csvCell(row.subscribedAt?.toISOString() ?? ""),
        csvCell(row.source),
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
