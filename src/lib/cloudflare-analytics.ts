import { cache } from "react"
import { getAdminUser } from "@/lib/admin"
import { fetchTrafficReport, type TrafficReport } from "@/lib/analytics-report"

export const getAdminTrafficReport = cache(async (): Promise<TrafficReport> => {
  if (!(await getAdminUser())) return { status: "error", message: "Sign in to view traffic." }
  return fetchTrafficReport({
    token: process.env.CLOUDFLARE_API_TOKEN,
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
  })
})
