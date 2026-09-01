import type { Metadata } from "next"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Leave the SubroVerse mailing list.",
  robots: { index: false, follow: false },
}

type UnsubscribePageProps = {
  searchParams: Promise<{ status?: string | string[] }>
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const query = await searchParams
  const status = typeof query.status === "string" ? query.status : ""

  return (
    <div className="min-h-screen text-[#f0ebf5]">
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-20">
        <section className="w-full rounded-[28px] border border-white/10 bg-[#171224] px-7 py-12 text-center md:px-12">
          <p className="font-cursive text-lg text-[#b896d1]">a quieter inbox</p>
          {status === "success" ? (
            <>
              <h1 className="font-display mt-4 text-4xl font-light italic">Your request is complete.</h1>
              <p className="font-body mt-5 text-sm leading-7 text-[#9e90af]">If that address was on the SubroVerse list, it has been unsubscribed and will be excluded from future mailings.</p>
            </>
          ) : (
            <>
              <h1 className="font-display mt-4 text-4xl font-light italic">Leave the mailing list?</h1>
              <p className="font-body mt-5 text-sm leading-7 text-[#9e90af]">Enter the address that received the email. It will be removed from future SubroVerse mailings.</p>
              <form action="/api/unsubscribe" method="post" className="mt-8 text-left">
                <label htmlFor="unsubscribe-email" className="font-body block text-xs uppercase tracking-[.16em] text-[#a99bb9]">Email address</label>
                <input
                  id="unsubscribe-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  maxLength={320}
                  className="font-body mt-3 min-h-12 w-full rounded-full border border-white/10 bg-white/[.04] px-5 text-sm text-[#f0ebf5] outline-none transition-colors placeholder:text-[#6f627e] focus:border-[#b896d1]"
                  placeholder="you@example.com"
                />
                <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="unsubscribe-company">Company</label>
                  <input id="unsubscribe-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                {status === "invalid" ? <p role="alert" className="mt-3 text-center text-xs text-rose-200">Enter a valid email address.</p> : null}
                <button type="submit" className="font-body mt-5 min-h-12 w-full rounded-full bg-[#b896d1] px-8 text-sm text-[#120e1f] transition-colors hover:bg-[#d6bdf0]">
                  Unsubscribe me
                </button>
              </form>
            </>
          )}
          <Link href="/" className="font-body mt-9 inline-flex min-h-11 items-center text-xs uppercase tracking-[.18em] text-[#8474a0] hover:text-[#b896d1]">return to SubroVerse</Link>
        </section>
      </main>
    </div>
  )
}
