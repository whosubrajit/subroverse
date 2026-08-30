import { desc } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDb } from "@/db"
import { stories, storyRevisions } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"
import { slugify, storyInputSchema, storyMetrics } from "@/lib/stories"

export const runtime = "nodejs"

export async function GET() {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await getDb().select().from(stories).orderBy(desc(stories.updatedAt))
  return NextResponse.json({ stories: rows })
}

export async function POST(request: Request) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = storyInputSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete the required story fields.", issues: parsed.error.issues }, { status: 400 })
  }

  const input = parsed.data
  const slug = slugify(input.slug || input.title)
  if (!slug) return NextResponse.json({ error: "The story needs a usable slug." }, { status: 400 })
  const metrics = storyMetrics(input.body)
  const now = new Date()
  const scheduledFor = input.scheduledFor ? new Date(input.scheduledFor) : null
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : (input.status === "published" ? now : null)

  try {
    const [created] = await getDb()
      .insert(stories)
      .values({
        ...input,
        slug,
        scheduledFor,
        canonicalUrl: input.canonicalUrl || null,
        publishedAt,
        ...metrics,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning()

    await getDb().insert(storyRevisions).values({
      storyId: created.id,
      revision: 1,
      snapshot: created,
      note: "Initial version",
      createdBy: user.id,
    })

    return NextResponse.json({ story: created }, { status: 201 })
  } catch (error) {
    console.error("Story creation failed", error)
    return NextResponse.json({ error: "That slug may already exist." }, { status: 409 })
  }
}
