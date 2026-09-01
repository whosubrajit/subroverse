"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import ProfileCard from "@/components/ProfileCard"
import NewsletterGate from "@/components/NewsletterGate"
import PublicAnalytics from "@/components/PublicAnalytics"
import { publicAnalyticsLocation } from "@/lib/analytics-policy"
import type { PublicSiteSettings } from "@/lib/site-settings-schema"
import EnvelopeIntro from "@/components/EnvelopeIntro"
import { shouldShowEntryIntro } from "@/lib/intro-timing"
import { loadStoryFeed } from "@/lib/story-feed"
import type { PublicStory } from "@/lib/story-feed"
import suberoImgAsset from "@/imports/Subroooooooo.jpeg"
import profileFlowerAsset from "@/imports/Untitled__Logo___7_.png"

const assetUrl = (asset: string | { src: string }) =>
  typeof asset === "string" ? asset : asset.src

// SVG attributes must serialize identically in Node and the browser during hydration.
// Fixed precision avoids insignificant Math.sin/Math.cos engine differences.
const radialPoint = (angle: number, centerX: number, centerY: number, radius: number) => {
  const radians = (angle * Math.PI) / 180
  return [
    (centerX + Math.cos(radians) * radius).toFixed(6),
    (centerY + Math.sin(radians) * radius).toFixed(6),
  ] as const
}

const suberoImg = assetUrl(suberoImgAsset)

type Page = "home" | "about" | "write" | "admin" | "stories" | "series" | "series-index"

type Destination =
  | { type: "page"; page: Page }
  | { type: "story"; story: Story }

type Story = PublicStory

/* ════════════════════════
   REDUCED MOTION HOOK
   ════════════════════════ */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    setReduced(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

/* ════════════════════════
   FLORAL DIVIDER
   ════════════════════════ */
function FloralDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-14 opacity-60" aria-hidden="true">
      <div className="h-px flex-1 max-w-40 bg-gradient-to-r from-transparent to-[#b896d1]" />
      <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
        {[0, 72, 144, 216, 288].map((a, i) => {
          const [x, y] = radialPoint(a, 9, 9, 5)
          return (
            <ellipse key={i} cx={x} cy={y} rx="2" ry="3.5"
              transform={`rotate(${a + 90},${x},${y})`} fill="#c49ce6" />
          )
        })}
        <circle cx="9" cy="9" r="1.5" fill="#fde8b0" />
      </svg>
      <div className="h-px flex-1 max-w-40 bg-gradient-to-l from-transparent to-[#b896d1]" />
    </div>
  )
}

/* ════════════════════════
   FOOTER FLOWER (shared)
   ════════════════════════ */
function FooterFlower() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" opacity="0.4" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((a, i) => {
        const [x, y] = radialPoint(a, 9, 9, 5)
        return (
          <ellipse key={i} cx={x} cy={y} rx="2" ry="3.5"
            transform={`rotate(${a + 90},${x},${y})`} fill="#c49ce6" />
        )
      })}
      <circle cx="9" cy="9" r="1.5" fill="#fde8b0" />
    </svg>
  )
}

/* ════════════════════════
   SHARED FOOTER
   ════════════════════════ */
function SiteFooter() {
  return (
    <footer
      className="border-t border-[rgba(184,150,209,0.08)] py-10 px-6"
      style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#8a7a9e]">
        <span className="font-cursive text-[#b896d1] text-base">subroverse</span>
        <p className="font-body">written in the small hours · {new Date().getFullYear()}</p>
        <FooterFlower />
      </div>
    </footer>
  )
}

/* ════════════════════════
   NAV
   ════════════════════════ */
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b896d1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120e1f] rounded-sm"

function Nav({
  page,
  onNavigate,
  onBack,
  onBrand,
}: {
  page: Page
  onNavigate: (p: Page) => void
  onBack?: () => void
  onBrand?: () => void
}) {
  return (
    <nav
      className="bg-[rgba(18,14,31,0.88)] backdrop-blur-md border-b border-[rgba(184,150,209,0.1)]"
      aria-label="Main navigation"
    >
      <div
        className="max-w-3xl mx-auto px-6 flex items-center justify-between"
        style={{
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
          paddingBottom: "1.25rem",
          paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
          paddingRight: "max(1.5rem, env(safe-area-inset-right))",
          minHeight: "64px",
        }}
      >
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onBrand ? onBrand() : onNavigate("home")
          }}
          aria-label="Replay welcome and go home"
          className={`font-cursive text-[#b896d1] text-xl hover:opacity-70 transition-opacity min-h-[44px] flex items-center ${focusRing}`}
        >
          subroverse
        </a>
        <div className="flex items-center gap-6 sm:gap-8">
          {onBack && (
            <button
              onClick={onBack}
              className="font-body text-xs tracking-widest uppercase text-[#9080aa] hover:text-[#b896d1] transition-colors"
            >
              ← back
            </button>
          )}
          <a
            href="/about"
            onClick={(e) => { e.preventDefault(); onNavigate("about"); }}
            className={`font-body text-xs tracking-widest uppercase transition-colors ${page === "about"
              ? "text-[#b896d1]"
              : "text-[#9080aa] hover:text-[#b896d1]"
              }`}
          >
            about
          </a>
          <a
            href="/stories"
            onClick={(e) => { e.preventDefault(); onNavigate("stories"); }}
            className={`font-body text-xs tracking-widest uppercase transition-colors ${focusRing} ${page === "home" || page === "stories"
              ? "text-[#b896d1]"
              : "text-[#9080aa] hover:text-[#b896d1]"
              }`}
          >
            stories
          </a>
          <a
            href="/write"
            onClick={(e) => { e.preventDefault(); onNavigate("write"); }}
            className={`font-body text-xs tracking-widest uppercase transition-colors ${page === "write"
              ? "text-[#b896d1]"
              : "text-[#9080aa] hover:text-[#b896d1]"
              }`}
          >
            write to me
          </a>
        </div>
      </div>
    </nav>
  )
}

