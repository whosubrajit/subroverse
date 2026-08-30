import { cache } from "react"
import { getAdminUser } from "@/lib/admin"
import { fetchTrafficReport, type TrafficReport } from "@/lib/analytics-report"

export const getAdminTrafficReport = cache(async (): Promise<TrafficReport> => {
  if (!(await getAdminUser())) return { status: "error", message: "Sign in to view traffic." }
  return fetchTrafficReport({
    token: process.env.VERCEL_TOKEN,
    projectId: process.env.VERCEL_PROJECT_ID,
    teamId: process.env.VERCEL_TEAM_ID,
  })
})
