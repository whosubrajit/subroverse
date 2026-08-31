import assert from "node:assert/strict"
import test from "node:test"
import { fetchTrafficReport } from "../src/lib/analytics-report.ts"
import { isLocalAnalyticsHost, isPublicAnalyticsPath, publicAnalyticsLocation, sanitizeAnalyticsUrl } from "../src/lib/analytics-policy.ts"

test("hash pages map to distinct analytics paths and stories share canonical paths", () => {
  assert.deepEqual(publicAnalyticsLocation("home"), { path: "/", route: "/" })
  for (const page of ["about", "write", "stories"]) {
    assert.deepEqual(publicAnalyticsLocation(page), { path: `/${page}`, route: `/${page}` })
  }
  assert.deepEqual(publicAnalyticsLocation("home", { id: "123", slug: "my-story" }), { path: "/stories/my-story", route: "/stories/[slug]" })
  assert.equal(publicAnalyticsLocation("admin"), null)
})

test("tracking strips query strings and fragments and excludes private routes", () => {
  assert.equal(sanitizeAnalyticsUrl("https://example.test/write?email=private#secret"), "https://example.test/write")
  for (const path of ["/admin", "/admin/reset-password", "/api/messages", "/unknown", "//evil.test"]) {
    assert.equal(isPublicAnalyticsPath(path), false)
    assert.equal(sanitizeAnalyticsUrl(`https://example.test${path}?token=secret`), null)
  }
  assert.equal(sanitizeAnalyticsUrl("not a URL"), null)
})

test("development hosts do not collect production traffic", () => {
  for (const host of ["localhost", "test.localhost", "127.0.0.1", "[::1]", "0.0.0.0"]) assert.equal(isLocalAnalyticsHost(host), true)
  assert.equal(isLocalAnalyticsHost("subroverse.com"), false)
})

test("missing credentials do not call Cloudflare or invent totals", async () => {
  const result = await fetchTrafficReport({}, () => { throw new Error("Must not fetch") })
  assert.equal(result.status, "setup")
  assert.equal("visitors" in result, false)
})

test("Cloudflare count request stays server-side and returns distinct visitors and views", async () => {
  const result = await fetchTrafficReport({ token: "test-only", zoneId: "zone_test" }, async (url, options) => {
    assert.equal(url, "https://api.cloudflare.com/client/v4/graphql")
    assert.equal(options.method, "POST")
    assert.equal(options.headers["Authorization"], "Bearer test-only")
    assert.equal(options.next.revalidate, 300)
    
    const body = JSON.parse(options.body)
    assert.equal(body.variables.zoneTag, "zone_test")
    return Response.json({
      data: {
        viewer: {
          zones: [
            {
              httpRequests1dGroups: [
                { sum: { visits: 23, pageViews: 57 } }
              ]
            }
          ]
        }
      }
    })
  })
  assert.deepEqual(result, { status: "ready", visitors: 23, pageviews: 57 })
})

test("zero traffic is distinct from malformed or unavailable reports", async () => {
  const config = { token: "test-only", zoneId: "zone_test" }
  
  const validZeroPayload = {
    data: {
      viewer: {
        zones: [
          {
            httpRequests1dGroups: [] // no traffic
          }
        ]
      }
    }
  }
  assert.deepEqual(await fetchTrafficReport(config, async () => Response.json(validZeroPayload)), { status: "ready", visitors: 0, pageviews: 0 })
  
  for (const payload of [{}, { data: [] }, { data: { viewer: null } }, { errors: [{ message: "bad query" }] }]) {
    assert.equal((await fetchTrafficReport(config, async () => Response.json(payload))).status, "error")
  }
  
  for (const status of [401, 403, 500]) {
    const result = await fetchTrafficReport(config, async () => new Response("private upstream detail", { status }))
    assert.equal(result.status, "error")
    assert.equal(result.message.includes("private upstream detail"), false)
  }
  
  assert.equal((await fetchTrafficReport(config, async () => { throw new Error("timeout") })).status, "error")
})
