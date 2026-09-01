import assert from "node:assert/strict"
import test from "node:test"
import { loadStoryFeed } from "../src/lib/story-feed.ts"

test("empty database stays empty instead of displaying sample stories", async () => {
  assert.deepEqual(await loadStoryFeed(async () => Response.json({ configured: true, stories: [] })), [])
})

test("public feed accepts real stories and disables stale fetch caching", async () => {
  const story = { id: "one", slug: "one", title: "One", category: "Prose", date: "September 1, 2026", readTime: "1 min", excerpt: "Intro", body: ["Body"], seriesSlug: "shree" }
  const result = await loadStoryFeed(async (url, options) => {
    assert.equal(url, "/api/stories")
    assert.equal(options.cache, "no-store")
    return Response.json({ configured: true, stories: [story] })
  })
  assert.deepEqual(result, [story])
})

test("unconfigured, failed and malformed feeds reject rather than inventing content", async () => {
  for (const response of [
    Response.json({ configured: false, stories: [] }),
    Response.json({ configured: true, stories: [{ title: "incomplete" }] }),
    Response.json({ configured: true, stories: [] }, { status: 500 }),
    new Response("bad json"),
  ]) await assert.rejects(loadStoryFeed(async () => response))
  await assert.rejects(loadStoryFeed(async () => { throw new Error("offline") }))
})
