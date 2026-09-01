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

test("Cloudflare request groups daily IP counts and page views without calling them people", async () => {
  const result = await fetchTrafficReport({ token: "test-only", zoneId: "zone_test" }, async (url, options) => {
    assert.equal(url, "https://api.cloudflare.com/client/v4/graphql")
    assert.equal(options.method, "POST")
    assert.equal(options.headers["Authorization"], "Bearer test-only")
    assert.equal(options.next.revalidate, 300)

    const body = JSON.parse(options.body)
    assert.equal(body.variables.zoneTag, "zone_test")
    assert.match(body.query, /dimensions\s*\{\s*date\s*\}/)
    assert.ok(body.variables.dateLeq > body.variables.dateGt)
    return Response.json({
      data: {
        viewer: {
          zones: [
            {
              httpRequests1dGroups: [
                {
                  dimensions: { date: "2026-09-01" },
                  sum: { pageViews: 57 },
                  uniq: { uniques: 23 }
                }
              ]
            }
          ]
        }
      }
    })
  })
  assert.deepEqual(result, { status: "ready", dailyUniqueIPs: 23, pageviews: 57 })
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
  assert.deepEqual(await fetchTrafficReport(config, async () => Response.json(validZeroPayload)), { status: "ready", dailyUniqueIPs: 0, pageviews: 0 })

  for (const payload of [{}, { data: [] }, { data: { viewer: null } }, { data: { viewer: { zones: [] } } }, { errors: [{ message: "bad query" }] }]) {
    assert.equal((await fetchTrafficReport(config, async () => Response.json(payload))).status, "error")
  }

  for (const status of [401, 403, 500]) {
    const result = await fetchTrafficReport(config, async () => new Response("private upstream detail", { status }))
    assert.equal(result.status, "error")
    assert.equal(result.message.includes("private upstream detail"), false)
  }

  assert.equal((await fetchTrafficReport(config, async () => { throw new Error("timeout") })).status, "error")
})

test("daily returning IPs are explicitly summed and upstream errors stay private", async () => {
  const config = { token: "test-only", zoneId: "zone_test" }
  const report = await fetchTrafficReport(config, async () => Response.json({ data: { viewer: { zones: [{ httpRequests1dGroups: [
    { dimensions: { date: "2026-08-31" }, sum: { pageViews: 10 }, uniq: { uniques: 3 } },
    { dimensions: { date: "2026-09-01" }, sum: { pageViews: 8 }, uniq: { uniques: 3 } },
  ] }] } } }))
  assert.deepEqual(report, { status: "ready", dailyUniqueIPs: 6, pageviews: 18 })
  assert.equal("visitors" in report, false)
  const failed = await fetchTrafficReport(config, async () => Response.json({ errors: [{ message: "private server detail" }] }))
  assert.equal(failed.status, "error")
  assert.equal(failed.message.includes("private server detail"), false)
})
