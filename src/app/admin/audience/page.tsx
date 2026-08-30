import { desc } from "drizzle-orm"
import AdminAccessGate from "@/components/admin/AdminAccessGate"
import SectionShell from "@/components/admin/SectionShell"
import { getDb } from "@/db"
import { subscribers } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "Audience", robots: { index: false, follow: false } }

export default async function AudiencePage() {
  if (!(await getAdminUser())) return <AdminAccessGate />
  const rows = process.env.DATABASE_URL ? await getDb().select().from(subscribers).orderBy(desc(subscribers.createdAt)).limit(200) : []
  const active = rows.filter((item) => item.status === "active").length
  const unsubscribed = rows.filter((item) => item.status === "unsubscribed").length
  return <SectionShell eyebrow="the readers" title="Audience" description="Every signup is stored here. Export active addresses whenever you are ready to send from Gmail." action={<a href="/api/admin/audience/export" className="inline-flex min-h-11 items-center rounded-full bg-[#b896d1] px-6 text-sm text-[#120e1f] transition-colors hover:bg-[#d6bdf0]">↓ Export active CSV</a>}>
    <section className="grid gap-4 sm:grid-cols-3">{[["Active", active], ["Unsubscribed", unsubscribed], ["Total records", rows.length]].map(([label, value]) => <article key={label} className="rounded-2xl border border-white/[.06] bg-[#151120] p-5"><p className="text-xs uppercase tracking-widest text-[#6f627e]">{label}</p><p className="font-display mt-4 text-4xl font-light">{value}</p></article>)}</section>
    <section className="mt-6 overflow-hidden rounded-2xl border border-white/[.06] bg-[#151120]">{rows.length ? rows.map((subscriber) => <article key={subscriber.id} className="grid gap-2 border-b border-white/[.05] px-5 py-4 last:border-0 sm:grid-cols-[1fr_130px_170px]"><span className="text-sm text-[#cfc4dc]">{subscriber.email}</span><span className={subscriber.status === "active" ? "text-xs text-emerald-300" : "text-xs text-amber-200"}>{subscriber.status}</span><span className="text-xs text-[#6f627e]">{subscriber.createdAt.toLocaleDateString()}</span></article>) : <p className="p-10 text-center text-sm text-[#6f627e]">Subscribers will appear after the first signup.</p>}</section>
  </SectionShell>
}
