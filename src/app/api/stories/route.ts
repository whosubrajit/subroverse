import { NextResponse } from "next/server"
import { readPublicStoryFeed } from "@/lib/stories"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ stories: [], configured: false })
  }

  const stories = await readPublicStoryFeed({ featuredFirst: true })

  return NextResponse.json({
    configured: true,
    stories,
  }, { headers: { "Cache-Control": "no-store" } })
}
