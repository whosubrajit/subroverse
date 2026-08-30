"use client"

import Link from "next/link"
import { isAuthApiError } from "@neondatabase/auth/next"
import { authClient } from "@/lib/auth/client"
import { useState, type FormEvent } from "react"

export default function AdminSignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError("")
    try {
      const result = await authClient.signIn.email({ email: email.trim(), password, callbackURL: "/admin" })
      if (result.error) {
        setError(result.error.message ?? "Could not sign in. Check your email and password.")
        return
      }
      window.location.assign("/admin")
    } catch (cause) {
      setError(isAuthApiError(cause)
        ? cause.message
        : "Could not reach Neon Auth. Please check your connection and try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen text-[#f0ebf5] grid place-items-center px-6 py-12">
      <section className="w-full max-w-md rounded-[28px] border border-[rgba(184,150,209,.16)] bg-[#171224] p-8 md:p-10">
        <p className="font-cursive text-2xl text-[#b896d1] mb-3">the writer’s room</p>
        <h1 className="font-display text-4xl font-light italic mb-3">Welcome back, Subro.</h1>
        <p className="font-body text-sm leading-6 text-[#a99bb9] mb-8">Sign in with your approved Neon Auth account. Use your site account password, not your Neon console password.</p>
        <form onSubmit={submit} aria-busy={pending} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-xs uppercase tracking-[.18em] text-[#766987]">Email</label>
            <input id="admin-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 w-full rounded-xl border border-[rgba(184,150,209,.18)] bg-[#120e1f] px-4 text-sm outline-none focus:border-[#b896d1]" />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-xs uppercase tracking-[.18em] text-[#766987]">Password</label>
            <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-xl border border-[rgba(184,150,209,.18)] bg-[#120e1f] px-4 text-sm outline-none focus:border-[#b896d1]" />
          </div>
          {error && <p role="alert" className="text-sm text-[#dc91a4]">{error}</p>}
          <button disabled={pending} className="min-h-12 w-full rounded-full bg-[#b896d1] text-sm text-[#120e1f] transition-colors hover:bg-[#d6bdf0] disabled:opacity-50">
            {pending ? "opening the room…" : "Enter the writer’s room"}
          </button>
        </form>
        <Link href="/admin/reset-password" className="mt-4 flex min-h-11 items-center text-sm text-[#b896d1]">Set or reset your password →</Link>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center text-sm text-[#b896d1]">← Back to SubroVerse</Link>
      </section>
    </main>
  )
}
