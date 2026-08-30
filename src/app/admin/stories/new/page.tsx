import AdminAccessGate from "@/components/admin/AdminAccessGate"
import StoryEditor from "@/components/admin/StoryEditor"
import { getAdminUser } from "@/lib/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "New story", robots: { index: false, follow: false } }

export default async function NewStoryPage() {
  if (!(await getAdminUser())) return <AdminAccessGate />
  return <StoryEditor />
}
