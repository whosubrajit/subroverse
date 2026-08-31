import { count, eq } from "drizzle-orm"
import AdminAccessGate from "@/components/admin/AdminAccessGate"
import SectionShell from "@/components/admin/SectionShell"
import { getDb } from "@/db"
import { campaigns, contactMessages, stories, subscribers } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"
import TrafficSummary from "@/components/admin/TrafficSummary"
import { getAdminTrafficReport } from "@/lib/cloudflare-analytics"

export const dynamic = "force-dynamic"
export const metadata = { title: "Analytics", robots: { index: false, follow: false } }

export default async function AnalyticsPage() {
  if (!(await getAdminUser())) return <AdminAccessGate />
  let metrics = { published: 0, subscribers: 0, campaigns: 0, messages: 0 }
  if (process.env.DATABASE_URL) {
    const db = getDb()
    const [published, audience, sent, messages] = await Promise.all([
      db.select({ value: count() }).from(stories).where(eq(stories.status, "published")),
      db.select({ value: count() }).from(subscribers).where(eq(subscribers.status, "active")),
      db.select({ value: count() }).from(campaigns).where(eq(campaigns.status, "sent")),
      db.select({ value: count() }).from(contactMessages),
    ])
    metrics = { published: published[0]?.value ?? 0, subscribers: audience[0]?.value ?? 0, campaigns: sent[0]?.value ?? 0, messages: messages[0]?.value ?? 0 }
  }
  const traffic = await getAdminTrafficReport()
  return <SectionShell eyebrow="signals without surveillance" title="Analytics" description="Real visitor counts from Vercel, alongside publishing and reader growth.">
    <div className="mb-8"><TrafficSummary report={traffic} detailed /></div>
    <h2 className="font-display mb-5 text-2xl italic">Publishing & correspondence</h2>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(metrics).map(([label, value]) => <article key={label} className="rounded-2xl border border-white/[.06] bg-[#151120] p-5"><p className="text-xs uppercase tracking-widest text-[#6f627e]">{label}</p><p className="font-display mt-4 text-4xl font-light">{value}</p></article>)}</section>
  </SectionShell>
}
