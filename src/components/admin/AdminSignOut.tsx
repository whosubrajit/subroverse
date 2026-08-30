"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth/client"

export default function AdminSignOut({ label = "Sign out" }: { label?: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  async function signOut() {
    setPending(true)
    setError(false)
    try {
      const result = await authClient.signOut()
      if (result.error) throw new Error("Sign out failed")
      window.location.assign("/admin")
    } catch {
      setError(true)
      setPending(false)
    }
  }

  return (
    <div>
      <button onClick={signOut} disabled={pending} className="min-h-11 text-sm text-[#b896d1] hover:text-[#d6bdf0] disabled:opacity-50">
        {pending ? "Signing out…" : label}
      </button>
      {error && <p role="alert" className="text-xs text-[#dc91a4]">Could not sign out. Please try again.</p>}
    </div>
  )
}
