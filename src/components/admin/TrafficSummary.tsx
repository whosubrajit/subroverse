import Link from "next/link"
import type { TrafficReport } from "@/lib/analytics-report"

export default function TrafficSummary({ report, detailed = false }: { report: TrafficReport; detailed?: boolean }) {
  return (
    <section aria-label="Website traffic" className="rounded-2xl border border-white/10 bg-[#151120] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs uppercase tracking-widest text-[#a99bb9]">Vercel Web Analytics</p><h2 className="font-display mt-2 text-2xl italic">Visitors & page views</h2></div>
        {!detailed && <Link href="/admin/analytics" className="text-sm text-[#b896d1]">Analytics →</Link>}
        {detailed && <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-sm text-[#b896d1]">Open Vercel ↗</a>}
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-6">
        <div><dt className="text-sm text-[#a99bb9]">Visitors</dt><dd className="font-display mt-2 text-4xl">{report.status === "ready" ? report.visitors.toLocaleString("en-US") : "—"}</dd></div>
        <div><dt className="text-sm text-[#a99bb9]">Page views</dt><dd className="font-display mt-2 text-4xl">{report.status === "ready" ? report.pageviews.toLocaleString("en-US") : "—"}</dd></div>
      </dl>
      <p className="mt-5 text-xs leading-6 text-[#a99bb9]">Production traffic since Web Analytics was enabled. Counts are cached for up to 5 minutes. Local development and admin pages are excluded by this integration.</p>
      {report.status !== "ready" && <p role={report.status === "error" ? "alert" : "status"} className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">{report.message}</p>}
      {report.status === "ready" && report.pageviews === 0 && <p className="mt-3 text-sm text-[#b896d1]">No recorded traffic yet. Deploy with Web Analytics enabled and allow time for visits to appear.</p>}
      {detailed && <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm leading-6 text-[#a99bb9]">
        <p>Visitors use Vercel’s privacy-friendly, daily-reset identifiers—not a count of distinct people across all time. Repeat page loads increase page views.</p>
        <p>About, Stories and Write to me are tracked as separate pages even though the site uses hash navigation. No form text, email addresses or query parameters are sent by this integration. Do Not Track is respected.</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Enable Web Analytics for this project in Vercel and deploy this code.</li>
          <li>Add a server-only <code>VERCEL_TOKEN</code> with access to the project and <code>VERCEL_PROJECT_ID</code>. Team projects also need <code>VERCEL_TEAM_ID</code>.</li>
          <li>Redeploy after changing environment variables, or restart the local server. Never prefix the token with <code>NEXT_PUBLIC_</code>.</li>
        </ol>
        <a href="https://vercel.com/docs/analytics/web-analytics-api" target="_blank" rel="noopener noreferrer" className="inline-block text-[#b896d1]">Vercel setup and API documentation ↗</a>
      </div>}
    </section>
  )
}
