import { z } from "zod"

const countsSchema = z.object({
  data: z.object({ visitors: z.number().int().nonnegative(), pageviews: z.number().int().nonnegative() }),
})

export type TrafficReport =
  | { status: "ready"; visitors: number; pageviews: number }
  | { status: "setup" | "error"; message: string }

type AnalyticsConfig = { token?: string; projectId?: string; teamId?: string }

export function analyticsCountUrl(config: AnalyticsConfig) {
  const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/count")
  url.searchParams.set("projectId", config.projectId || "")
  if (config.teamId) url.searchParams.set("teamId", config.teamId)
  url.searchParams.set("filter", "not startswith(requestPath, '/admin') and not startswith(requestPath, '/api')")
  return url
}

export async function fetchTrafficReport(config: AnalyticsConfig, fetcher: typeof fetch = fetch): Promise<TrafficReport> {
  if (!config.token || !config.projectId) {
    return { status: "setup", message: "Connect Vercel Analytics to show real visitor counts. Set VERCEL_TOKEN and VERCEL_PROJECT_ID on the server; add VERCEL_TEAM_ID for a team-owned project." }
  }
  try {
    const response = await fetcher(analyticsCountUrl(config), {
      headers: { Authorization: `Bearer ${config.token}` },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    })
    if (!response.ok) {
      const message = response.status === 401 || response.status === 403
        ? "Vercel denied analytics access. Check the server token, project ID and team ID."
        : response.status === 402
          ? "Vercel requires an analytics plan change for this request. Review your project’s Web Analytics settings."
          : response.status === 429
            ? "Vercel’s analytics rate limit was reached. Please try again later."
            : "Vercel analytics is unavailable. Check that Web Analytics is enabled and try again."
      return { status: "error", message }
    }
    const result = countsSchema.safeParse(await response.json())
    if (!result.success) return { status: "error", message: "Vercel returned an unexpected response. Visitor totals are unavailable." }
    return { status: "ready", ...result.data.data }
  } catch {
    return { status: "error", message: "Could not reach Vercel Analytics. Please try again later." }
  }
}
