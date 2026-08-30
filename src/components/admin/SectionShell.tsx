import Link from "next/link"
import type { ReactNode } from "react"

export default function SectionShell({ eyebrow, title, description, action, children }: { eyebrow: string; title: string; description: string; action?: ReactNode; children: ReactNode }) {
  return (
    <main className="min-h-screen px-5 py-8 text-[#f0ebf5] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-xs text-[#827491] hover:text-[#b896d1]">← Writer’s room</Link>
        <header className="my-7 flex flex-col gap-5 border-b border-white/[.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-cursive text-lg text-[#b896d1]">{eyebrow}</p><h1 className="font-display text-5xl font-light italic">{title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#74667f]">{description}</p></div>{action}
        </header>
        {children}
      </div>
    </main>
  )
}
