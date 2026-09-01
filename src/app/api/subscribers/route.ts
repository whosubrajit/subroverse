import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/db"
import { subscribers } from "@/db/schema"
import { newsletterEmailError, newsletterEmailSchema } from "@/lib/newsletter-email"
import { consumeRateLimit, getRequestIdentifier } from "@/lib/rate-limit"

export const runtime = "nodejs"

const signupSchema = z.object({
  email: newsletterEmailSchema,
  source: z.string().trim().max(80).default("first-entry-modal"),
  company: z.string().max(200).optional().default(""),
})

export async function POST(request: Request) {
  try {
    const parsed = signupSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: newsletterEmailError }, { status: 400 })
    }

    // Bots commonly fill this off-screen field. Return a normal-looking success
    // without storing anything or revealing that the trap was triggered.
    if (parsed.data.company) return NextResponse.json({ ok: true })

    const db = getDb()
    const email = parsed.data.email.trim().toLowerCase()
    const clientIdentifier = getRequestIdentifier(request.headers)
    const [clientLimit, emailLimit] = await Promise.all([
      consumeRateLimit({ action: "newsletter-client", identifier: clientIdentifier, limit: 6, windowMs: 60 * 60 * 1000 }),
      consumeRateLimit({ action: "newsletter-email", identifier: email, limit: 3, windowMs: 60 * 60 * 1000 }),
    ])
    if (!clientLimit.allowed || !emailLimit.allowed) {
      const retryAfter = Math.max(clientLimit.retryAfterSeconds, emailLimit.retryAfterSeconds)
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      )
    }

    const existing = await db
      .select({ status: subscribers.status })
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1)

    if (existing[0]?.status === "active") {
      return NextResponse.json({ ok: true, alreadySubscribed: true })
    }

    await db
      .insert(subscribers)
      .values({
        email,
        source: parsed.data.source,
        status: "active",
        confirmedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: subscribers.email,
        set: {
          source: parsed.data.source,
          status: "active",
          consentAt: new Date(),
          confirmedAt: new Date(),
          unsubscribedAt: null,
          updatedAt: new Date(),
        },
      })

    return NextResponse.json({ ok: true, alreadySubscribed: false }, { status: 201 })
  } catch (error) {
    console.error("Subscriber signup failed", error)
    return NextResponse.json(
      { error: "The list is still being prepared. Please try again shortly." },
      { status: 503 },
    )
  }
}
