import { desc } from "drizzle-orm"
import AdminAccessGate from "@/components/admin/AdminAccessGate"
import SectionShell from "@/components/admin/SectionShell"
import { getDb } from "@/db"
import { campaigns } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "Newsletter", robots: { index: false, follow: false } }

export default async function NewsletterStudioPage() {
  if (!(await getAdminUser())) return <AdminAccessGate />
  const rows = process.env.DATABASE_URL ? await getDb().select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(100) : []
  return <SectionShell eyebrow="letters leaving the garden" title="Newsletter" description="Keep drafts and campaign notes here, then export your active audience and send the final letter manually from Gmail." action={<a href="/api/admin/audience/export" className="inline-flex min-h-11 items-center rounded-full bg-[#b896d1] px-6 text-sm text-[#120e1f] transition-colors hover:bg-[#d6bdf0]">↓ Export audience</a>}>
    <section className="grid gap-4 md:grid-cols-3">{[["Draft campaigns", rows.filter((item) => item.status === "draft").length], ["Scheduled", rows.filter((item) => item.status === "scheduled").length], ["Sent", rows.filter((item) => item.status === "sent").length]].map(([label, value]) => <article key={label} className="rounded-2xl border border-white/[.06] bg-[#151120] p-5"><p className="text-xs uppercase tracking-widest text-[#6f627e]">{label}</p><p className="font-display mt-4 text-4xl font-light">{value}</p></article>)}</section>
    <section className="mt-6 rounded-2xl border border-white/[.06] bg-[#151120] p-6"><h2 className="font-display text-2xl font-light italic">Campaign history</h2>{rows.length ? <div className="mt-5">{rows.map((campaign) => <article key={campaign.id} className="grid gap-2 border-t border-white/[.05] py-4 sm:grid-cols-[1fr_120px_160px]"><span className="text-sm">{campaign.subject}</span><span className="text-xs text-[#8f819f]">{campaign.status}</span><span className="text-xs text-[#62566f]">{campaign.createdAt.toLocaleDateString()}</span></article>)}</div> : <p className="py-16 text-center text-sm text-[#6f627e]">Your first story announcement will appear here.</p>}</section>
  </SectionShell>
}
