import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin"
import { updateSeriesMetadata } from "@/lib/series-metadata"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
})

export async function POST(req: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const { name, description } = updateSchema.parse(json)
    
    await updateSeriesMetadata(name, description)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
