import AdminAccessGate from "@/components/admin/AdminAccessGate"
import SectionShell from "@/components/admin/SectionShell"
import { getAdminUser } from "@/lib/admin"
import Link from "next/link"
import SettingsForm from "@/components/admin/SettingsForm"
import { readSiteSettings } from "@/lib/site-settings"
import { isNeonAuthConfigured } from "@/lib/auth/server"

export const dynamic = "force-dynamic"
export const metadata = { title: "Settings", robots: { index: false, follow: false } }

export default async function SettingsPage() {
  if (!(await getAdminUser())) return <AdminAccessGate />
  const settings = await readSiteSettings().catch(() => null)
  const integrations = [
    ["Neon database", settings ? "Connected · settings readable" : "Unavailable · check connection and migrations"],
    ["Neon Auth", isNeonAuthConfigured() ? "Configured" : "Not configured"],
    ["Vercel Blob uploads", process.env.BLOB_READ_WRITE_TOKEN ? "Token configured" : "Upload token missing"],
    ["Newsletter delivery", "Manual through Gmail · no automated sending"],
    ["Vercel visitor counts", process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID ? "API credentials configured · view Analytics to check access" : "Server token and project ID needed · see Analytics"],
  ]
  return (
    <SectionShell eyebrow="how the garden behaves" title="Settings" description="Edit your homepage and reader invitation. Changes are saved to Neon." action={<Link href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-[#b896d1]">Preview site ↗</Link>}>
      {settings ? <SettingsForm initialSettings={settings} /> : (
        <div role="alert" className="rounded-2xl border border-rose-300/20 bg-[#151120] p-6 text-sm text-rose-200">Could not load saved settings. Check the Neon connection and database migrations, then <a href="/admin/settings" className="underline">retry</a>. Editing is disabled to protect existing values.</div>
      )}
      <section className="mt-8 rounded-2xl border border-white/10 bg-[#151120] p-6">
        <h2 className="font-display text-2xl italic">Integrations & account</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">{integrations.map(([name, status]) => <div key={name}><dt className="text-sm text-[#cfc4dc]">{name}</dt><dd className="mt-1 text-xs leading-6 text-[#a99bb9]">{status}</dd></div>)}</dl>
        <p className="mt-5 text-xs leading-6 text-[#a99bb9]">Secrets and the admin allowlist remain in server environment variables, not browser-editable settings. Configured tokens do not guarantee service availability.</p>
        <div className="mt-4 flex flex-wrap gap-6 text-sm text-[#b896d1]">
          <Link href="/admin/reset-password" className="py-3">Set or reset password →</Link>
          <a href="/api/admin/audience/export" className="py-3">Export subscribers CSV →</a>
          <Link href="/?newsletter=preview" target="_blank" rel="noopener noreferrer" className="py-3">Preview saved invitation ↗</Link>
        </div>
      </section>
    </SectionShell>
  )
}
