import assert from "node:assert/strict"
import test from "node:test"
import { blankStory, encodeEditorDraft, normalizeEditorStory, readEditorDraft, saveEditorStory, storyPayload, toLocalDateTime, toStoredDateTime } from "../src/lib/story-editor.ts"

test("editing preserves the explicit series slug and exact publication instant", () => {
  const initial = { ...blankStory, id: "story-1", series: "শ্রী", seriesSlug: "shree", publishedAt: "2026-09-01T10:30:27.123Z" }
  const editor = normalizeEditorStory(initial)
  const payload = storyPayload({ ...editor, body: "Edited body" }, initial)
  assert.equal(payload.seriesSlug, "shree")
  assert.equal(payload.publishedAt, initial.publishedAt)
})

test("datetime-local round trips in Dhaka, UTC and DST time zones", () => {
  const previousTZ = process.env.TZ
  try {
    for (const timezone of ["Asia/Dhaka", "UTC", "America/New_York"]) {
      process.env.TZ = timezone
      for (const iso of ["2026-09-01T10:30:00.000Z", "2026-11-01T06:30:59.123Z"]) {
        const local = toLocalDateTime(iso)
        assert.equal(toStoredDateTime(local, iso), iso)
      }
    }
    process.env.TZ = "Asia/Dhaka"
    assert.equal(toLocalDateTime("2026-09-01T10:30:00Z"), "2026-09-01T16:30")
    assert.equal(toStoredDateTime("2026-09-01T17:30"), "2026-09-01T11:30:00.000Z")
    assert.equal(toStoredDateTime(""), null)
    assert.throws(() => toStoredDateTime("bad date"), /valid publishing date/)
  } finally {
    if (previousTZ === undefined) delete process.env.TZ
    else process.env.TZ = previousTZ
  }
})

test("existing and new stories recover drafts without replacing the server's identity", () => {
  for (const id of [undefined, "existing-story"]) {
    const initial = normalizeEditorStory({ ...blankStory, id, title: "Server", seriesSlug: "shree" })
    const draft = { ...initial, id: "untrusted-id", title: "Recovered", body: "Unfinished writing" }
    for (const raw of [JSON.stringify(draft), encodeEditorDraft(draft, initial)]) {
      const recovered = readEditorDraft(raw, initial)
      assert.equal(recovered.id, id)
      assert.equal(recovered.title, "Recovered")
      assert.equal(recovered.body, "Unfinished writing")
      assert.equal(recovered.seriesSlug, "shree")
    }
  }
})

test("unchanged and malformed recovery drafts are ignored", () => {
  const initial = normalizeEditorStory({ ...blankStory, id: "story-1" })
  assert.equal(readEditorDraft(encodeEditorDraft(initial, initial), initial), null)
  for (const raw of [null, "bad json", "null", "[]", '{"body":42}', '{"version":1,"story":null}']) {
    assert.equal(readEditorDraft(raw, initial), null)
  }
})

test("editor sends PATCH for existing stories and POST for new ones", async () => {
  for (const id of [undefined, "story-1"]) {
    const story = { ...blankStory, id, title: "Title", excerpt: "Excerpt", body: "Body" }
    const saved = await saveEditorStory(story, {}, "draft", async (url, init) => {
      assert.equal(url, id ? `/api/admin/stories/${id}` : "/api/admin/stories")
      assert.equal(init.method, id ? "PATCH" : "POST")
      assert.equal(JSON.parse(init.body).status, "draft")
      assert.ok(init.signal instanceof AbortSignal)
      return Response.json({ story: { id: id ?? "new-id" } })
    })
    assert.equal(saved.id, id ?? "new-id")
  }
})

test("network failures, HTML errors, malformed JSON and rejected saves remain retryable", async () => {
  const story = { ...blankStory, title: "Don't lose this", body: "Unsaved text" }
  const original = structuredClone(story)
  const failures = [
    async () => { throw new TypeError("Network unavailable") },
    async () => new Response("<html>Bad gateway</html>", { status: 502 }),
    async () => new Response("bad json", { status: 200 }),
    async () => Response.json({ error: "Slug already exists" }, { status: 409 }),
    async () => Response.json({ story: null }),
  ]
  for (const fetcher of failures) {
    await assert.rejects(saveEditorStory(story, {}, "draft", fetcher))
    assert.deepEqual(story, original)
  }
  assert.deepEqual(await saveEditorStory(story, {}, "draft", async () => Response.json({ story: { id: "saved" } })), { id: "saved" })
})
