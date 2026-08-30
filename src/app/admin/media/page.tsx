import { desc } from "drizzle-orm"
import Link from "next/link"
import AdminAccessGate from "@/components/admin/AdminAccessGate"
import MediaUploader from "@/components/admin/MediaUploader"
import { getDb } from "@/db"
import { media } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "Media library", robots: { index: false, follow: false } }

export default async function MediaLibraryPage() {
  if (!(await getAdminUser())) return <AdminAccessGate />
  const rows = process.env.DATABASE_URL ? await getDb().select().from(media).orderBy(desc(media.createdAt)) : []
  return (
    <main className="min-h-screen px-5 py-8 text-[#f0ebf5] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-xs text-[#827491] hover:text-[#b896d1]">← Writer’s room</Link>
        <div className="my-7"><p className="font-cursive text-lg text-[#b896d1]">the visual archive</p><h1 className="font-display text-5xl font-light italic">Media library</h1><p className="mt-3 text-sm text-[#74667f]">Photographs, covers and details—with alt text and usage tracking.</p></div>
        <MediaUploader />
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-white/[.06] bg-[#151120]"><div className="aspect-[4/3] bg-black/20"><img src={item.url} alt={item.altText} className="h-full w-full object-cover" /></div><div className="p-4"><p className="truncate text-sm text-[#cfc4dc]">{item.filename}</p><p className="mt-1 text-[10px] text-[#62566f]">{item.width ?? "?"} × {item.height ?? "?"} · {Math.round(item.bytes / 1024)} KB</p><p className={`mt-3 text-xs ${item.altText ? "text-emerald-300/70" : "text-amber-200/70"}`}>{item.altText ? "Alt text ready" : "Alt text needed"}</p></div></article>)}
        </section>
      </div>
    </main>
  )
}
