import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import SiteBackground from "@/components/SiteBackground"
import "@/index.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://subroverse.vercel.app"),
  title: {
    default: "SubroVerse",
    template: "%s · SubroVerse",
  },
  description:
    "Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
  applicationName: "SubroVerse",
  authors: [{ name: "Subro" }],
  creator: "Subro",
  openGraph: {
    type: "website",
    siteName: "SubroVerse",
    title: "SubroVerse",
    description: "A garden of quiet devotion, written in the small hours.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
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
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://subroverse.vercel.app",
      description: "A love letter that never learned to stop.",
      inLanguage: "en",
      author: { "@id": "#author" },
    },
    {
      "@type": "Person",
      "@id": "#author",
      name: "Subro",
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://subroverse.vercel.app",
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
