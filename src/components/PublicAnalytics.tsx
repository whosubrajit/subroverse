"use client"

import { useEffect, useState } from "react"
import { Analytics, type BeforeSend } from "@vercel/analytics/react"
import { isLocalAnalyticsHost, isPublicAnalyticsPath, sanitizeAnalyticsUrl } from "@/lib/analytics-policy"

const beforeSend: BeforeSend = event => {
  if (window.location.pathname.startsWith("/admin") || navigator.doNotTrack === "1") return null
  const url = sanitizeAnalyticsUrl(event.url)
  return url ? { ...event, url } : null
}

export default function PublicAnalytics({ location }: { location: { path: string; route: string } | null }) {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    setEnabled(process.env.NODE_ENV === "production" && !isLocalAnalyticsHost(window.location.hostname) && navigator.doNotTrack !== "1")
  }, [])
  if (!enabled || !location || !isPublicAnalyticsPath(location.path)) return null
  // Explicit routes disable automatic history tracking: the site's hash pages
  // become separate page views, without counting both automatic and manual views.
  return <Analytics framework="next" path={location.path} route={location.route} beforeSend={beforeSend} />
}
