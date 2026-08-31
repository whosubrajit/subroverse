import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import SiteBackground from "@/components/SiteBackground"
import "@/index.css"

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_SITE_URL || "https://subroverse.com"
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url
  }
  try {
    return new URL(url)
  } catch (e) {
    return new URL("https://subroverse.com")
  }
}

export const metadata: Metadata = {
  metadataBase: getBaseUrl(),
  title: {
    default: "SubroVerse — Subrajit's Letters",
    template: "%s · SubroVerse",
  },
  description:
    "Subrajit's Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
  applicationName: "SubroVerse",
  authors: [{ name: "Subrajit" }],
  creator: "Subrajit",
  openGraph: {
    type: "website",
    siteName: "SubroVerse",
    title: "SubroVerse",
    description: "A garden of quiet devotion, written in the small hours.",
  },
  twitter: { card: "summary_large_image" },
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
      url: getBaseUrl().origin,
      description: "Subrajit's Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
      inLanguage: "en",
      author: { "@id": "#author" },
    },
    {
      "@type": "Person",
      "@id": "#author",
      name: "Subrajit",
      url: getBaseUrl().origin,
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
