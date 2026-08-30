"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import type { PublicSiteSettings } from "@/lib/site-settings-schema"
import { newsletterEmailError, newsletterEmailSchema } from "@/lib/newsletter-email"

const SEEN_KEY = "subroverse_newsletter_prompt_v1"

export default function NewsletterGate({ ready, settings }: { ready: boolean; settings: PublicSiteSettings }) {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const previewMode = new URLSearchParams(window.location.search).get("newsletter") === "preview"
    if (!ready || (!previewMode && (!settings.newsletterEnabled || window.localStorage.getItem(SEEN_KEY)))) return
    const timer = window.setTimeout(() => setVisible(true), settings.newsletterDelaySeconds * 1000)
    return () => window.clearTimeout(timer)
  }, [ready, settings.newsletterEnabled, settings.newsletterDelaySeconds])

  useEffect(() => {
    if (!visible) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    inputRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [visible])

  const dismiss = () => {
    window.localStorage.setItem(SEEN_KEY, "dismissed")
    setVisible(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validatedEmail = newsletterEmailSchema.safeParse(email)
    if (!validatedEmail.success) {
      setState("error")
      setMessage(newsletterEmailError)
      inputRef.current?.focus()
      return
    }
    setState("sending")
    setMessage("")

    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: validatedEmail.data, company, source: "first-entry-modal" }),
      })
      const data = (await response.json()) as { error?: string; alreadySubscribed?: boolean }
      if (!response.ok) throw new Error(data.error ?? "Could not join the list.")

      window.localStorage.setItem(SEEN_KEY, "subscribed")
      setState("sent")
      setMessage(
        data.alreadySubscribed
          ? "You’re already part of the story."
          : settings.newsletterConfirmation,
      )
    } catch (error) {
      setState("error")
      setMessage(error instanceof Error ? error.message : "Could not join the list.")
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[180] grid place-items-center bg-[#0c0915]/80 px-5 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && dismiss()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-title"
        className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-[rgba(214,189,240,.2)] bg-[#171224] px-7 py-10 shadow-[0_30px_100px_rgba(0,0,0,.55)] md:px-12 md:py-12"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#b896d1]/10 blur-3xl"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close newsletter invitation"
          className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full text-xl text-[#8474a0] transition-colors hover:bg-white/5 hover:text-[#f0ebf5]"
        >
          ×
        </button>

        <p className="font-cursive mb-4 text-xl text-[#b896d1]">a note before you wander</p>
        <h2
          id="newsletter-title"
          className="font-display max-w-md text-3xl font-light italic leading-tight text-[#f0ebf5] md:text-4xl"
        >
          {settings.newsletterTitle}
        </h2>
        <p className="font-body mt-5 max-w-md text-sm leading-7 text-[#9e90af]">
          {settings.newsletterDescription}
        </p>

        {state === "sent" ? (
          <div className="mt-8 rounded-2xl border border-[rgba(184,150,209,.18)] bg-[rgba(184,150,209,.06)] px-5 py-4 text-sm leading-6 text-[#d6bdf0]" role="status">
            {message}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                ref={inputRef}
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@gmail.com"
                maxLength={320}
                aria-describedby="newsletter-email-hint newsletter-email-feedback"
                aria-invalid={state === "error" && !newsletterEmailSchema.safeParse(email).success}
                className="font-body min-h-12 flex-1 rounded-full border border-[rgba(184,150,209,.2)] bg-[#120e1f] px-5 text-sm text-[#f0ebf5] outline-none placeholder:text-[#5f526e] focus:border-[#b896d1]"
              />
              <input
                type="text"
                name="company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <button
                type="submit"
                disabled={state === "sending"}
                className="font-body min-h-12 rounded-full bg-[#b896d1] px-6 text-sm text-[#120e1f] transition-colors hover:bg-[#d6bdf0] disabled:cursor-wait disabled:opacity-60"
              >
                {state === "sending" ? "sending…" : "Keep me in the story"}
              </button>
            </div>
            <p id="newsletter-email-hint" className="mt-3 text-xs leading-5 text-[#a99bb9]">Gmail and iCloud addresses only.</p>
            <p id="newsletter-email-feedback" className="mt-3 text-xs leading-5 text-[#d89aaa]" role="alert">{message}</p>
            <div className="mt-5 flex flex-col gap-3 text-xs text-[#6f617e] sm:flex-row sm:items-center sm:justify-between">
              <span>No noise. Unsubscribe whenever you wish.</span>
              <button type="button" onClick={dismiss} className="text-left underline decoration-white/15 underline-offset-4 hover:text-[#b896d1]">
                Maybe later
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
