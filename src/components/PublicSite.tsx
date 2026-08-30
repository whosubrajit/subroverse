"use client"

import dynamic from "next/dynamic"
import type { PublicSiteSettings } from "@/lib/site-settings-schema"

const App = dynamic(() => import("@/App"), { ssr: false })

export default function PublicSite({ settings }: { settings: PublicSiteSettings }) {
  return <App settings={settings} />
}
