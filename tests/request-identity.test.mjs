import assert from "node:assert/strict"
import test from "node:test"
import { getRequestIdentifier, rateLimitKey } from "../src/lib/request-identity.ts"

test("trusted platform address headers take precedence and forwarded lists use the first address", () => {
  assert.equal(getRequestIdentifier(new Headers({
    "x-nf-client-connection-ip": "203.0.113.10",
    "cf-connecting-ip": "203.0.113.11",
    "x-forwarded-for": "203.0.113.12, 10.0.0.1",
  })), "ip:203.0.113.10")
  assert.equal(getRequestIdentifier(new Headers({
    "x-forwarded-for": "203.0.113.12, 10.0.0.1",
  })), "ip:203.0.113.12")
})

test("missing address metadata falls back to a bounded client label", () => {
  assert.equal(getRequestIdentifier(new Headers()), "client:unknown")
  assert.equal(getRequestIdentifier(new Headers({ "user-agent": "reader-browser" })), "client:reader-browser")
  assert.equal(getRequestIdentifier(new Headers({ "user-agent": "x".repeat(800) })).length, "client:".length + 512)
})

test("stored rate-limit keys are opaque, stable and separated by action", () => {
  const identifier = "ip:203.0.113.10"
  const first = rateLimitKey("newsletter", identifier, "secret-one")
  assert.equal(first, rateLimitKey("newsletter", identifier, "secret-one"))
  assert.notEqual(first, rateLimitKey("messages", identifier, "secret-one"))
  assert.notEqual(first, rateLimitKey("newsletter", identifier, "secret-two"))
  assert.equal(first.length, 64)
  assert.equal(first.includes("203.0.113.10"), false)
})
