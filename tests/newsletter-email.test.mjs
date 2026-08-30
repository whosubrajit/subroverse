import assert from "node:assert/strict"
import test from "node:test"
import { newsletterEmailSchema } from "../src/lib/newsletter-email.ts"

test("newsletter accepts Gmail and iCloud and normalizes casing and whitespace", () => {
  for (const email of ["reader@gmail.com", "reader@icloud.com", "reader+stories@gmail.com"]) {
    assert.equal(newsletterEmailSchema.parse(email), email)
  }
  assert.equal(newsletterEmailSchema.parse("  Reader@GMAIL.COM  "), "reader@gmail.com")
  assert.equal(newsletterEmailSchema.parse("Reader@ICLOUD.COM"), "reader@icloud.com")
})

test("newsletter rejects other providers, lookalike domains and malformed addresses", () => {
  for (const email of [
    "reader@yahoo.com", "reader@outlook.com", "reader@me.com", "reader@googlemail.com",
    "reader@gmail.com.evil.test", "reader@fakegmail.com", "reader@sub.icloud.com",
    "reader@gmail.co", "reader@icloud.com.evil.test", "@gmail.com", "reader@@gmail.com",
    "reader gmail.com", "reader..name@gmail.com", "", null,
  ]) {
    assert.equal(newsletterEmailSchema.safeParse(email).success, false, String(email))
  }
})
