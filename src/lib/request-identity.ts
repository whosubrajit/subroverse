import { createHmac } from "node:crypto"

const identifierHeaders = [
  "x-nf-client-connection-ip",
  "cf-connecting-ip",
  "x-real-ip",
  "x-forwarded-for",
] as const

export function getIpAddress(headers: Headers): string | null {
  for (const name of identifierHeaders) {
    const value = headers.get(name)?.split(",")[0]?.trim()
    if (value) return value.slice(0, 128)
  }
  return null
}

export function getRequestIdentifier(headers: Headers) {
  const ip = getIpAddress(headers)
  if (ip) return `ip:${ip}`

  return `client:${(headers.get("user-agent") ?? "unknown").slice(0, 512)}`
}

export function rateLimitKey(action: string, identifier: string, secret: string) {
  return createHmac("sha256", secret).update(`${action}\0${identifier}`).digest("hex")
}
