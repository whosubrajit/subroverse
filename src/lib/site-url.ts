export function getSiteUrl() {
  let value = process.env.NEXT_PUBLIC_SITE_URL || "https://subroverse.com"
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`

  try {
    return new URL(value)
  } catch {
    return new URL("https://subroverse.com")
  }
}
