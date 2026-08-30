"use client"

import { useEffect, useState, type FormEvent } from "react"
import { siteSettingsSchema, type PublicSiteSettings } from "@/lib/site-settings-schema"

const fieldClass = "mt-2 w-full rounded-xl border border-white/15 bg-[#120e1f] px-4 py-3 text-sm text-[#f0ebf5] outline-none focus:border-[#b896d1]"

export default function SettingsForm({ initialSettings }: { initialSettings: PublicSiteSettings }) {
  const [settings, setSettings] = useState(initialSettings)
  const [saved, setSaved] = useState(initialSettings)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const dirty = JSON.stringify(settings) !== JSON.stringify(saved)

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function update<K extends keyof PublicSiteSettings>(key: K, value: PublicSiteSettings[K]) {
    setSettings(current => ({ ...current, [key]: value }))
    setMessage("")
    setError("")
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (pending) return
    setMessage("")
    setError("")
    const parsed = siteSettingsSchema.safeParse(settings)
    if (!parsed.success) { setError("Please complete every text field and choose a delay from 0 to 60 seconds."); return }
    setPending(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not save settings.")
      const persisted = siteSettingsSchema.parse(result.settings)
      setSaved(persisted)
      setSettings(persisted)
      setMessage("Saved to Neon. New page loads will use these settings.")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save settings. Please try again.")
    } finally { setPending(false) }
  }

  return (
    <form onSubmit={save} className="space-y-6" aria-busy={pending}>
      <fieldset disabled={pending} className="space-y-5 rounded-2xl border border-white/10 bg-[#151120] p-6">
        <legend className="font-display px-2 text-2xl italic">Homepage</legend>
        <label className="block text-sm text-[#cfc4dc]">Opening line
          <input className={fieldClass} required maxLength={120} value={settings.homeEyebrow} onChange={e => update("homeEyebrow", e.target.value)} />
        </label>
        <label className="block text-sm text-[#cfc4dc]">Introduction
          <textarea className={fieldClass} required maxLength={1200} rows={4} value={settings.homeIntroduction} onChange={e => update("homeIntroduction", e.target.value)} />
        </label>
        <p className="text-xs leading-6 text-[#a99bb9]">Choose the featured story and edit publishing details in Stories. The homepage story limit is unchanged.</p>
      </fieldset>
      <fieldset disabled={pending} className="space-y-5 rounded-2xl border border-white/10 bg-[#151120] p-6">
        <legend className="font-display px-2 text-2xl italic">Newsletter invitation</legend>
        <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={settings.newsletterEnabled} onChange={e => update("newsletterEnabled", e.target.checked)} />Show the invitation to new visitors</label>
        <label className="block text-sm text-[#cfc4dc]">Invitation heading
          <input className={fieldClass} required maxLength={180} value={settings.newsletterTitle} onChange={e => update("newsletterTitle", e.target.value)} />
        </label>
        <label className="block text-sm text-[#cfc4dc]">Invitation message
          <textarea className={fieldClass} required maxLength={1200} rows={4} value={settings.newsletterDescription} onChange={e => update("newsletterDescription", e.target.value)} />
        </label>
        <label className="block text-sm text-[#cfc4dc]">Delay after the welcome screen (seconds)
          <input className={fieldClass} type="number" required min={0} max={60} step={0.1} value={Number.isNaN(settings.newsletterDelaySeconds) ? "" : settings.newsletterDelaySeconds} onChange={e => update("newsletterDelaySeconds", e.target.valueAsNumber)} />
        </label>
        <label className="block text-sm text-[#cfc4dc]">Subscription confirmation
          <textarea className={fieldClass} required maxLength={500} rows={2} value={settings.newsletterConfirmation} onChange={e => update("newsletterConfirmation", e.target.value)} />
        </label>
        <p className="text-xs leading-6 text-[#a99bb9]">Dismissed invitations stay dismissed in that browser. Emails are stored in Neon; sending stays manual through Gmail. Saving does not send any email.</p>
      </fieldset>
      <div className="sticky bottom-0 rounded-2xl border border-white/10 bg-[#120e1f] p-5 shadow-xl">
        <div className="flex flex-wrap items-center gap-4">
          <button disabled={pending || !dirty} className="min-h-11 rounded-full bg-[#b896d1] px-6 text-sm text-[#120e1f] disabled:opacity-50">{pending ? "Saving…" : "Save settings"}</button>
          <button type="button" disabled={pending || !dirty} onClick={() => { setSettings(saved); setMessage(""); setError("") }} className="min-h-11 text-sm text-[#b896d1] disabled:opacity-50">Discard changes</button>
          <span className="text-xs text-[#a99bb9]">{dirty ? "Unsaved changes" : "No unsaved changes"}</span>
        </div>
        {message && <p role="status" className="mt-3 text-sm text-emerald-200">{message}</p>}
        {error && <p role="alert" className="mt-3 text-sm text-rose-200">{error}</p>}
      </div>
    </form>
  )
}
