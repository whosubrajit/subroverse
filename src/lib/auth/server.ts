import { createNeonAuth, type NeonAuth } from "@neondatabase/auth/next/server"

let authInstance: NeonAuth | null = null

export function isNeonAuthConfigured() {
  return Boolean(
    process.env.NEON_AUTH_BASE_URL &&
      process.env.NEON_AUTH_COOKIE_SECRET &&
      process.env.NEON_AUTH_COOKIE_SECRET.length >= 32,
  )
}

export function getAuth() {
  if (authInstance) return authInstance
  if (!isNeonAuthConfigured()) {
    throw new Error("Neon Auth is not configured")
  }

  authInstance = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
      secret: process.env.NEON_AUTH_COOKIE_SECRET!,
      sessionDataTtl: 300,
    },
    logLevel: process.env.NODE_ENV === "production" ? "warn" : "error",
  })
  return authInstance
}
