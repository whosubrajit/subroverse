import { desc } from "drizzle-orm"
import Link from "next/link"
import AdminAccessGate from "@/components/admin/AdminAccessGate"
import { getDb } from "@/db"
import { stories } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "Stories", robots: { index: false, follow: false } }

export default async function StoriesStudioPage() {
  if (!(await getAdminUser())) return <AdminAccessGate />
  const rows = process.env.DATABASE_URL ? await getDb().select().from(stories).orderBy(desc(stories.updatedAt)) : []

  return (
    <main className="min-h-screen px-5 py-8 text-[#f0ebf5] md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-white/[.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><Link href="/admin" className="text-xs text-[#827491] hover:text-[#b896d1]">← Writer’s room</Link><p className="font-cursive mt-5 text-lg text-[#b896d1]">the archive</p><h1 className="font-display text-5xl font-light italic">Stories</h1></div>
          <Link href="/admin/stories/new" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#b896d1] px-6 text-sm text-[#120e1f]">＋ New story</Link>
        </header>
        <div className="mt-8 flex flex-wrap gap-2">{["All", "Drafts", "Published", "Scheduled", "Archived"].map((filter, index) => <button key={filter} className={`min-h-9 rounded-full px-4 text-xs ${index === 0 ? "bg-[#b896d1]/15 text-[#d6bdf0]" : "border border-white/[.06] text-[#74667f]"}`}>{filter}</button>)}</div>
        <section className="mt-6 overflow-hidden rounded-2xl border border-white/[.06] bg-[#151120]">
          {rows.length ? rows.map((story) => (
            <article key={story.id} className="grid gap-4 border-b border-white/[.05] px-5 py-5 last:border-0 md:grid-cols-[1fr_130px_120px_90px] md:items-center">
              <div><h2 className="font-display text-xl font-light italic">{story.title}</h2><p className="mt-1 text-xs text-[#6f627e]">/{story.slug} · {story.wordCount} words</p></div>
              <span className="text-xs text-[#8f819f]">{story.format}</span>
              <span className={`w-fit rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${story.status === "published" ? "bg-emerald-400/10 text-emerald-300" : story.status === "scheduled" ? "bg-blue-400/10 text-blue-300" : "bg-white/5 text-[#8f819f]"}`}>{story.status}</span>
              <Link href={`/admin/stories/${story.id}`} className="text-xs text-[#b896d1] hover:text-[#d6bdf0]">Edit →</Link>
            </article>
          )) : <div className="grid min-h-72 place-items-center px-6 text-center"><div><p className="font-display text-2xl font-light italic text-[#a99bb9]">No database stories yet.</p><p className="mt-2 text-sm text-[#62566f]">Your first published piece will begin the archive.</p></div></div>}
        </section>
      </div>
    </main>
  )
}
