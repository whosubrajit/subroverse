import { count, eq } from "drizzle-orm"
import AdminAccessGate from "@/components/admin/AdminAccessGate"
import StudioDashboard from "@/components/admin/StudioDashboard"
import { getDb } from "@/db"
import { contactMessages, stories, subscribers } from "@/db/schema"
import { getAdminUser } from "@/lib/admin"
import { getAdminTrafficReport } from "@/lib/cloudflare-analytics"

export const dynamic = "force-dynamic"
export const metadata = { title: "Writer’s room", robots: { index: false, follow: false } }

const emptyCounts = { stories: 0, drafts: 0, scheduled: 0, subscribers: 0, messages: 0 }

async function loadCounts() {
  if (!process.env.DATABASE_URL) return emptyCounts
  const db = getDb()
  const [published, drafts, scheduled, audience, messages] = await Promise.all([
    db.select({ value: count() }).from(stories).where(eq(stories.status, "published")),
    db.select({ value: count() }).from(stories).where(eq(stories.status, "draft")),
    db.select({ value: count() }).from(stories).where(eq(stories.status, "scheduled")),
    db.select({ value: count() }).from(subscribers).where(eq(subscribers.status, "active")),
    db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.status, "unread")),
  ])
  return {
    stories: published[0]?.value ?? 0,
    drafts: drafts[0]?.value ?? 0,
    scheduled: scheduled[0]?.value ?? 0,
    subscribers: audience[0]?.value ?? 0,
    messages: messages[0]?.value ?? 0,
  }
}

export default async function AdminPage() {
  const user = await getAdminUser()
  if (!user) return <AdminAccessGate />
  const [counts, traffic] = await Promise.all([loadCounts(), getAdminTrafficReport()])

  return (
    <StudioDashboard
      adminName={user.name?.split(" ")[0] || "Subro"}
      counts={counts}
      traffic={traffic}
      connected={Boolean(process.env.DATABASE_URL)}
    />
  )
}
