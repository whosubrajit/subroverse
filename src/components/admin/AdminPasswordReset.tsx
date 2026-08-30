"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { isAuthApiError } from "@neondatabase/auth/next"
import { authClient } from "@/lib/auth/client"

export default function AdminPasswordReset({ token, invalidLink, configured }: {
  token?: string
  invalidLink: boolean
  configured: boolean
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [pending, setPending] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState(invalidLink ? "This reset link is invalid or expired. Request a new one below." : "")
  const fieldClass = "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#120e1f] px-4 text-sm outline-none focus:border-[#b896d1]"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || !configured) return
    setError("")
    if (token && password !== confirmation) {
      setError("The passwords don’t match. Please enter the same password twice.")
      return
    }
    setPending(true)
    try {
      const result = token
        ? await authClient.resetPassword({ token, newPassword: password })
        : await authClient.requestPasswordReset({
            email: email.trim(),
            redirectTo: `${window.location.origin}/admin/reset-password`,
          })
      if (result.error) {
        setError(result.error.message ?? "Could not complete the request. Please try again.")
        return
      }
      setPassword("")
      setConfirmation("")
      setComplete(true)
      if (token) window.history.replaceState(null, "", "/admin/reset-password")
    } catch (cause) {
      setError(isAuthApiError(cause) ? cause.message : "Could not reach Neon Auth. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 py-12 text-[#f0ebf5]">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#171224] p-8 md:p-10">
        <p className="font-cursive mb-3 text-2xl text-[#b896d1]">the writer’s room</p>
        <h1 className="font-display mb-4 text-4xl font-light italic">
          {complete ? token ? "Password saved." : "Check your inbox." : token ? "Choose your password." : "Let’s get you in."}
        </h1>
        {!configured ? <p role="alert">Neon Auth is not configured yet. Password setup is unavailable.</p> : complete ? (
          <p role="status" className="text-sm leading-6 text-[#a99bb9]">
            {token ? "Your new password is ready. Return to login and sign in with your approved email."
              : "If an account exists for that email, Neon will send a reset link. Check your inbox and spam folder, then open the link to choose a password. Keep this local site running while you do this."}
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm leading-6 text-[#a99bb9]">
              {token ? "Choose a unique password with at least 12 characters. Save it in your password manager."
                : "Enter the email you added in Neon Auth. We’ll request a link so you can securely set or reset your site password."}
            </p>
            <form onSubmit={submit} aria-busy={pending} className="space-y-5">
              {token ? <>
                <label className="block text-sm text-[#a99bb9]">New password
                  <input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} className={fieldClass} />
                </label>
                <label className="block text-sm text-[#a99bb9]">Confirm password
                  <input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={e => setConfirmation(e.target.value)} className={fieldClass} />
                </label>
              </> : <label className="block text-sm text-[#a99bb9]">Email
                <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className={fieldClass} />
              </label>}
              {error && <p role="alert" className="text-sm text-[#dc91a4]">{error}</p>}
              <button disabled={pending} className="min-h-12 w-full rounded-full bg-[#b896d1] text-sm text-[#120e1f] hover:bg-[#d6bdf0] disabled:opacity-50">
                {pending ? "Please wait…" : token ? "Save password" : "Send reset link"}
              </button>
            </form>
          </>
        )}
        {complete && !token && <button onClick={() => setComplete(false)} className="mt-4 min-h-11 text-sm text-[#b896d1]">Try again or use another email</button>}
        <Link href="/admin" className="mt-6 flex min-h-11 items-center text-sm text-[#b896d1]">← Back to login</Link>
        {token && !complete && <Link href="/admin/reset-password" className="flex min-h-11 items-center text-sm text-[#b896d1]">Request a new reset link</Link>}
      </section>
    </main>
  )
}
