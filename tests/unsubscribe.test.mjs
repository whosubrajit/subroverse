import assert from "node:assert/strict"
import test from "node:test"
import { unsubscribeUrl } from "../src/lib/unsubscribe.ts"

test("mass-mail unsubscribe URL is shared and contains no recipient data", () => {
  const url = unsubscribeUrl("https://subroverse.com")
  assert.equal(url, "https://subroverse.com/unsubscribe")
  assert.equal(url.includes("?"), false)
})
