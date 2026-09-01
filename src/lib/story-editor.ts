import { z } from "zod"

const editorStorySchema = z.object({
  id: z.string().optional(),
  title: z.string(), slug: z.string(), subtitle: z.string(), excerpt: z.string(), body: z.string(),
  format: z.string(), series: z.string(), seriesSlug: z.string().nullable().optional(),
  status: z.enum(["draft", "scheduled", "published", "archived"]), featured: z.boolean(),
  scheduledFor: z.string(), publishedAt: z.string(), seoTitle: z.string(), seoDescription: z.string(), canonicalUrl: z.string(),
})
export type EditorStory = z.infer<typeof editorStorySchema>
export type EditorStatus = EditorStory["status"]

export const blankStory: EditorStory = {
  title: "", slug: "", subtitle: "", excerpt: "", body: "", format: "Prose", series: "", seriesSlug: "",
  status: "draft", featured: false, scheduledFor: "", publishedAt: "", seoTitle: "", seoDescription: "", canonicalUrl: "",
}

export function toLocalDateTime(value: string) {
  if (!value) return ""
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ""
  return date.toLocaleString("sv-SE", { timeZone: "Asia/Dhaka" }).replace(" ", "T").slice(0, 16)
}

export function toStoredDateTime(value: string, original = "") {
  if (!value) return null
  // Keep seconds and DST ambiguity intact when the displayed field is unchanged.
  if (original && value === toLocalDateTime(original)) return new Date(original).toISOString()
  const date = new Date(value + "+06:00")
  if (!Number.isFinite(date.getTime())) throw new Error("Choose a valid publishing date and time.")
  return date.toISOString()
}

export function normalizeEditorStory(initial: Partial<EditorStory> = {}): EditorStory {
  return { ...blankStory, ...initial, scheduledFor: toLocalDateTime(initial.scheduledFor ?? ""), publishedAt: toLocalDateTime(initial.publishedAt ?? "") }
}

export function storyPayload(story: EditorStory, original: Partial<EditorStory>, status = story.status) {
  return {
    ...story, status,
    scheduledFor: toStoredDateTime(story.scheduledFor, original.scheduledFor),
    publishedAt: toStoredDateTime(story.publishedAt, original.publishedAt),
  }
}

export function encodeEditorDraft(story: EditorStory, original: Partial<EditorStory>) {
  const payload = storyPayload(story, original)
  return JSON.stringify({ version: 1, story: { ...payload, scheduledFor: payload.scheduledFor ?? "", publishedAt: payload.publishedAt ?? "" } })
}

export function readEditorDraft(raw: string | null, initial: EditorStory): EditorStory | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw)
    const candidate = value?.version === 1 ? value.story : value
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null
    const parsed = editorStorySchema.safeParse({ ...initial, ...candidate, id: initial.id })
    if (!parsed.success) return null
    const restored = normalizeEditorStory(parsed.data)
    return Object.keys(restored).every((key) => restored[key as keyof EditorStory] === initial[key as keyof EditorStory]) ? null : restored
  } catch { return null }
}

export async function saveEditorStory(story: EditorStory, original: Partial<EditorStory>, status: EditorStatus, fetcher: typeof fetch = fetch) {
  const response = await fetcher(story.id ? `/api/admin/stories/${story.id}` : "/api/admin/stories", {
    method: story.id ? "PATCH" : "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(storyPayload(story, original, status)),
    signal: AbortSignal.timeout(15000),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || typeof data?.story?.id !== "string") {
    throw new Error(typeof data?.error === "string" ? data.error : "The story could not be saved. Please try again.")
  }
  return data.story as { id: string }
}
