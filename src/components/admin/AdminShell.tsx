"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import AdminSignOut from "./AdminSignOut"

const navigation = [
  ["Overview", "⌘", "/admin"],
  ["Stories", "✎", "/admin/stories"],
  ["Series", "📚", "/admin/series"],
  ["Media", "◫", "/admin/media"],
  ["Messages", "☷", "/admin/messages"],
  ["Newsletter", "✉", "/admin/newsletter"],
  ["Audience", "◎", "/admin/audience"],
  ["Analytics", "⌁", "/admin/analytics"],
  ["Settings", "⚙", "/admin/settings"],
] as const

export default function AdminShell({ children, connected }: { children: ReactNode; connected: boolean }) {
  const pathname = usePathname()
  if (pathname === "/admin/reset-password") return children

  return (
    <div className="min-h-screen text-[#f0ebf5] md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 self-start border-b border-white/5 bg-[#120e1f] px-5 py-4 md:flex md:h-dvh md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:px-6 md:py-8">
        <div className="flex items-center justify-between gap-3 md:flex-col md:items-start">
          <Link href="/" className="font-cursive text-2xl text-[#b896d1]">subroverse</Link>
          <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${connected ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>
            {connected ? "database configured" : "setup mode"}
          </span>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto md:mt-8 md:block md:space-y-1" aria-label="Studio navigation">
          {navigation.map(([label, icon, href]) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`))
            return (
              <Link href={href} key={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#b896d1] ${active ? "bg-[#b896d1]/12 text-[#d6bdf0]" : "text-[#a99bb9] hover:bg-white/[.035] hover:text-[#cfc4dc]"}`}>
                <span aria-hidden="true" className="w-5 text-center text-[#b896d1]">{icon}</span>{label}
              </Link>
            )
          })}
        </nav>
        <div className="md:mt-auto md:pt-8"><AdminSignOut /></div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
