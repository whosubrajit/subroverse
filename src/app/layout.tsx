import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import SiteBackground from "@/components/SiteBackground"
import { getSiteUrl } from "@/lib/site-url"
import "@/index.css"

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "SubroVerse — Subrajit's Letters",
    template: "%s — SubroVerse",
  },
  description:
    "Subrajit's Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
  applicationName: "SubroVerse",
  authors: [{ name: "Dibyo Singho Barua Subrajit", url: "/about" }],
  creator: "Dibyo Singho Barua Subrajit",
  openGraph: {
    type: "website",
    siteName: "SubroVerse",
    title: "SubroVerse — Subrajit's Letters",
    description: "Subrajit's Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
  },
  twitter: { 
    card: "summary_large_image",
    title: "SubroVerse — Subrajit's Letters",
    description: "Subrajit's Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
  },
  robots: { index: true, follow: true },
  keywords: ["Subrajit", "Storytelling", "Short Stories", "Letters", "Creative Writing", "SubroVerse", "Subro", "Subrajit's Letters", "Dibyo Singho Barua", "SubroVerse by Subrajit", "Dibyo Singho Barua Subrajit"],
  verification: {
    other: {
      "msvalidate.01": "6EEBDA0D3D95E60338D7EABB5A5F3D91",
    },
  },
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#120e1f",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "SubroVerse",
      alternateName: ["Subro Verse", "SubroVerse by Subrajit", "Dibyo Singho Barua Subrajit", "Subro's Shree"],
      url: getSiteUrl().origin,
      description: "Subrajit's Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
      inLanguage: ["bn", "en"],
      author: { "@id": `${getSiteUrl().origin}/about#author` },
    },
    {
      "@type": "Person",
      "@id": `${getSiteUrl().origin}/about#author`,
      name: "Dibyo Singho Barua Subrajit",
      alternateName: ["Subrajit", "Subro"],
      url: `${getSiteUrl().origin}/about`,
    },
  ],
}


export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="site-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteBackground />
        <div className="site-content">{children}</div>
      </body>
    </html>
  )
}
