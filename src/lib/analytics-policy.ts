export function isPublicAnalyticsPath(path: string) {
  return ["/", "/about", "/write", "/stories"].includes(path) || /^\/stories\/[^/?#]+$/.test(path)
}

export function publicAnalyticsLocation(page: string, story?: { id: string | number; slug?: string } | null) {
  if (story) return { path: `/stories/${encodeURIComponent(story.slug || String(story.id))}`, route: "/stories/[slug]" }
  const path = page === "home" ? "/" : `/${page}`
  return isPublicAnalyticsPath(path) ? { path, route: path } : null
}

export function sanitizeAnalyticsUrl(value: string) {
  try {
    const url = new URL(value)
    if (!isPublicAnalyticsPath(url.pathname)) return null
    url.search = ""
    url.hash = ""
    return url.toString()
  } catch { return null }
}

export function isLocalAnalyticsHost(host: string) {
  return host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1" || host === "[::1]" || host === "0.0.0.0"
}
