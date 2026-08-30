import { desc } from "drizzle-orm"
import Link from "next/link"
import AdminAccessGate from "@/components/admin/AdminAccessGate"
import SectionShell from "@/components/admin/SectionShell"
import { getAdminUser } from "@/lib/admin"
import { getDb } from "@/db"
import { contactMessages } from "@/db/schema"

export const dynamic = "force-dynamic"
export const metadata = { title: "Messages", robots: { index: false, follow: false } }

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!(await getAdminUser())) return <AdminAccessGate />
  const params = await searchParams
  const requestedPage = Number(params.page ?? 1)
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 10000) : 1
  const pageSize = 25
  const rows = await getDb().select().from(contactMessages)
    .orderBy(desc(contactMessages.createdAt), desc(contactMessages.id)).limit(pageSize + 1).offset((page - 1) * pageSize)
  return (
    <SectionShell eyebrow="letters left at your door" title="Messages" description="Private messages from Write to me, with basic browser-reported device and OS notes.">
      <p className="mb-6 text-xs leading-6 text-[#a99bb9]">Device details are estimates, not verified identity or exact hardware. Desktop mode and privacy tools can change them. Older messages have no device information.</p>
      <section className="space-y-4" aria-label="Received messages">
        {rows.slice(0, pageSize).map(message => (
          <article key={message.id} className="rounded-2xl border border-white/10 bg-[#151120] p-6">
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl italic">{message.name || "Anonymous writer"}</h2>
                {message.email && <p className="mt-1 break-all text-sm text-[#b896d1]">{message.email}</p>}
              </div>
              <time dateTime={message.createdAt.toISOString()} className="text-xs text-[#a99bb9]">{message.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })} · Dhaka</time>
            </header>
            <p className="my-6 whitespace-pre-wrap break-words text-sm leading-7 text-[#ded4e8]">{message.message}</p>
            <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-4 text-xs">
              <div><dt className="text-[#a99bb9]">Device</dt><dd className="mt-1">{message.deviceType || "Not recorded"}</dd></div>
              <div><dt className="text-[#a99bb9]">Operating system</dt><dd className="mt-1">{message.operatingSystem || "Not recorded"}</dd></div>
            </dl>
          </article>
        ))}
        {rows.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-8 text-[#a99bb9]">No messages on this page.</p>}
      </section>
      <nav aria-label="Message pages" className="mt-6 flex items-center justify-between text-sm text-[#b896d1]">
        {page > 1 ? <Link className="py-3" href={`/admin/messages?page=${page - 1}`}>← Newer</Link> : <span />}
        <span>Page {page}</span>
        {rows.length > pageSize ? <Link className="py-3" href={`/admin/messages?page=${page + 1}`}>Older →</Link> : <span />}
      </nav>
    </SectionShell>
  )
}
