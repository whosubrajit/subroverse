import type { ReactNode } from "react"
import AdminShell from "@/components/admin/AdminShell"
import { getAdminUser } from "@/lib/admin"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Pages and API handlers retain their own authorization checks.
  const user = await getAdminUser()
  if (!user) return children
  return <AdminShell connected={Boolean(process.env.DATABASE_URL)}>{children}</AdminShell>
}
