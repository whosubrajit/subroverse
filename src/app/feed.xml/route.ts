import { NextResponse } from "next/server"
import { readPublicStories } from "@/lib/stories"
import { getSiteUrl } from "@/lib/site-url"
import { publicationDate } from "@/lib/story-publication"

export const dynamic = "force-dynamic"

function escapeXml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const stories = await readPublicStories()
  const siteUrl = getSiteUrl().origin

  const items = stories.map((story) => {
    const url = `${siteUrl}/stories/${story.slug}`
    const pubDate = publicationDate(story)?.toUTCString() ?? story.createdAt.toUTCString()
    
    return `
    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(story.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      ${story.series ? `<category>${escapeXml(story.series)}</category>` : ""}
    </item>`
  }).join("")

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SubroVerse</title>
    <link>${siteUrl}</link>
    <description>Subrajit's Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.</description>
    <language>en</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
