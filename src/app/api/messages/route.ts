import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/db"
import { contactMessages, subscribers } from "@/db/schema"
import { getMessageDevice } from "@/lib/message-device"
import { consumeRateLimit, getRequestIdentifier, getIpAddress } from "@/lib/rate-limit"

const messageSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.union([z.literal(""), z.email().max(320)]).optional().default(""),
  message: z.string().trim().min(1).max(12000),
  company: z.string().max(200).optional().default(""),
  subscribe: z.boolean().optional().default(false),
})

export async function POST(request: Request) {
  try {
    const parsed = messageSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: "Please check the message and try again." }, { status: 400 })
    if (parsed.data.company) return NextResponse.json({ ok: true })

    const rateLimit = await consumeRateLimit({
      action: "contact-message",
      identifier: getRequestIdentifier(request.headers),
      limit: 5,
      windowMs: 60 * 60 * 1000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many messages were sent. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      )
    }

    const db = getDb()
    const [created] = await db.insert(contactMessages).values({
      name: parsed.data.name || null,
      email: parsed.data.email || null,
      message: parsed.data.message,
      ipAddress: getIpAddress(request.headers),
      ...getMessageDevice(request.headers),
    }).returning({ id: contactMessages.id })

    if (parsed.data.subscribe && parsed.data.email) {
      const email = parsed.data.email.trim().toLowerCase()
      await db
        .insert(subscribers)
        .values({
          email,
          source: "contact-form",
          status: "active",
          confirmedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: subscribers.email,
          set: {
            source: "contact-form",
            status: "active",
            consentAt: new Date(),
            confirmedAt: new Date(),
            unsubscribedAt: null,
            updatedAt: new Date(),
          },
        })
    }

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (error) {
    console.error("Contact message failed", error)
    return NextResponse.json({ error: "This corner is still being connected. Please try again shortly." }, { status: 503 })
  }
}
