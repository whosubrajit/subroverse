import { getDb } from "@/db"
import { seriesMetadata, stories } from "@/db/schema"
import { eq, isNotNull, sql } from "drizzle-orm"

export async function getAllSeriesNames(): Promise<string[]> {
  const db = await getDb()
  // Fetch all unique series names from stories
  const rows = await db
    .select({ name: stories.series })
    .from(stories)
    .where(isNotNull(stories.series))
    .groupBy(stories.series)

  return rows.map((r) => r.name as string).filter(Boolean)
}

export async function getAllSeriesMetadata() {
  const db = await getDb()
  const rows = await db.select().from(seriesMetadata)
  return rows
}

export async function updateSeriesMetadata(name: string, description: string) {
  const db = await getDb()
  
  if (!description.trim()) {
    // If description is empty, delete it
    await db.delete(seriesMetadata).where(eq(seriesMetadata.name, name))
    return null
  }

  const [upserted] = await db
    .insert(seriesMetadata)
    .values({ name, description })
    .onConflictDoUpdate({
      target: seriesMetadata.name,
      set: { description, updatedAt: sql`now()` },
    })
    .returning()
    
  return upserted
}
