import { z } from "zod"

const cloudflareResponseSchema = z.object({
  data: z.object({
    viewer: z.object({
      zones: z.array(
        z.object({
          httpRequests1dGroups: z.array(
            z.object({
              sum: z.object({
                pageViews: z.number().int().nonnegative(),
              }),
              uniq: z.object({
                uniques: z.number().int().nonnegative(),
              }),
            })
          ),
        })
      ),
    }),
  }),
})

export type TrafficReport =
  | { status: "ready"; visitors: number; pageviews: number }
  | { status: "setup" | "error"; message: string }

type AnalyticsConfig = { token?: string; zoneId?: string }

export function analyticsGraphQLQuery(zoneId: string) {
  // Query traffic for the last 30 days
  const dateGt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  return JSON.stringify({
    query: `
      query getZoneTraffic($zoneTag: string!, $dateGt: date!) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequests1dGroups(
              limit: 10000,
              filter: { date_gt: $dateGt }
            ) {
              sum {
                pageViews
              }
              uniq {
                uniques
              }
            }
          }
        }
      }
    `,
    variables: {
      zoneTag: zoneId,
      dateGt: dateGt,
    },
  })
}

export async function fetchTrafficReport(config: AnalyticsConfig, fetcher: typeof fetch = fetch): Promise<TrafficReport> {
  if (!config.token || !config.zoneId) {
    return { status: "setup", message: "Connect Cloudflare Analytics to show real visitor counts. Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID on the server." }
  }
  try {
    const response = await fetcher("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: analyticsGraphQLQuery(config.zoneId),
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    })
    
    if (!response.ok) {
      const message = response.status === 401 || response.status === 403
        ? "Cloudflare denied analytics access. Check the server token and zone ID."
        : "Cloudflare analytics is unavailable. Please try again later."
      return { status: "error", message }
    }
    
    const json = await response.json()
    if (json.errors && json.errors.length > 0) {
      return { status: "error", message: `Cloudflare GraphQL error: ${json.errors[0].message}` }
    }

    const result = cloudflareResponseSchema.safeParse(json)
    if (!result.success) return { status: "error", message: "Cloudflare returned an unexpected response. Visitor totals are unavailable." }
    
    // Sum up the daily aggregations
    let totalVisitors = 0
    let totalPageviews = 0
    const zones = result.data.data.viewer.zones
    if (zones.length > 0) {
      for (const group of zones[0].httpRequests1dGroups) {
        totalVisitors += group.uniq.uniques
        totalPageviews += group.sum.pageViews
      }
    }
    
    return { status: "ready", visitors: totalVisitors, pageviews: totalPageviews }
  } catch (error) {
    return { status: "error", message: "Could not reach Cloudflare Analytics. Please try again later." }
  }
}
