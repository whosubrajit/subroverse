import Link from "next/link"
import type { TrafficReport } from "@/lib/analytics-report"

export default function TrafficSummary({ report, detailed = false }: { report: TrafficReport; detailed?: boolean }) {
  return (
    <section aria-label="Website traffic" className="rounded-2xl border border-white/10 bg-[#151120] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs uppercase tracking-widest text-[#a99bb9]">Cloudflare Zone Analytics</p><h2 className="font-display mt-2 text-2xl italic">Traffic · last 30 days</h2></div>
        {!detailed && <Link href="/admin/analytics" className="text-sm text-[#b896d1]">Analytics →</Link>}
        {detailed && <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#b896d1]">Open Cloudflare ↗</a>}
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-6">
        <div><dt className="text-sm text-[#a99bb9]">Daily unique IPs, summed</dt><dd className="font-display mt-2 text-4xl">{report.status === "ready" ? report.dailyUniqueIPs.toLocaleString("en-US") : "—"}</dd></div>
        <div><dt className="text-sm text-[#a99bb9]">Page views</dt><dd className="font-display mt-2 text-4xl">{report.status === "ready" ? report.pageviews.toLocaleString("en-US") : "—"}</dd></div>
      </dl>
      <p className="mt-5 text-xs leading-6 text-[#a99bb9]">Last 30 UTC calendar days, including today. A returning IP can count once each day; this is not a count of unique people. Proxied domain traffic can include bots, admin pages and subdomains. Reports may be cached for up to 5 minutes.</p>
      {report.status !== "ready" && <p role={report.status === "error" ? "alert" : "status"} className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">{report.message}</p>}
      {report.status === "ready" && report.pageviews === 0 && <p className="mt-3 text-sm text-[#b896d1]">No page views in this period. Check that your domain is proxied through Cloudflare and allow time for traffic to appear.</p>}
      {detailed && <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm leading-6 text-[#a99bb9]">
        <p>This report uses Cloudflare's network-level Zone Analytics, not the browser-based Web Analytics beacon. DNS-only traffic is not measured here.</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Ensure your domain is proxied (Orange Cloud) through Cloudflare.</li>
          <li>Add <code>CLOUDFLARE_ZONE_ID</code> and <code>CLOUDFLARE_API_TOKEN</code> (with Zone.Analytics Read permissions) to your environment variables.</li>
          <li>Redeploy after changing environment variables.</li>
        </ol>
      </div>}
    </section>
  )
}
