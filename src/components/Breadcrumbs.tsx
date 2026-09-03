import Link from "next/link"
import { getSiteUrl } from "@/lib/site-url"

export type BreadcrumbItem = {
  name: string
  href?: string
}

export default function Breadcrumbs({
  items,
  className = "",
  includeSchema = true,
}: {
  items: BreadcrumbItem[]
  className?: string
  includeSchema?: boolean
}) {
  const origin = getSiteUrl().origin
  const fullItems: BreadcrumbItem[] = [
    { name: "SubroVerse", href: "/" },
    ...items,
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fullItems.map((item, index) => {
      const isLast = index === fullItems.length - 1
      const itemUrl = item.href
        ? item.href.startsWith("http")
          ? item.href
          : `${origin}${item.href}`
        : undefined
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        ...(itemUrl && (!isLast || itemUrl !== `${origin}/`)
          ? { item: itemUrl }
          : {}),
      }
    }),
  }

  return (
    <>
      {includeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <nav aria-label="Breadcrumb" className={`font-body text-xs ${className}`}>
        <ol className="flex flex-wrap items-center gap-1.5 text-[#8474a0]">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1
            return (
              <li
                key={`${item.name}-${index}`}
                className="inline-flex items-center gap-1.5"
              >
                {index > 0 && (
                  <span className="text-[#8474a0]/40" aria-hidden="true">
                    ›
                  </span>
                )}
                {isLast || !item.href ? (
                  <span
                    className="text-[#dcd3e6] font-normal truncate max-w-[200px] sm:max-w-md"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-[#b896d1] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#b896d1] rounded"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
