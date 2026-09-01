import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SubroVerse collects, uses, stores, and protects reader information.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
}

const sections = [
  {
    title: "Information you choose to provide",
    paragraphs: [
      "If you join the mailing list, SubroVerse stores your email address, signup source, consent and confirmation times, subscription preferences, status, and notification history. The address is used only for SubroVerse writing updates and related occasional letters you have chosen to receive.",
      "If you use Write to Me, SubroVerse stores your message and any name or email address you voluntarily include.",
    ],
  },

  {
    title: "Retention and your choices",
    paragraphs: [
      "Active subscriber records are kept while you remain subscribed. A minimal unsubscribed record may be retained to honor your opt-out and prevent accidental re-subscription. Contact messages are retained for correspondence and site administration until they are no longer needed or are manually removed.",
      "Every mailing can include a link to the unsubscribe page. Entering the address that received the email marks it as unsubscribed and excludes it from future audience exports. You may also request access, correction, or deletion of information you provided by contacting SubroVerse through the Write to Me page.",
    ],
  },
  {
    title: "If you're still reading this",
    paragraphs: [
      "Shabbash, you're very aware of your thing. I appreciate that. And no, I haven't hidden any easter eggs for you to find.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-[#f0ebf5]">
      <nav className="border-b border-[rgba(184,150,209,.08)] px-6 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="font-cursive text-xl text-[#b896d1]">subroverse</Link>
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/about" className="font-body text-xs tracking-widest uppercase text-[#9080aa] hover:text-[#b896d1] transition-colors">about</Link>
            <Link href="/stories" className="font-body text-xs tracking-widest uppercase text-[#9080aa] hover:text-[#b896d1] transition-colors">stories</Link>
            <Link href="/write" className="font-body text-xs tracking-widest uppercase text-[#9080aa] hover:text-[#b896d1] transition-colors">write to me</Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-2xl px-6 pb-32 pt-14">
        <p className="font-cursive text-lg text-[#b896d1]">the quiet details</p>
        <h1 className="font-display mt-3 text-5xl font-light italic leading-tight md:text-6xl">Privacy Policy</h1>
        <p className="font-body mt-6 text-sm leading-7 text-[#9080aa]">
          This policy explains what SubroVerse collects when you read, subscribe, or write—and what it does not collect.
        </p>
        <p className="font-body mt-3 text-xs text-[#6f627e]">Last updated September 1, 2026</p>

        <div className="mt-16 space-y-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-light italic text-[#d6bdf0]">{section.title}</h2>
              <div className="font-body mt-4 space-y-4 text-sm leading-7 text-[#9e90af]">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-14 border-t border-[rgba(184,150,209,.1)] pt-10">
          <h2 className="font-display text-2xl font-light italic text-[#d6bdf0]">Contact</h2>
          <p className="font-body mt-4 text-sm leading-7 text-[#9e90af]">
            For a privacy question or request, use the <Link href="/write" className="text-[#b896d1] underline decoration-white/20 underline-offset-4 hover:text-[#d6bdf0] transition-colors">Write to Me</Link> form and include an email address so a response is possible.
          </p>
          <div className="text-center mt-16 pt-10 border-t border-[rgba(184,150,209,.1)]">
            <Link href="/" className="inline-flex min-h-11 items-center text-xs uppercase tracking-[.18em] text-[#8474a0] hover:text-[#b896d1] transition-colors">back to home</Link>
          </div>
        </section>
      </main>
    </div>
  )
}
