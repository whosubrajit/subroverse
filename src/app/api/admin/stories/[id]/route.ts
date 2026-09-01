import { and, eq, max, ne } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getDb } from "@/db"
import { stories, storyRevisions } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"
import { slugify, storyInputSchema, storyMetrics } from "@/lib/stories"

type StoryContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: StoryContext) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await context.params
  const parsed = storyInputSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid story data.", issues: parsed.error.issues }, { status: 400 })

  const db = getDb()
  const [existing] = await db.select().from(stories).where(and(eq(stories.id, id), ne(stories.status, "archived"))).limit(1)
  if (!existing) return NextResponse.json({ error: "Story not found." }, { status: 404 })

  const input = parsed.data
  const slug = slugify(input.slug || input.title)
  if (!slug) return NextResponse.json({ error: "The story needs a usable slug." }, { status: 400 })
  const seriesSlug = input.series ? (slugify(input.seriesSlug || input.series) || null) : null
  const scheduledFor = input.scheduledFor ? new Date(input.scheduledFor) : null
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : (input.status === "published" ? existing.publishedAt ?? new Date() : existing.publishedAt)
  
  try {
    const [updated] = await db
      .update(stories)
      .set({
        ...input,
        slug,
        seriesSlug,
        scheduledFor,
        canonicalUrl: input.canonicalUrl || null,
        publishedAt,
        ...storyMetrics(input.body),
        updatedBy: user.id,
        updatedAt: new Date(),
      })
      .where(eq(stories.id, id))
      .returning()

    const [latest] = await db.select({ value: max(storyRevisions.revision) }).from(storyRevisions).where(eq(storyRevisions.storyId, id))
    await db.insert(storyRevisions).values({
      storyId: id,
      revision: (latest?.value ?? 0) + 1,
      snapshot: updated,
      note: "Saved from the story studio",
      createdBy: user.id,
    })

    return NextResponse.json({ story: updated })
  } catch (error) {
    console.error("Story update failed", error)
    return NextResponse.json({ error: "That slug may already exist." }, { status: 409 })
  }
}

export async function DELETE(_request: Request, context: StoryContext) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await context.params
  const [archived] = await getDb()
    .update(stories)
    .set({ status: "archived", featured: false, updatedBy: user.id, updatedAt: new Date() })
    .where(eq(stories.id, id))
    .returning({ id: stories.id })
  if (!archived) return NextResponse.json({ error: "Story not found." }, { status: 404 })
  return NextResponse.json({ ok: true })
}
