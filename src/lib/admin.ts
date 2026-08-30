import { getAuth, isNeonAuthConfigured } from "@/lib/auth/server"
import { cache } from "react"
import { isAdminEmail } from "@/lib/admin-policy"

export const getAdminAccess = cache(async () => {
  if (!isNeonAuthConfigured()) return { status: "unavailable" } as const
  try {
    const { data: session, error } = await getAuth().getSession()
    if (error) return { status: "unavailable" } as const
    if (!session?.user) return { status: "signed-out" } as const
    if (!isAdminEmail(session.user.email)) return { status: "denied" } as const
    return { status: "allowed", user: session.user } as const
  } catch {
    return { status: "unavailable" } as const
  }
})

export async function getAdminUser() {
  const access = await getAdminAccess()
  return access.status === "allowed" ? access.user : null
}
