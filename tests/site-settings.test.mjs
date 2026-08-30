import assert from "node:assert/strict"
import test from "node:test"
import { defaultSiteSettings, siteSettingsSchema } from "../src/lib/site-settings-schema.ts"

test("existing public copy is a valid default settings document", () => {
  assert.deepEqual(siteSettingsSchema.parse(defaultSiteSettings), defaultSiteSettings)
})

test("settings validate text and normalize surrounding whitespace", () => {
  assert.equal(siteSettingsSchema.parse({ ...defaultSiteSettings, homeEyebrow: "  Hello  " }).homeEyebrow, "Hello")
  for (const homeIntroduction of ["", "  ", "a".repeat(1201)]) {
    assert.equal(siteSettingsSchema.safeParse({ ...defaultSiteSettings, homeIntroduction }).success, false)
  }
})

test("newsletter settings accept disabling and bound the delay", () => {
  assert.equal(siteSettingsSchema.parse({ ...defaultSiteSettings, newsletterEnabled: false, newsletterDelaySeconds: 0 }).newsletterEnabled, false)
  for (const newsletterDelaySeconds of [-1, 61, null, "1", Infinity]) {
    assert.equal(siteSettingsSchema.safeParse({ ...defaultSiteSettings, newsletterDelaySeconds }).success, false)
  }
})

test("settings cannot be used to update secrets or the admin allowlist", () => {
  assert.equal(siteSettingsSchema.safeParse({ ...defaultSiteSettings, ADMIN_EMAILS: "intruder@example.test" }).success, false)
  assert.equal(siteSettingsSchema.safeParse({ newsletterEnabled: true }).success, false)
})
