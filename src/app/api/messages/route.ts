import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/db"
import { contactMessages } from "@/db/schema"
import { getMessageDevice } from "@/lib/message-device"

const messageSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.union([z.literal(""), z.email().max(320)]).optional().default(""),
  message: z.string().trim().min(1).max(12000),
  company: z.string().max(0).optional(),
})

export async function POST(request: Request) {
  try {
    const parsed = messageSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: "Please check the message and try again." }, { status: 400 })
    if (parsed.data.company) return NextResponse.json({ ok: true })

    const [created] = await getDb().insert(contactMessages).values({
      name: parsed.data.name || null,
      email: parsed.data.email || null,
      message: parsed.data.message,
      ...getMessageDevice(request.headers),
    }).returning({ id: contactMessages.id })

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (error) {
    console.error("Contact message failed", error)
    return NextResponse.json({ error: "This corner is still being connected. Please try again shortly." }, { status: 503 })
  }
}
