import Link from "next/link"
import { getAdminAccess } from "@/lib/admin"
import AdminSignIn from "./AdminSignIn"
import AdminSignOut from "./AdminSignOut"

export default async function AdminAccessGate() {
  const access = await getAdminAccess()
  if (access.status === "signed-out") return <AdminSignIn />

  return (
    <main className="min-h-screen grid place-items-center px-6 text-[#f0ebf5]">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#171224]/95 p-8 text-center">
        <p className="font-cursive text-2xl text-[#b896d1]">the writer’s room</p>
        <h1 className="font-display mt-4 text-3xl font-light italic">
          {access.status === "denied" ? "This room is private." : "Sign-in is temporarily unavailable."}
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#a99bb9]">
          {access.status === "denied"
            ? "You’re signed in, but this account is not approved for admin access. Switch to your approved Neon Auth account."
            : "Neon Auth could not be reached or is not configured. Please try again shortly. Admin access remains locked."}
        </p>
        {access.status === "denied" && <AdminSignOut label="Switch account" />}
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center text-sm text-[#b896d1]">← Back to SubroVerse</Link>
      </section>
    </main>
  )
}
