import AdminAccessGate from "@/components/admin/AdminAccessGate"
import SectionShell from "@/components/admin/SectionShell"
import { getAdminUser } from "@/lib/admin"
import { getAllSeriesNames, getAllSeriesMetadata } from "@/lib/series-metadata"
import SeriesManager from "@/components/admin/SeriesManager"

export const dynamic = "force-dynamic"
export const metadata = { title: "Series Manager", robots: { index: false, follow: false } }

export default async function SeriesAdminPage() {
  if (!(await getAdminUser())) return <AdminAccessGate />
  
  const [names, metadata] = await Promise.all([
    getAllSeriesNames(),
    getAllSeriesMetadata()
  ])

  return (
    <SectionShell 
      eyebrow="collections and anthologies" 
      title="Series Manager" 
      description="Write poetic introductions for your story series. These will appear at the top of the series page."
    >
      <SeriesManager allSeriesNames={names} initialMetadata={metadata} />
    </SectionShell>
  )
}
