import type { Metadata } from "next"
import PublicSite from "@/components/PublicSite"
import { readPublicPageData } from "@/lib/public-page-data"
import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "About Subrajit",
  description: "Meet Subrajit—Dibyo Singho Barua Subrajit—the writer behind SubroVerse and this quiet garden of Bengali and English letters.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Subrajit",
    description: "Meet Subrajit, also known as Dibyo Singho Barua Subrajit, the writer behind SubroVerse.",
    url: "/about",
  },
}

export default async function AboutPage() {
  const { settings, stories, seriesMetadata } = await readPublicPageData()
  const origin = getSiteUrl().origin
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${origin}/about`,
    mainEntity: {
      "@type": "Person",
      "@id": `${origin}/about#author`,
      name: "Dibyo Singho Barua Subrajit",
      alternateName: [settings.profileName, "Subrajit", "Subro"],
      jobTitle: settings.profileTitle,
      description: settings.aboutBioText.split("\n\n")[0],
      url: `${origin}/about`,
      sameAs: [settings.profileContactUrl],
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd).replace(/</g, "\\u003c") }} />
      <PublicSite settings={settings} initialStories={stories} initialPage="about" seriesMetadata={seriesMetadata} />
    </>
  )
}
