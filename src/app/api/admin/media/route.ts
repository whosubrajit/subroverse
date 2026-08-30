import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/db"
import { media } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"

const mediaSchema = z.object({
  storageKey: z.string().min(1).max(1024),
  url: z.url(),
  filename: z.string().min(1).max(300),
  mimeType: z.string().startsWith("image/"),
  bytes: z.number().int().positive().max(20 * 1024 * 1024),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  altText: z.string().trim().max(500).default(""),
})

export async function GET() {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await getDb().select().from(media).orderBy(desc(media.createdAt))
  return NextResponse.json({ media: rows })
}

export async function POST(request: Request) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const parsed = mediaSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid media metadata." }, { status: 400 })
  const [created] = await getDb().insert(media).values({ ...parsed.data, uploadedBy: user.id }).returning()
  return NextResponse.json({ media: created }, { status: 201 })
}
