"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { blankStory, encodeEditorDraft, normalizeEditorStory, readEditorDraft, saveEditorStory } from "@/lib/story-editor"
import type { EditorStatus, EditorStory } from "@/lib/story-editor"

const fieldClass = "w-full rounded-xl border border-white/[.07] bg-[#100d19] px-4 py-3 text-sm text-[#eee6f5] outline-none transition-colors placeholder:text-[#4f455a] focus:border-[#b896d1]/60"
const labelClass = "mb-2 block text-[10px] uppercase tracking-[.18em] text-[#74667f]"

export default function StoryEditor({ initialStory }: { initialStory?: Partial<EditorStory> }) {
  const router = useRouter()
  const draftKey = initialStory?.id ? `subroverse_editor_${initialStory.id}` : "subroverse_editor_new"
  const [story, setStory] = useState<EditorStory>({ ...blankStory, ...initialStory })
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(false)
  const [ready, setReady] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<EditorStory | null>(null)
  const [draftWarning, setDraftWarning] = useState("")
  const original = useRef(initialStory ?? {})
  const busy = useRef(false)
  const finished = useRef(false)

  useEffect(() => {
    const initial = normalizeEditorStory(original.current)
    setStory(initial)
    try {
      setPendingDraft(readEditorDraft(window.localStorage.getItem(draftKey), initial))
    } catch {
      setDraftWarning("This browser cannot store recovery drafts. Save to the database before leaving.")
    }
    setReady(true)
  }, [draftKey])

  useEffect(() => {
    if (!ready || pendingDraft || saveState === "saving" || finished.current) return
    const timer = window.setTimeout(() => {
      if (busy.current || finished.current) return
      try {
        window.localStorage.setItem(draftKey, encodeEditorDraft(story, original.current))
        setDraftWarning("")
        if (saveState === "idle") setSaveState("saved")
      } catch {
        setDraftWarning("Recovery draft could not be stored. Save to the database before leaving.")
      }
    }, 700)
    return () => window.clearTimeout(timer)
  }, [draftKey, ready, pendingDraft, saveState, story])

  const metrics = useMemo(() => {
    const words = story.body.trim() ? story.body.trim().split(/\s+/).length : 0
    return { words, minutes: Math.max(1, Math.ceil(words / 220)) }
  }, [story.body])

  const update = <K extends keyof EditorStory>(key: K, value: EditorStory[K]) => {
    setSaveState("idle")
    setStory((current) => ({ ...current, [key]: value }))
  }

  const save = async (status: EditorStatus) => {
    if (!ready || pendingDraft || busy.current || finished.current) return
    if (!story.title.trim() || !story.excerpt.trim() || !story.body.trim()) {
      setError("Title, excerpt and body are required.")
      return
    }
    if (status === "scheduled" && !story.scheduledFor) {
      setError("Choose a publishing time before scheduling.")
      return
    }

    setSaveState("saving")
    setError("")
    busy.current = true
    try {
      await saveEditorStory(story, original.current, status)
      finished.current = true
      try { window.localStorage.removeItem(draftKey) } catch { /* Do not retry an already-saved story because of local storage. */ }
      setSaveState("saved")
      router.push("/admin/stories")
      router.refresh()
    } catch (cause) {
      setSaveState("error")
      setError(cause instanceof Error ? cause.message : "The story could not be saved. Please try again.")
    } finally {
      busy.current = false
    }
  }

  if (!ready) return <p role="status" className="p-8 text-[#a99bb9]">Opening your draft…</p>

  return (
    <div className="min-h-screen text-[#f0ebf5]">
      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-white/[.06] bg-[#0e0b18]/90 px-4 backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/stories")} className="grid h-10 w-10 place-items-center rounded-full text-[#8f819f] hover:bg-white/5 hover:text-white" aria-label="Back to stories">←</button>
          <div><p className="font-cursive text-lg text-[#b896d1]">story studio</p><p className="text-[10px] uppercase tracking-widest text-[#665a73]">{saveState === "saving" ? "saving…" : finished.current ? "saved to database" : saveState === "saved" ? "recovery draft on this device" : "editing"}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreview((value) => !value)} className="min-h-10 rounded-full border border-white/[.08] px-4 text-xs text-[#9e90af] hover:border-[#b896d1]/40">{preview ? "Edit" : "Preview"}</button>
          <button onClick={() => save("draft")} disabled={saveState === "saving" || !!pendingDraft || finished.current} className="min-h-10 rounded-full border border-[#b896d1]/25 px-4 text-xs text-[#c7afd9] hover:bg-[#b896d1]/8 disabled:opacity-50">Save draft</button>
          <button onClick={() => save(story.status === "scheduled" ? "scheduled" : "published")} disabled={saveState === "saving" || !!pendingDraft || finished.current} className="min-h-10 rounded-full bg-[#b896d1] px-5 text-xs text-[#120e1f] hover:bg-[#d6bdf0] disabled:opacity-50">{story.status === "scheduled" ? "Schedule" : "Publish"}</button>
        </div>
      </header>

      {pendingDraft && <section aria-label="Draft recovery" className="mx-5 mt-5 rounded-xl border border-[#b896d1]/30 bg-[#151120] p-5 text-sm">
        <p>A different recovery draft was found on this device. Restore it, or keep the database version shown below.</p>
        <div className="mt-4 flex gap-4">
          <button className="rounded-full bg-[#b896d1] px-4 py-2 text-[#120e1f]" onClick={() => { setStory(pendingDraft); setPendingDraft(null); setSaveState("idle") }}>Restore draft</button>
          <button className="rounded-full border border-white/20 px-4 py-2" onClick={() => { try { window.localStorage.removeItem(draftKey) } catch { /* Autosave will report storage errors. */ } setPendingDraft(null) }}>Discard recovery draft</button>
        </div>
      </section>}
      {draftWarning && <p role="status" className="mx-5 mt-4 text-sm text-amber-200">{draftWarning}</p>}
      {error && <p role="alert" className="mx-5 mt-4 rounded-xl border border-red-300/15 bg-red-300/5 p-4 text-sm text-[#dc91a4]">{error}</p>}
      <fieldset disabled={!!pendingDraft || saveState === "saving" || finished.current} className="contents">
      {preview ? (
        <main className="mx-auto max-w-2xl px-6 py-16">
          <p className="font-cursive text-lg text-[#b896d1]">{story.series || story.format}</p>
          <h1 className="font-display mt-3 text-5xl font-light italic leading-tight md:text-6xl">{story.title || "Untitled"}</h1>
          {story.subtitle && <p className="font-display mt-4 text-2xl italic text-[#9e90af]">{story.subtitle}</p>}
          <p className="mt-7 text-sm text-[#766987]">{metrics.minutes} min read · {metrics.words} words</p>
          <div className="prose-story mt-14">{story.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        </main>
      ) : (
        <main className="mx-auto grid max-w-7xl gap-7 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
          <section className="space-y-5 rounded-2xl border border-white/[.06] bg-[#151120] p-5 md:p-7">
            <div>
              <label htmlFor="story-title" className={labelClass}>Title</label>
              <input id="story-title" value={story.title} onChange={(event) => update("title", event.target.value)} placeholder="The title of this piece…" className="font-display w-full border-0 bg-transparent py-2 text-4xl font-light italic outline-none placeholder:text-[#4d4258] md:text-5xl" />
            </div>
            <input value={story.subtitle} onChange={(event) => update("subtitle", event.target.value)} placeholder="A subtitle, if the story asks for one" className="font-display w-full border-0 bg-transparent text-xl italic text-[#9e90af] outline-none placeholder:text-[#4d4258]" />
            <div>
              <label htmlFor="story-excerpt" className={labelClass}>Excerpt</label>
              <textarea id="story-excerpt" rows={3} value={story.excerpt} onChange={(event) => update("excerpt", event.target.value)} placeholder="The invitation readers see before opening the story…" className={`${fieldClass} resize-y leading-6`} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between"><label htmlFor="story-body" className="text-[10px] uppercase tracking-[.18em] text-[#74667f]">Body</label><span className="text-[10px] text-[#62566f]">{metrics.words} words · {metrics.minutes} min</span></div>
              <textarea id="story-body" rows={24} value={story.body} onChange={(event) => update("body", event.target.value)} placeholder="Write slowly. There is no hurry here…" className={`${fieldClass} font-body resize-y text-base leading-8`} />
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-white/[.06] bg-[#151120] p-5">
              <h2 className="font-display text-xl font-light italic">Publishing</h2>
              <div className="mt-5 space-y-4">
                <div><label htmlFor="story-status" className={labelClass}>State</label><select id="story-status" value={story.status} onChange={(event) => update("status", event.target.value as EditorStatus)} className={fieldClass}><option value="draft">Draft</option><option value="published">Publish now</option><option value="scheduled">Schedule</option></select></div>
                {story.status === "scheduled" && <div><label htmlFor="story-schedule" className={labelClass}>Publish at</label><input id="story-schedule" type="datetime-local" value={story.scheduledFor} onChange={(event) => update("scheduledFor", event.target.value)} className={fieldClass} /></div>}
                <div><label htmlFor="story-published-at" className={labelClass}>Published date</label><input id="story-published-at" type="datetime-local" value={story.publishedAt} onChange={(event) => update("publishedAt", event.target.value)} className={fieldClass} /></div>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[.06] px-4 py-3 text-sm text-[#9e90af]"><span>Feature on homepage</span><input type="checkbox" checked={story.featured} onChange={(event) => update("featured", event.target.checked)} className="accent-[#b896d1]" /></label>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[.06] bg-[#151120] p-5">
              <h2 className="font-display text-xl font-light italic">Organization</h2>
              <div className="mt-5 space-y-4">
                <div><label htmlFor="story-format" className={labelClass}>Format</label><select id="story-format" value={story.format} onChange={(event) => update("format", event.target.value)} className={fieldClass}>{["Prose", "Poetry", "Letter", "List", "Fragment"].map((item) => <option key={item}>{item}</option>)}</select></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label htmlFor="story-series" className={labelClass}>Series</label><input id="story-series" value={story.series || ""} onChange={(event) => update("series", event.target.value)} placeholder="e.g. Shree" className={fieldClass} /></div>
                  <div><label htmlFor="story-series-slug" className={labelClass}>Series URL slug</label><input id="story-series-slug" value={story.seriesSlug || ""} onChange={(event) => update("seriesSlug", event.target.value)} placeholder="e.g. shree" className={fieldClass} /></div>
                </div>
                <div><label htmlFor="story-slug" className={labelClass}>Story URL slug</label><input id="story-slug" value={story.slug} onChange={(event) => update("slug", event.target.value)} placeholder="generated-from-title" className={fieldClass} /></div>
              </div>
            </section>

            <details className="rounded-2xl border border-white/[.06] bg-[#151120] p-5">
              <summary className="font-display cursor-pointer text-xl font-light italic">SEO & sharing</summary>
              <div className="mt-5 space-y-4">
                <div><label htmlFor="seo-title" className={labelClass}>Search title · {story.seoTitle.length}/70</label><input id="seo-title" value={story.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} className={fieldClass} /></div>
                <div><label htmlFor="seo-description" className={labelClass}>Description · {story.seoDescription.length}/170</label><textarea id="seo-description" rows={3} value={story.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} className={fieldClass} /></div>
                <div><label htmlFor="canonical-url" className={labelClass}>Canonical URL</label><input id="canonical-url" type="url" value={story.canonicalUrl} onChange={(event) => update("canonicalUrl", event.target.value)} className={fieldClass} /></div>
              </div>
            </details>

          </aside>
        </main>
      )}
      </fieldset>
    </div>
  )
}
