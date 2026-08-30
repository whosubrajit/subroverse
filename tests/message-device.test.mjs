import assert from "node:assert/strict"
import test from "node:test"
import { getMessageDevice } from "../src/lib/message-device.ts"

test("message device labels recognize common browser user agents", () => {
  const cases = [
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Desktop", "Windows"],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "Desktop", "macOS"],
    ["Mozilla/5.0 (X11; Linux x86_64)", "Desktop", "Linux"],
    ["Mozilla/5.0 (X11; CrOS x86_64 123)", "Desktop", "ChromeOS"],
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile", "Phone", "iOS"],
    ["Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) Mobile", "Tablet", "iPadOS"],
    ["Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile Safari/537.36", "Phone", "Android"],
    ["Mozilla/5.0 (Linux; Android 14) Chrome/120 Safari/537.36", "Tablet", "Android"],
  ]
  for (const [ua, deviceType, operatingSystem] of cases) {
    assert.deepEqual(getMessageDevice(new Headers({ "user-agent": ua })), { deviceType, operatingSystem })
  }
})

test("low entropy browser hints work without storing raw headers", () => {
  assert.deepEqual(getMessageDevice(new Headers({ "sec-ch-ua-platform": '"Android"', "sec-ch-ua-mobile": "?1" })), { deviceType: "Phone", operatingSystem: "Android" })
})

test("missing or unrecognized metadata stays unknown", () => {
  for (const headers of [new Headers(), new Headers({ "user-agent": "custom", "sec-ch-ua-platform": '"made up"' })]) {
    assert.deepEqual(getMessageDevice(headers), { deviceType: "Unknown", operatingSystem: "Unknown" })
  }
})
