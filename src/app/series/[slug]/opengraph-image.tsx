import { ImageResponse } from "next/og"
import { findPublicSeries } from "@/lib/stories"
import { getAllSeriesMetadata } from "@/lib/series-metadata"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const alt = "SubroVerse Series"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug)
  const seriesName = await findPublicSeries(slug)

  let title = seriesName || "Series not found"
  const subtitle = "Collection"
  let description: string | null = null

  if (seriesName && process.env.DATABASE_URL) {
    const allMeta = await getAllSeriesMetadata()
    description = allMeta.find(m => m.name === seriesName)?.description || null
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

        <p
          style={{
            fontSize: 16,
            color: "#b896d1",
            fontStyle: "italic",
            marginBottom: 16,
            letterSpacing: "0.05em",
          }}
        >
          {subtitle}
        </p>

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

        {description && (
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
            {description.slice(0, 160)}{description.length > 160 ? "..." : ""}
          </p>
        )}

        <div
          style={{
            width: 50,
            height: 1,
            background: "rgba(184,150,209,0.35)",
            marginTop: 36,
          }}
        />

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
