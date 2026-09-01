import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/db"
import { subscribers } from "@/db/schema"
import { consumeRateLimit, getRequestIdentifier } from "@/lib/rate-limit"

export const runtime = "nodejs"

const unsubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(320)),
  company: z.string().max(200).optional().default(""),
})

function resultRedirect(request: Request, status: "success" | "invalid") {
  return NextResponse.redirect(new URL(`/unsubscribe?status=${status}`, request.url), 303)
}

export async function POST(request: Request) {
  try {
    const parsed = unsubscribeSchema.safeParse(Object.fromEntries(await request.formData()))
    if (!parsed.success) return resultRedirect(request, "invalid")

    // Quietly accept the honeypot so bots cannot learn that they were detected.
    if (parsed.data.company) return resultRedirect(request, "success")

    const email = parsed.data.email
    const identifier = getRequestIdentifier(request.headers)

    const [clientLimit, emailLimit] = await Promise.all([
      consumeRateLimit({ action: "unsubscribe-client", identifier, limit: 10, windowMs: 60 * 60 * 1000 }),
      consumeRateLimit({ action: "unsubscribe-email", identifier: email, limit: 3, windowMs: 60 * 60 * 1000 }),
    ])
    if (!clientLimit.allowed || !emailLimit.allowed) {
      const retryAfter = Math.max(clientLimit.retryAfterSeconds, emailLimit.retryAfterSeconds)
      return new NextResponse("Too many attempts. Please try again later.", {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      })
    }

    await getDb().update(subscribers).set({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(subscribers.email, email))

    // Always return the same result so this endpoint cannot be used to discover
    // whether a particular address is subscribed.
    return resultRedirect(request, "success")
  } catch (error) {
    console.error("Unsubscribe failed", error)
    return new NextResponse("Unsubscribe is temporarily unavailable. Please try again later.", { status: 503 })
  }
}
