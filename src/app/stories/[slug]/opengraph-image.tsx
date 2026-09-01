import { ImageResponse } from "next/og"
import { findPublicStory } from "@/lib/stories"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const alt = "SubroVerse story"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug

  let title = "Story not found"
  let format = "Prose"
  let series: string | null = null
  let excerpt: string | null = null

  if (process.env.DATABASE_URL) {
    const story = await findPublicStory(slug)
    if (story) {
      title = story.title
      format = story.format
      series = story.series
      excerpt = story.excerpt
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px 72px",
          background: "linear-gradient(145deg, #120e1f 0%, #1e1635 40%, #2a1c42 70%, #120e1f 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(184,150,209,0.1) 0%, transparent 70%)",
            top: "20%",
            right: "10%",
          }}
        />

        {/* Format + series badge */}
        <p
          style={{
            fontSize: 16,
            color: "#b896d1",
            fontStyle: "italic",
            marginBottom: 16,
            letterSpacing: "0.05em",
          }}
        >
          {format}{series ? ` · ${series}` : ""}
        </p>

        {/* Story title */}
        <h1
          style={{
            fontSize: title.length > 40 ? 52 : 72,
            fontStyle: "italic",
            fontWeight: 300,
            color: "#f0ebf5",
            lineHeight: 1.1,
            margin: 0,
            maxWidth: 900,
          }}
        >
          {title}
        </h1>

        {excerpt && (
          <p
            style={{
              fontSize: 24,
              color: "#c49ce6",
              fontStyle: "italic",
              lineHeight: 1.4,
              marginTop: 20,
              marginBottom: 0,
              maxWidth: 800,
              whiteSpace: "pre-wrap",
            }}
          >
            {excerpt.slice(0, 160)}{excerpt.length > 160 ? "..." : ""}
          </p>
        )}

        {/* Decorative line */}
        <div
          style={{
            width: 50,
            height: 1,
            background: "rgba(184,150,209,0.35)",
            marginTop: 36,
          }}
        />

        {/* Site name */}
        <p
          style={{
            fontSize: 18,
            color: "#8474a0",
            marginTop: 20,
            fontStyle: "italic",
          }}
        >
          subroverse
        </p>
      </div>
    ),
    { ...size },
  )
}