/* ════════════════════════
   STORY READER
   ════════════════════════ */
function StoryView({
  story,
  allStories,
  onBack,
  onNavigate,
  onOpenStory,
  onBrand,
  isSeriesContext,
}: {
  story: Story
  allStories: Story[]
  onBack: () => void
  onNavigate: (p: Page) => void
  onOpenStory: (s: Story) => void
  onBrand: () => void
  isSeriesContext?: boolean
}) {
  const reduced = useReducedMotion()

  // Sort stories by date to match Archive order (newest first)
  const sortedStories = [...allStories].sort((a, b) => {
    const da = new Date(a.date).getTime()
    const db = new Date(b.date).getTime()
    if (isNaN(da) && isNaN(db)) return 0
    if (isNaN(da)) return 1
    if (isNaN(db)) return -1
    return db - da
  })

  const currentIndex = sortedStories.findIndex(s => s.id === story.id)
  const nextStory = sortedStories[currentIndex - 1] // Newer
  const prevStory = sortedStories[currentIndex + 1] // Older

  return (
    <div
      className="min-h-screen"
      style={{ animation: reduced ? "none" : "fadeUp 0.6s ease-out forwards" }}
    >
      <Nav page="home" onNavigate={onNavigate} onBack={onBack} onBrand={onBrand} />
      <main className="max-w-2xl mx-auto px-6 pt-12 pb-32">
        <p className="font-cursive text-sm text-[#b896d1] opacity-70">
          {story.category}
          {story.series && story.seriesSlug ? (
            <>
              {" · "}
              <a
                href={`/series/${story.seriesSlug}`}
                className="hover:underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const slug = story.seriesSlug
                  window.history.pushState(null, "", `/series/${slug}`);
                  window.dispatchEvent(new Event('popstate'));
                }}
              >
                {story.series}
              </a>
            </>
          ) : ""}
        </p>
        <h1 className="font-display font-light italic text-4xl md:text-5xl text-[#f0ebf5] mt-3 mb-4 leading-tight">
          {story.title}
        </h1>
        <p className="font-body text-xs text-[#9080aa] mb-16">
          {story.date} · {story.readTime} read
        </p>

        {story.body.length > 0 ? (
          <div className="prose-story">
            {story.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <div className="border border-[rgba(184,150,209,0.15)] rounded-xl p-8 mb-10">
            <p className="font-body text-xs text-[#8a7a9e] tracking-widest uppercase mb-4">excerpt</p>
            <p className="font-body text-[#dcd3e6] leading-relaxed italic">{story.excerpt}</p>
          </div>
        )}

        <FloralDivider />
        <p className="font-cursive text-center text-[#b896d1] text-xl opacity-50 mb-12">
          — written with love
        </p>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex-1 text-center sm:text-left">
            {nextStory && (
              <a
                href={`/stories/${nextStory.slug}`}
                onClick={(e) => { e.preventDefault(); onOpenStory(nextStory) }}
                className="group block"
              >
                <p className="font-display italic text-2xl text-[#9e90af] group-hover:text-[#b896d1] transition-colors">← {nextStory.title}</p>
              </a>
            )}
          </div>

          <div className="flex-1 text-center sm:text-right">
            {prevStory && (
              <a
                href={`/stories/${prevStory.slug}`}
                onClick={(e) => { e.preventDefault(); onOpenStory(prevStory) }}
                className="group block"
              >
                <p className="font-display italic text-2xl text-[#9e90af] group-hover:text-[#b896d1] transition-colors">{prevStory.title} →</p>
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className={`font-body text-xs text-[#9e90af] hover:text-[#b896d1] transition-colors tracking-widest uppercase min-h-[44px] inline-flex items-center ${focusRing}`}
          >
            ← back to {isSeriesContext ? "series" : "stories"}
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

/* ════════════════════════
   STORY CARD
   ════════════════════════ */
function StoryCard({
  story,
  onClick,
}: {
  story: Story
  onClick: () => void
}) {
  return (
    <a
      href={story.slug ? `/stories/${story.slug}` : `/stories/${encodeURIComponent(String(story.id))}`}
      onClick={(event) => {
        event.preventDefault()
        onClick()
      }}
      aria-label={`Read story: ${story.title}`}
      className={`group block cursor-pointer border-b border-[rgba(184,150,209,0.1)] py-8 hover:border-[rgba(184,150,209,0.3)] transition-all duration-300 ${focusRing}`}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <span className="font-cursive text-[#b896d1] text-sm opacity-70 mb-2 block">
            {story.category}{story.series && story.seriesSlug ? ` · ${story.series}` : ""}
          </span>
          <h3 className="font-display font-light italic text-2xl text-[#f0ebf5] leading-tight mb-3 group-hover:text-[#d6bdf0] transition-colors">
            {story.title}
          </h3>
          <p className="font-body text-sm text-[#9080aa] leading-relaxed line-clamp-2 max-w-xl">
            {story.excerpt}
          </p>
        </div>
        <div className="text-right flex-none">
          <p className="font-body text-xs text-[#8474a0] whitespace-nowrap">
            {story.readTime}
          </p>
          <span className="font-body text-[#b896d1] opacity-0 group-hover:opacity-100 transition-opacity text-sm mt-2 block">
            read →
          </span>
        </div>
      </div>
    </a>
  )
}

/* ════════════════════════
   BOTANICAL MONOGRAM (About page fallback portrait)
   ════════════════════════ */
function BotanicalMonogram() {
  return (
    <svg
      viewBox="0 0 208 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Abstract portrait silhouette */}
      <ellipse cx="104" cy="88" rx="42" ry="48" fill="rgba(180,150,209,0.10)" stroke="rgba(184,150,209,0.25)" strokeWidth="1" />
      <path d="M62 136 Q60 200 104 220 Q148 200 146 136" fill="rgba(180,150,209,0.07)" stroke="rgba(184,150,209,0.18)" strokeWidth="1" />

      {/* Monogram S — delicate letterform */}
      <text
        x="104" y="104"
        fontFamily="Georgia, serif"
        fontSize="68"
        fontWeight="300"
        fontStyle="italic"
        fill="rgba(196,156,230,0.55)"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        S
      </text>

      {/* Botanical branches left */}
      <path d="M30 170 Q50 145 68 155" stroke="#b896d1" strokeWidth="0.7" opacity="0.4" fill="none" />
      <ellipse cx="50" cy="147" rx="6" ry="3.5" fill="#c49ce6" opacity="0.3" transform="rotate(-30 50 147)" />
      <ellipse cx="62" cy="142" rx="5" ry="3" fill="#c49ce6" opacity="0.25" transform="rotate(-10 62 142)" />
      <path d="M30 180 Q42 165 55 170" stroke="#b896d1" strokeWidth="0.5" opacity="0.3" fill="none" />
      <ellipse cx="43" cy="163" rx="4.5" ry="2.5" fill="#c49ce6" opacity="0.2" transform="rotate(-25 43 163)" />

      {/* Botanical branches right */}
      <path d="M178 170 Q158 145 140 155" stroke="#b896d1" strokeWidth="0.7" opacity="0.4" fill="none" />
      <ellipse cx="158" cy="147" rx="6" ry="3.5" fill="#c49ce6" opacity="0.3" transform="rotate(30 158 147)" />
      <ellipse cx="146" cy="142" rx="5" ry="3" fill="#c49ce6" opacity="0.25" transform="rotate(10 146 142)" />
      <path d="M178 180 Q166 165 153 170" stroke="#b896d1" strokeWidth="0.5" opacity="0.3" fill="none" />
      <ellipse cx="165" cy="163" rx="4.5" ry="2.5" fill="#c49ce6" opacity="0.2" transform="rotate(25 165 163)" />

      {/* Stem at base */}
      <line x1="104" y1="220" x2="104" y2="248" stroke="#b896d1" strokeWidth="0.6" opacity="0.3" />
      <ellipse cx="104" cy="250" rx="12" ry="4" fill="none" stroke="#b896d1" strokeWidth="0.5" opacity="0.2" />

      {/* Top small blossoms */}
      {[80, 128].map((x, i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map((a, j) => {
            const [petalX, petalY] = radialPoint(a, x, 30, 6)
            return (
              <ellipse key={j}
                cx={petalX} cy={petalY}
                rx="2" ry="3.5"
                transform={`rotate(${a + 90},${petalX},${petalY})`}
                fill="#c49ce6" opacity="0.3"
              />
            )
          })}
          <circle cx={x} cy={30} r="1.5" fill="#fde8b0" opacity="0.4" />
        </g>
      ))}
    </svg>
  )
}

/* ════════════════════════
   ABOUT PAGE
   ════════════════════════ */
function AboutPage({ onNavigate, onBrand, settings }: { onNavigate: (p: Page) => void; onBrand: () => void; settings: PublicSiteSettings }) {
  const reduced = useReducedMotion()

  return (
    <div
      className="min-h-screen text-[#f0ebf5]"
      style={{ animation: reduced ? "none" : "fadeUp 0.6s ease-out forwards" }}
    >
      <Nav page="about" onNavigate={onNavigate} onBrand={onBrand} />

      <main className="max-w-3xl mx-auto px-6 pt-14 pb-32">
        {/* Author card */}
        <div className="flex flex-col md:flex-row gap-12 items-start mb-20">
          {/* Interactive author profile */}
          <div className="flex-none w-full md:w-auto">
            <ProfileCard
              name={settings.profileName}
              title={settings.profileTitle}
              handle={settings.profileHandle}
              contactText={settings.profileContactText}
              avatarUrl={suberoImg}
              miniAvatarUrl={suberoImg}
              iconUrl={assetUrl(profileFlowerAsset)}
              showUserInfo
              enableTilt={!reduced}
              enableMobileTilt={false}
              onContactClick={() => window.location.assign(settings.profileContactUrl)}
              behindGlowEnabled
              behindGlowColor="rgba(184, 150, 209, 0.58)"
              innerGradient="linear-gradient(145deg, rgba(96,73,110,.55) 0%, rgba(113,196,255,.18) 100%)"
            />
          </div>

          {/* Bio */}
          <div className="flex-1 pt-2">
            <p className="font-cursive text-[#b896d1] text-base opacity-70 mb-2">the author</p>
            <h1 className="font-display font-light italic text-4xl text-[#f0ebf5] mb-1 leading-tight">
              {settings.aboutBioName}
            </h1>
            <p className="font-body text-xs text-[#8474a0] mb-6 tracking-widest uppercase">
              {settings.aboutBioTitle}
            </p>
            {settings.aboutBioText.split("\n\n").map((paragraph, i) => (
              <p key={i} className={`font-body text-sm text-[#9080aa] leading-relaxed ${i !== settings.aboutBioText.split("\n\n").length - 1 ? "mb-4" : ""}`}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <FloralDivider />

        {/* About the site */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2">
            <p className="font-cursive text-[#b896d1] text-base opacity-70 mb-4">{settings.aboutSiteEyebrow}</p>
            <h2 className="font-display font-light italic text-4xl text-[#f0ebf5] mb-7 leading-tight whitespace-pre-line">
              {settings.aboutSiteTitle}
            </h2>
            {settings.aboutSiteText.split("\n\n").map((paragraph, i) => (
              <p key={i} className={`font-body text-[#9080aa] leading-relaxed text-sm ${i !== settings.aboutSiteText.split("\n\n").length - 1 ? "mb-5" : ""}`}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="border-l border-[rgba(184,150,209,0.15)] pl-8 pt-2">
            <blockquote className="font-display italic text-xl text-[#b896d1] font-light leading-snug">
              {settings.aboutSiteQuote}
            </blockquote>
          </div>
        </div>

        <FloralDivider />

        <p className="font-cursive text-center text-[#b896d1] text-xl opacity-40">
          — সুব্রভার্সে কোনো হ্যাপি এন্ডিং নেই
        </p>
      </main>

      <footer className="border-t border-[rgba(184,150,209,0.08)] py-10 px-6 ">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-[#8474a0]">
          <span className="font-cursive text-[#b896d1] text-base">
            subroverse
          </span>
          <p className="font-body">
            written in the small hours · {new Date().getFullYear()}
          </p>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            opacity="0.4"
          >
            {[0, 72, 144, 216, 288].map((a, i) => {
              const [x, y] = radialPoint(a, 9, 9, 5)
              return (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx="2"
                  ry="3.5"
                  transform={`rotate(${a + 90},${x},${y})`}
                  fill="#c49ce6"
                />
              )
            })}
            <circle cx="9" cy="9" r="1.5" fill="#fde8b0" />
          </svg>
        </div>
      </footer>
    </div>
  )
}

/* ════════════════════════
   WRITE TO ME PAGE
   ════════════════════════ */
function WriteToMePage({ onNavigate, onBrand }: { onNavigate: (p: Page) => void; onBrand: () => void }) {
  const reduced = useReducedMotion()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [company, setCompany] = useState("")
  const [subscribe, setSubscribe] = useState(false)
  const [messageErr, setMessageErr] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setMessageErr("Please write something — even a single line.")
      return
    }
    setMessageErr("")
    setSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message, company, subscribe }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data.error ?? "The message could not be sent.")
      setSubmitted(true)
    } catch (error) {
      setMessageErr(error instanceof Error ? error.message : "The message could not be sent.")
    } finally {
      setSending(false)
    }
  }

  const inputClass =
    "w-full bg-transparent border-b border-[rgba(184,150,209,0.18)] focus:border-[#b896d1] outline-none py-4 font-body text-base text-[#f0ebf5] placeholder-[#5a5070] transition-colors duration-300 caret-[#b896d1]"

  return (
    <div
      className="min-h-screen text-[#f0ebf5]"
      style={{ animation: reduced ? "none" : "fadeUp 0.6s ease-out forwards" }}
    >
      <Nav page="write" onNavigate={onNavigate} onBrand={onBrand} />

      <main className="max-w-2xl mx-auto px-6 pt-14 pb-32">
        {/* Header */}
        <div className="mb-16">
          <p className="font-cursive text-[#b896d1] text-base opacity-70 mb-3">a quiet corner</p>
          <h1 className="font-display font-light italic text-5xl md:text-6xl text-[#f0ebf5] leading-tight mb-6">
            Write to me
          </h1>
          <p className="font-body text-sm text-[#9080aa] leading-relaxed max-w-md">
            If these words found you at the right moment, or if you have
            something to say — about the stories, about longing, about anything
            at all — I would be glad to hear it. Write slowly. There is no hurry here.
          </p>
        </div>

        <FloralDivider />

        {submitted ? (
          <div
            className="py-24 text-center"
            style={{ animation: reduced ? "none" : "fadeUp 0.6s ease-out forwards" }}
            role="status"
          >
            <svg
              className="mx-auto mb-6 opacity-40"
              width="48" height="48" viewBox="0 0 48 48" fill="none"
              aria-hidden="true"
            >
              {[0, 72, 144, 216, 288].map((a, i) => {
                const [x, y] = radialPoint(a, 24, 24, 13)
                return (
                  <ellipse key={i}
                    cx={x} cy={y}
                    rx="4.5" ry="7.5"
                    transform={`rotate(${a + 90},${x},${y})`}
                    fill="#c49ce6"
                  />
                )
              })}
              <circle cx="24" cy="24" r="3" fill="#fde8b0" />
            </svg>
            <p className="font-cursive text-[#b896d1] text-3xl mb-3">
              received.
            </p>
            <p className="font-body text-sm text-[#9080aa] mb-1">
              thank you for writing.
            </p>
            <p className="font-body text-sm text-[#8474a0]">
              it means something, that you did.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setName("")
                setEmail("")
                setMessage("")
                setCompany("")
              }}
              className="mt-10 font-body text-xs text-[#8474a0] hover:text-[#b896d1] transition-colors tracking-widest uppercase"
            >
              write again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10" noValidate>
            <div className="pointer-events-none absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="contact-company">Company website</label>
              <input
                id="contact-company"
                name="company"
                type="text"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="contact-name" className="font-body text-xs text-[#8474a0] tracking-widest uppercase block mb-2">
                your name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Whisper your name, or let it remain a sacred silence."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="font-body text-xs text-[#8474a0] tracking-widest uppercase block mb-2">
                your email <span className="normal-case tracking-normal opacity-60">(optional)</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="If you seek an answer in the wind."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="font-body text-xs text-[#8474a0] tracking-widest uppercase block mb-2">
                your message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                placeholder="Release your words to the quiet..."
                value={message}
                onChange={(e) => { setMessage(e.target.value); if (e.target.value.trim()) setMessageErr("") }}
                rows={7}
                aria-required="true"
                aria-describedby={messageErr ? "message-error" : undefined}
                aria-invalid={Boolean(messageErr)}
                className={`${inputClass} resize-none ${messageErr ? "border-[rgba(240,100,120,0.6)]" : ""}`}
              />
              <span id="contact-msg-hint" className="font-body text-xs text-[#8474a0] mt-1 block" aria-live="polite">
                {message.trim() === "" ? "a message is required to send" : ""}
              </span>
              {messageErr && <p id="message-error" role="alert" className="mt-3 text-sm text-[#f0a0b0]">{messageErr}</p>}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <input
                type="checkbox"
                id="contact-subscribe"
                checked={subscribe}
                onChange={(e) => setSubscribe(e.target.checked)}
                className="w-4 h-4 rounded border-[#b896d1]/30 bg-transparent text-[#b896d1] focus:ring-[#b896d1] focus:ring-offset-0 cursor-pointer accent-[#b896d1]"
              />
              <label htmlFor="contact-subscribe" className="font-body text-sm text-[#9080aa] cursor-pointer">
                Also send me a quiet note when you publish new stories
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 flex-wrap gap-4">
              <p className="font-body text-xs text-[#6a6078] italic">
                {message.length > 0 ? `${message.length} characters` : ""}
              </p>
              <button
                type="submit"
                disabled={sending}
                className={`font-body text-sm text-[#120e1f] bg-[#b896d1] hover:bg-[#d6bdf0] transition-colors px-10 py-3.5 rounded-full min-h-[44px] disabled:opacity-50 ${focusRing}`}
              >
                {sending ? "sending…" : "send it"}
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className="border-t border-[rgba(184,150,209,0.08)] py-10 px-6 ">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-[#8474a0]">
          <span className="font-cursive text-[#b896d1] text-base">
            subroverse
          </span>
          <p className="font-body">
            written in the late nights · {new Date().getFullYear()}
          </p>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            opacity="0.4"
          >
            {[0, 72, 144, 216, 288].map((a, i) => {
              const [x, y] = radialPoint(a, 9, 9, 5)
              return (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx="2"
                  ry="3.5"
                  transform={`rotate(${a + 90},${x},${y})`}
                  fill="#c49ce6"
                />
              )
            })}
            <circle cx="9" cy="9" r="1.5" fill="#fde8b0" />
          </svg>
        </div>
      </footer>
    </div>
  )
}

/* ════════════════════════
   STORIES ARCHIVE PAGE
   ════════════════════════ */
function StoriesArchivePage({
  allStories,
  onNavigate,
  onOpenStory,
  onBrand,
  seriesFilter,
  seriesMetadata = [],
}: {
  allStories: Story[]
  onNavigate: (p: Page, skipAnimation?: boolean) => void
  onOpenStory: (s: Story) => void
  onBrand: () => void
  seriesFilter?: string
  seriesMetadata?: Array<{ name: string; description: string }>
}) {
  const reduced = useReducedMotion()

  const filtered = seriesFilter
    ? allStories.filter(s => s.series === seriesFilter)
    : allStories

  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.date).getTime()
    const db = new Date(b.date).getTime()
    if (isNaN(da) && isNaN(db)) return 0
    if (isNaN(da)) return 1
    if (isNaN(db)) return -1
    return db - da
  })

  return (
    <div
      className="min-h-screen text-[#f0ebf5] overflow-x-hidden"
      style={{ animation: reduced ? "none" : "fadeUp 0.6s ease-out forwards" }}
    >
      <Nav page="stories" onNavigate={onNavigate} onBrand={onBrand} />

      <main className="max-w-3xl mx-auto px-6 pt-14 pb-32">
        <div className="mb-4">
          <button
            onClick={() => seriesFilter ? onNavigate("series-index", true) : onNavigate("home")}
            className={`font-body text-xs text-[#9080aa] hover:text-[#b896d1] transition-colors tracking-widest uppercase min-h-[44px] inline-flex items-center ${focusRing}`}
          >
            ← back to {seriesFilter ? "series" : "home"}
          </button>
        </div>

        <div className="mb-10">
          <p className="font-cursive text-[#b896d1] text-base opacity-70 mb-2">
            {seriesFilter ? "collection" : "every word written"}
          </p>
          <h1 className="font-display font-light italic text-4xl md:text-5xl text-[#f0ebf5] leading-tight">
            {seriesFilter ? seriesFilter : "All stories"}
          </h1>
          
          {seriesFilter && (
            <p className="font-body text-base md:text-lg text-[#f0ebf5] mt-4 mb-2 italic opacity-90 leading-relaxed max-w-2xl">
              {seriesMetadata.find(m => m.name === seriesFilter)?.description || "Every piece written in this collection"}
            </p>
          )}

          <p className="font-body text-sm text-[#8474a0] mt-3">
            {sorted.length} {sorted.length === 1 ? "piece" : "pieces"} · newest first
          </p>
        </div>

        <FloralDivider />

        <div>
          {sorted.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onClick={() => onOpenStory(story)}
            />
          ))}
        </div>

        <FloralDivider />
        <p className="font-cursive text-center text-[#b896d1] text-xl opacity-40">
          — written with love
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}

/* ════════════════════════
   SERIES INDEX PAGE
   ════════════════════════ */
function SeriesIndexPage({
  allStories,
  onNavigate,
  onBrand,
}: {
  allStories: Story[]
  onNavigate: (p: Page) => void
  onBrand: () => void
}) {
  const reduced = useReducedMotion()

  // Group stories by series
  const seriesMap = new Map<string, { count: number, latestDate: Date, name: string, slug: string }>()
  for (const s of allStories) {
    if (s.series && s.seriesSlug) {
      const existing = seriesMap.get(s.series.toLowerCase())
      const date = new Date(s.date)
      if (!existing) {
        seriesMap.set(s.series.toLowerCase(), {
          count: 1,
          latestDate: date,
          name: s.series,
          slug: s.seriesSlug
        })
      } else {
        existing.count++
        if (date > existing.latestDate) {
          existing.latestDate = date
        }
        if (s.seriesSlug) {
          existing.slug = s.seriesSlug
        }
      }
    }
  }

  // Sort series by most recently updated
  const sortedSeries = Array.from(seriesMap.values()).sort((a, b) => {
    return b.latestDate.getTime() - a.latestDate.getTime()
  })

  return (
    <div
      className="min-h-screen text-[#f0ebf5] overflow-x-hidden"
      style={{ animation: reduced ? "none" : "fadeUp 0.6s ease-out forwards" }}
    >
      <Nav page="stories" onNavigate={onNavigate} onBrand={onBrand} />

      <main className="max-w-3xl mx-auto px-6 pt-14 pb-32">
        <div className="mb-4">
          <button
            onClick={() => onNavigate("home")}
            className={`font-body text-xs text-[#9080aa] hover:text-[#b896d1] transition-colors tracking-widest uppercase min-h-[44px] inline-flex items-center ${focusRing}`}
          >
            ← back to home
          </button>
        </div>

        <div className="mb-10">
          <p className="font-cursive text-[#b896d1] text-base opacity-70 mb-2">collections</p>
          <h1 className="font-display font-light italic text-4xl md:text-5xl text-[#f0ebf5] leading-tight">
            Browse by series
          </h1>
          <p className="font-body text-sm text-[#8474a0] mt-3">
            {sortedSeries.length} {sortedSeries.length === 1 ? "series" : "series"}
          </p>
        </div>

        <FloralDivider />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 mb-12">
          {sortedSeries.map((series) => {
            return (
              <a
                key={series.name}
                href={`/series/${series.slug}`}
                onClick={(e) => {
                  e.preventDefault()
                  window.history.pushState(null, "", `/series/${series.slug}`)
                  window.dispatchEvent(new Event('popstate'))
                }}
                className={`group block bg-[#1a1528] border border-[rgba(184,150,209,0.13)] hover:border-[rgba(184,150,209,0.35)] rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(184,150,209,0.07)] relative overflow-hidden ${focusRing}`}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[rgba(184,150,209,0.03)] to-transparent pointer-events-none" />
                <h2 className="font-display italic text-2xl text-[#f0ebf5] mb-2">{series.name}</h2>
                <p className="font-body text-sm text-[#8474a0]">
                  {series.count} {series.count === 1 ? "story" : "stories"}
                </p>
                <p className="font-body text-xs text-[#b896d1] mt-6 uppercase tracking-widest group-hover:text-[#f0ebf5] transition-colors">
                  Read collection →
                </p>
              </a>
            )
          })}
        </div>

        <FloralDivider />
        <p className="font-cursive text-center text-[#b896d1] text-xl opacity-40">
          — written with love
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}

/* ════════════════════════
   APP — hash-based routing
   ════════════════════════ */
function parseLocation(allStories: Story[]): { page: Page; storyId: Story["id"] | null; seriesName?: string } {
  if (typeof window === "undefined") return { page: "home", storyId: null }
  const h = window.location.hash
  const p = window.location.pathname
  if (h === "#admin" || p === "/admin") {
    if (h === "#admin") window.location.replace("/admin")
    return { page: "home", storyId: null }
  }
  if (p === "/about" || h === "#about") return { page: "about", storyId: null }
  if (p === "/write" || h === "#write") return { page: "write", storyId: null }
  if (p === "/stories" || h === "#stories") return { page: "stories", storyId: null }
  if (p === "/series" || h === "#series") return { page: "series-index", storyId: null }

  // Match /series/:slug
  const seriesMatch = p.match(/^\/series\/(.+)$/)
  if (seriesMatch) {
    const slug = seriesMatch[1]
    const decodedSlug = decodeURIComponent(slug).replace(/-/g, " ")
    // Try to find the exact capitalization from stories, otherwise use title case
    const story = allStories.find(s =>
      (s.seriesSlug && s.seriesSlug.toLowerCase() === slug.toLowerCase()) ||
      (s.series && s.series.toLowerCase() === decodedSlug.toLowerCase())
    )
    const seriesName = story?.series ?? decodedSlug.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    return { page: "series", storyId: null, seriesName }
  }
  // Match /stories/:slug
  const storyMatch = p.match(/^\/stories\/(.+)$/)
  if (storyMatch) {
    const slug = decodeURIComponent(storyMatch[1])
    const story = allStories.find((item) => item.slug === slug)
    return { page: "home", storyId: story?.id ?? null }
  }
  // Legacy: /#story/UUID
  if (h.startsWith("#story/")) {
    const id = decodeURIComponent(h.slice(7))
    const story = allStories.find((item) => String(item.id) === id)
    if (story?.slug) {
      window.history.replaceState(null, "", `/stories/${story.slug}`)
    }
    return { page: "home", storyId: story?.id ?? id }
  }
  return { page: "home", storyId: null }
}

export default function App({
  settings,
  initialStories,
  initialPage = "home",
  initialSeries = null,
  seriesMetadata = [],
}: {
  settings: PublicSiteSettings
  initialStories?: PublicStory[]
  initialPage?: string
  initialSeries?: string | null
  seriesMetadata?: Array<{ name: string; description: string }>
}) {
  const reduced = useReducedMotion()
  const [page, setPage] = useState<Page>(initialPage as Page)
  const [currentSeries, setCurrentSeries] = useState<string | null>(initialSeries)
  const [allStories, setAllStories] = useState<Story[]>(initialStories ?? [])
  const [feedStatus, setFeedStatus] = useState<"loading" | "ready" | "error">(
    initialStories === undefined ? "loading" : "ready",
  )
  const [feedAttempt, setFeedAttempt] = useState(0)
  useEffect(() => {
    if (initialStories !== undefined && feedAttempt === 0) return
    let cancelled = false
    setFeedStatus("loading")
    loadStoryFeed()
      .then((data) => {
        if (!cancelled) { setAllStories(data); setFeedStatus("ready") }
      })
      .catch(() => { if (!cancelled) setFeedStatus("error") })
    return () => { cancelled = true }
  }, [feedAttempt, initialStories])

  const [activeStoryId, setActiveStoryId] = useState<Story["id"] | null>(null)

  useEffect(() => {
    const handleLocationChange = () => {
      const loc = parseLocation(allStories)
      setPage(loc.page)
      setActiveStoryId(loc.storyId)
      if (loc.seriesName) {
        setCurrentSeries(loc.seriesName)
      }
    }
    handleLocationChange()
    window.addEventListener("popstate", handleLocationChange)
    return () => window.removeEventListener("popstate", handleLocationChange)
  }, [allStories])

  const [introVisible, setIntroVisible] = useState(() => shouldShowEntryIntro(""))
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const [introKey, setIntroKey] = useState(0)
  // "full" on first mount from outside; internal navigations start with "compact"
  const [introMode, setIntroMode] = useState<"full" | "compact">("full")
  
  useEffect(() => {
    // If the user came from another page on our site, or they've already visited in this session, skip the full intro.
    if (document.referrer.startsWith(window.location.origin) || sessionStorage.getItem("subroverse_visited")) {
      setIntroMode("compact")
    }
    sessionStorage.setItem("subroverse_visited", "1")
  }, [])
  const replayingRef = useRef(false)
  const pendingDestRef = useRef<Destination | null>(null)

  const activeStory = activeStoryId != null ? allStories.find(s => String(s.id) === String(activeStoryId)) ?? null : null

  useEffect(() => {
    let tag = document.querySelector<HTMLMetaElement>('meta[name="robots"][data-admin]')
    if (page === "admin") {
      if (!tag) {
        tag = document.createElement("meta")
        tag.name = "robots"
        tag.content = "noindex, nofollow"
        tag.dataset.admin = "1"
        document.head.appendChild(tag)
      }
    } else {
      tag?.remove()
    }
  }, [page])

  const PAGE_HASH: Record<Page, string> = {
    home: "/", about: "/about", write: "/write", admin: "/admin", stories: "/stories", series: "/stories", "series-index": "/series"
  }

  // Story reading is immediate; main-page navigation keeps the compact envelope.
  const navigateWithWelcome = useCallback((dest: Destination) => {
    if (replayingRef.current) return
    if (dest.type === "story") {
      setIntroMode("compact")
      setActiveStoryId(dest.story.id)
      const storyUrl = dest.story.slug ? `/stories/${dest.story.slug}` : `/stories/${encodeURIComponent(String(dest.story.id))}`
      window.history.pushState(null, "", storyUrl)
      window.scrollTo(0, 0)
      return
    }
    replayingRef.current = true
    pendingDestRef.current = dest
    setIntroMode("compact")
    setIntroKey(k => k + 1)
    setIntroVisible(true)
  }, [])

  // Called by Intro onDone — applies the stored destination then hides the overlay.
  const handleIntroDone = useCallback(() => {
    const dest = pendingDestRef.current
    pendingDestRef.current = null

    // Initial entry preserves direct About, archive, and story links.
    if (!dest) {
      setIntroVisible(false)
      replayingRef.current = false
      return
    }

    if (dest?.type === "story") {
      setActiveStoryId(dest.story.id)
      const storyUrl = dest.story.slug ? `/stories/${dest.story.slug}` : `/stories/${encodeURIComponent(String(dest.story.id))}`
      window.history.pushState(null, "", storyUrl)
    } else {
      const p = dest?.type === "page" ? dest.page : "home"
      if (p === "admin") {
        window.location.assign("/admin")
        return
      }
      setActiveStoryId(null)
      setPage(p)
      let url = PAGE_HASH[p]
      if (p === "series" && currentSeries) {
        const story = allStories.find(s => s.series === currentSeries && s.seriesSlug)
        if (story?.seriesSlug) {
          url = `/series/${story.seriesSlug}`
        }
      }
      window.history.pushState(null, "", url)
    }

    window.scrollTo(0, 0)
    setIntroVisible(false)
    replayingRef.current = false
  }, [allStories, currentSeries])

  // Convenience wrappers
  const navigate = useCallback((p: Page, skipAnimation?: boolean) => {
    if (skipAnimation) {
      setActiveStoryId(null)
      setPage(p)
      let url = PAGE_HASH[p]
      if (p === "series" && currentSeries) {
        const story = allStories.find(s => s.series === currentSeries && s.seriesSlug)
        if (story?.seriesSlug) {
          url = `/series/${story.seriesSlug}`
        }
      }
      window.history.pushState(null, "", url)
      window.scrollTo(0, 0)
    } else {
      navigateWithWelcome({ type: "page", page: p })
    }
  }, [navigateWithWelcome, allStories, currentSeries])
  const openStory = useCallback((story: Story) => navigateWithWelcome({ type: "story", story }), [navigateWithWelcome])
  const closeStory = useCallback(() => navigateWithWelcome({ type: "page", page }), [navigateWithWelcome, page])
  const replayWelcomeAndGoHome = useCallback(() => navigateWithWelcome({ type: "page", page: "home" }), [navigateWithWelcome])

  // Compute the current page's content (rendered underneath the intro overlay)
  let pageContent: React.ReactNode
  if (activeStory) {
    pageContent = (
      <StoryView
        story={activeStory}
        allStories={allStories}
        onBack={closeStory}
        onNavigate={navigate}
        onOpenStory={openStory}
        onBrand={replayWelcomeAndGoHome}
        isSeriesContext={page === "series"}
      />
    )
  } else if (page === "about") {
    pageContent = <AboutPage onNavigate={navigate} onBrand={replayWelcomeAndGoHome} settings={settings} />
  } else if (page === "write") {
    pageContent = <WriteToMePage onNavigate={navigate} onBrand={replayWelcomeAndGoHome} />
  } else if (page === "stories") {
    pageContent = (
      <StoriesArchivePage
        allStories={allStories}
        onNavigate={navigate}
        onOpenStory={openStory}
        onBrand={replayWelcomeAndGoHome}
        seriesMetadata={seriesMetadata}
      />
    )
  } else if (page === "series") {
    pageContent = (
      <StoriesArchivePage
        allStories={allStories}
        onNavigate={navigate}
        onOpenStory={openStory}
        onBrand={replayWelcomeAndGoHome}
        seriesFilter={currentSeries ?? undefined}
        seriesMetadata={seriesMetadata}
      />
    )
  } else if (page === "series-index") {
    pageContent = (
      <SeriesIndexPage
        allStories={allStories}
        onNavigate={navigate}
        onBrand={replayWelcomeAndGoHome}
      />
    )
  } else if (page === "admin") {
    pageContent = <main className="min-h-screen grid place-items-center"><a href="/admin" className="text-[#b896d1]">Open the writer’s room →</a></main>
  } else {
    pageContent = (
      <div className="min-h-screen text-[#f0ebf5] overflow-x-hidden">
        <Nav page="home" onNavigate={navigate} onBrand={replayWelcomeAndGoHome} />

        {/* ── HERO ── */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-24 relative">
          <p className="font-cursive text-[#b896d1] text-base mb-5 opacity-70">
            {settings.homeEyebrow}
          </p>
          <h1
            className="hero-wordmark font-display italic text-[#f0ebf5] leading-[0.92] mb-8"
            style={{ fontSize: "clamp(2.8rem, 10vw, 6rem)" }}
          >
            SubroVerse,
            <br />
            <em className="text-[#b896d1] whitespace-nowrap">a storyverse by</em>
            <br />
            Subraaaaaaajit
          </h1>
          <p className="font-body text-[#9080aa] leading-relaxed text-base max-w-md">
            {settings.homeIntroduction}
          </p>
        </section>

        {/* ── FEATURED ── */}
        {allStories[0] && <section className="max-w-3xl mx-auto px-6 pb-8">
          <a
            href={allStories[0].slug ? `/stories/${allStories[0].slug}` : `/stories/${encodeURIComponent(String(allStories[0].id))}`}
            onClick={(event) => {
              event.preventDefault()
              openStory(allStories[0])
            }}
            aria-label={`Read featured story: ${allStories[0].title}`}
            className={`group block w-full text-left bg-[#1a1528] border border-[rgba(184,150,209,0.13)] hover:border-[rgba(184,150,209,0.35)] rounded-2xl p-8 md:p-12 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(184,150,209,0.07)] relative overflow-hidden ${focusRing}`}
            style={{ animation: reduced ? "none" : undefined }}
          >
            <svg
              className="absolute top-5 right-6 pointer-events-none opacity-20"
              width="48" height="48" viewBox="0 0 48 48"
              aria-hidden="true"
            >
              {[0, 72, 144, 216, 288].map((a, i) => {
                const [x, y] = radialPoint(a, 24, 24, 14)
                return (
                  <ellipse key={i}
                    cx={x} cy={y}
                    rx="5" ry="9"
                    transform={`rotate(${a + 90},${x},${y})`}
                    fill="#c49ce6"
                  />
                )
              })}
              <circle cx="24" cy="24" r="3" fill="#fde8b0" />
            </svg>
            <span className="font-cursive text-[#b896d1] text-sm opacity-60 mb-3 block">latest</span>
            <h2 className="font-display font-light italic text-3xl md:text-4xl text-[#f0ebf5] leading-tight mb-5 group-hover:text-[#d6bdf0] transition-colors max-w-lg">
              {allStories[0].title}
            </h2>
            <p className="font-body text-sm text-[#9080aa] leading-relaxed max-w-lg mb-8">
              {allStories[0].excerpt}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-[#8474a0]">
                {allStories[0].date} · {allStories[0].readTime} read
              </span>
              <span
                className="font-body text-sm text-[#b896d1] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                aria-hidden="true"
              >
                read the story →
              </span>
            </div>
          </a>
        </section>}

        {/* ── ALL STORIES (homepage preview) ── */}
        <section className="max-w-3xl mx-auto px-6 py-16" aria-label="Recent stories">
          <FloralDivider />
          <div className="mb-10">
            <p className="font-cursive text-[#b896d1] text-sm opacity-60 mb-1">everything written</p>
            <h2 className="font-display font-light italic text-3xl text-[#f0ebf5]">All stories</h2>
          </div>
          {allStories.slice(1, 4).map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onClick={() => openStory(story)}
            />
          ))}
          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/stories"
              onClick={(event) => { event.preventDefault(); navigate("stories") }}
              className={`font-body text-sm text-[#b896d1] border border-[rgba(184,150,209,0.28)] hover:border-[rgba(184,150,209,0.6)] hover:bg-[rgba(184,150,209,0.06)] transition-all duration-300 px-8 py-3 rounded-full min-h-[44px] tracking-wide ${focusRing}`}
            >
              View more stories →
            </a>
            <a
              href="/series"
              onClick={(event) => { event.preventDefault(); navigate("series-index") }}
              className={`font-body text-sm text-[#b896d1] border border-[rgba(184,150,209,0.28)] hover:border-[rgba(184,150,209,0.6)] hover:bg-[rgba(184,150,209,0.06)] transition-all duration-300 px-8 py-3 rounded-full min-h-[44px] tracking-wide ${focusRing}`}
            >
              Browse by series →
            </a>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-[rgba(184,150,209,0.08)] py-10 px-6 mt-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-[#8474a0]">
            <span className="font-cursive text-[#b896d1] text-base">subroverse</span>
            <p className="font-body">written in the small hours · {new Date().getFullYear()}</p>
            <FooterFlower />
          </div>
        </footer>
      </div>
    )
  }

  return (
    <>
      <PublicAnalytics location={activeStoryId !== null && !activeStory ? null : publicAnalyticsLocation(page, activeStory)} />
      <div inert={mounted && introVisible ? true : undefined} aria-hidden={mounted && introVisible ? "true" : undefined}>
        {["home", "stories", "series", "series-index"].includes(page) && !activeStory && (feedStatus !== "ready" || allStories.length === 0) && (
          <div role={feedStatus === "error" ? "alert" : "status"} className="mx-auto mt-8 max-w-3xl rounded-xl border border-[#b896d1]/20 bg-[#151120] px-6 py-4 text-sm text-[#c7afd9]">
            {feedStatus === "loading" ? "Gathering the stories…" : feedStatus === "error" ? "Stories could not be loaded. Your connection or the story service may be unavailable." : "No stories published yet. Come back soon for the first piece."}
            {feedStatus === "error" && <button onClick={() => setFeedAttempt((value) => value + 1)} className="ml-4 rounded-full border border-[#b896d1]/40 px-4 py-2">Try again</button>}
          </div>
        )}
        {pageContent}
      </div>
      <NewsletterGate settings={settings} ready={!introVisible && introMode === "full" && activeStoryId === null} />
      {introVisible && <EnvelopeIntro key={introKey} onDone={handleIntroDone} mode={introMode} />}
    </>
  )
}
