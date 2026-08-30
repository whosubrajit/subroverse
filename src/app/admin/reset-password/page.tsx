import type { Metadata } from "next"
import AdminPasswordReset from "@/components/admin/AdminPasswordReset"
import { isNeonAuthConfigured } from "@/lib/auth/server"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Set your password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const invalidLink = Boolean(params.error)
  const token = !invalidLink && typeof params.token === "string" ? params.token : undefined
  return <AdminPasswordReset token={token} invalidLink={invalidLink} configured={isNeonAuthConfigured()} />
}
