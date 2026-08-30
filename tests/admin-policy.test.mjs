import assert from "node:assert/strict"
import test from "node:test"
import { isAdminEmail } from "../src/lib/admin-policy.ts"

test("both configured admin accounts can enter", () => {
  const env = { ADMIN_EMAILS: "first@example.com, second@example.com" }
  assert.equal(isAdminEmail("first@example.com", env), true)
  assert.equal(isAdminEmail("second@example.com", env), true)
})

test("normalizes whitespace and casing without broadening the allowlist", () => {
  const env = { ADMIN_EMAILS: " FIRST@example.com, , second@example.com " }
  assert.equal(isAdminEmail(" First@Example.com ", env), true)
  assert.equal(isAdminEmail("first@example.com.attacker.test", env), false)
  assert.equal(isAdminEmail("stranger@example.com", env), false)
  assert.equal(isAdminEmail("", env), false)
})

test("missing configuration never grants admin access", () => {
  assert.equal(isAdminEmail("first@example.com", {}), false)
  assert.equal(isAdminEmail("", {}), false)
})

test("legacy single admin configuration remains supported", () => {
  assert.equal(isAdminEmail("first@example.com", { ADMIN_EMAIL: "first@example.com" }), true)
})
