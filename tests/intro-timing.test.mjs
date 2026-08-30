import assert from "node:assert/strict"
import test from "node:test"
import { introDuration, shouldShowEntryIntro } from "../src/lib/intro-timing.ts"

test("direct story links skip the welcome screen", () => {
  assert.equal(shouldShowEntryIntro("#story/1"), false)
  assert.equal(shouldShowEntryIntro("#story/database-story-id"), false)
})

test("main page entry retains the welcome screen", () => {
  for (const hash of ["", "#about", "#write", "#stories"]) {
    assert.equal(shouldShowEntryIntro(hash), true)
  }
})

test("full entrance completes in five seconds", () => {
  assert.equal(introDuration("full"), 5000)
})

test("page transitions complete in one second", () => {
  assert.equal(introDuration("compact"), 1000)
})

test("reduced motion does not impose an animation delay", () => {
  assert.equal(introDuration("full", true), 150)
  assert.equal(introDuration("compact", true), 150)
})
