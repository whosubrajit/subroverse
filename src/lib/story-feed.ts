import { z } from "zod"

const publicStorySchema = z.object({
  id: z.union([z.string(), z.number()]),
  slug: z.string().optional(),
  title: z.string(),
  category: z.string(),
  series: z.string().optional(),
  seriesSlug: z.string().optional(),
  date: z.string(),
  readTime: z.string(),
  excerpt: z.string(),
  body: z.union([z.string(), z.array(z.string())]),
})
export type PublicStory = z.infer<typeof publicStorySchema>

const feedSchema = z.object({
  configured: z.boolean(),
  stories: z.array(publicStorySchema),
})

export async function loadStoryFeed(
  fetcher: typeof fetch = fetch,
): Promise<PublicStory[]> {
  const response = await fetcher("/api/stories", {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok)
    throw new Error("Stories could not be loaded. Please try again.")
  const parsed = feedSchema.safeParse(await response.json())
  if (!parsed.success || !parsed.data.configured)
    throw new Error(
      "Stories are temporarily unavailable. Please try again later.",
    )
  return parsed.data.stories // An empty database is a real, successful result.
}
