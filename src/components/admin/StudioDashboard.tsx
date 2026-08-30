import Link from "next/link"
import TrafficSummary from "./TrafficSummary"
import type { TrafficReport } from "@/lib/analytics-report"

type StudioDashboardProps = {
  adminName: string
  counts: {
    stories: number
    drafts: number
    scheduled: number
    subscribers: number
    messages: number
  }
  connected: boolean
  traffic: TrafficReport
}

export default function StudioDashboard({ adminName, counts, connected, traffic }: StudioDashboardProps) {
  const stats = [
    ["Published stories", counts.stories, "All time"],
    ["Drafts", counts.drafts, "Waiting for you"],
    ["Scheduled", counts.scheduled, "In the queue"],
    ["Subscribers", counts.subscribers, "Confirmed readers"],
  ] as const

  return (
    <div className="min-h-screen text-[#f0ebf5]">
      <main className="px-5 py-8 md:px-10 md:py-10 xl:px-14">
        <header className="flex flex-col gap-5 border-b border-white/5 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-cursive mb-2 text-lg text-[#b896d1]">the writer’s room</p>
            <h1 className="font-display text-4xl font-light italic md:text-5xl">Good evening, {adminName}.</h1>
            <p className="mt-3 text-sm text-[#776a86]">Everything happening across SubroVerse, in one quiet place.</p>
          </div>
          <Link href="/admin/stories/new" className="inline-flex min-h-11 items-center rounded-full bg-[#b896d1] px-6 text-sm text-[#120e1f] hover:bg-[#d6bdf0]">＋ New story</Link>
        </header>

        {!connected && (
          <section className="mt-8 rounded-2xl border border-amber-300/15 bg-amber-300/[.045] p-5 text-sm leading-6 text-amber-100/80">
            The studio shell is ready. Add the values from <code className="text-amber-100">.env.example</code> to <code className="text-amber-100">.env.local</code>, then run <code className="text-amber-100">pnpm db:migrate</code> to connect live data.
          </section>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Publishing overview">
          {stats.map(([label, value, note]) => (
            <article key={label} className="rounded-2xl border border-white/[.06] bg-[#151120] p-5">
              <p className="text-xs uppercase tracking-[.16em] text-[#6f627e]">{label}</p>
              <p className="font-display mt-5 text-4xl font-light text-[#eee6f5]">{value}</p>
              <p className="mt-2 text-xs text-[#6f627e]">{note}</p>
            </article>
          ))}
        </section>

        <div className="mt-8"><TrafficSummary report={traffic} /></div>
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_.85fr]">
          <article className="rounded-2xl border border-white/[.06] bg-[#151120] p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-xs uppercase tracking-[.16em] text-[#6f627e]">Editorial pipeline</p><h2 className="font-display mt-2 text-2xl font-light italic">Stories in motion</h2></div>
              <button className="text-xs text-[#aa8fc1] hover:text-[#d6bdf0]">View all →</button>
            </div>
            <div className="mt-8 grid min-h-52 place-items-center rounded-xl border border-dashed border-white/[.08] bg-black/10 text-center">
              <div><p className="font-display text-xl italic text-[#a99bb9]">Your next piece begins here.</p><p className="mt-2 text-xs text-[#62566f]">Drafts, scheduled work and revision history will appear here.</p></div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/[.06] bg-[#151120] p-6">
            <p className="text-xs uppercase tracking-[.16em] text-[#6f627e]">Inbox</p>
            <div className="mt-5 flex items-end justify-between"><p className="font-display text-5xl font-light">{counts.messages}</p><span className="mb-1 text-xs text-[#776a86]">unread messages</span></div>
            <Link href="/admin/messages" className="mt-4 inline-flex min-h-11 items-center text-sm text-[#b896d1]">Read messages →</Link>
            <div className="my-6 h-px bg-white/[.06]" />
            <p className="text-xs uppercase tracking-[.16em] text-[#6f627e]">Quick actions</p>
            <div className="mt-4 grid gap-2">
              {["Upload photographs", "Compose an email", "Preview the homepage", "Export subscribers"].map((action) => (
                <button key={action} className="min-h-11 rounded-xl border border-white/[.06] px-4 text-left text-sm text-[#9587a4] hover:border-[#b896d1]/30 hover:text-[#d6bdf0]">{action}</button>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
