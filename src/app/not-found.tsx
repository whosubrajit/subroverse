import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="font-cursive text-[#b896d1] text-lg mb-6 opacity-70">
        lost in the quiet
      </p>
      <h1 className="font-display italic text-5xl md:text-7xl text-[#f0ebf5] font-light mb-8">
        This page does not exist
      </h1>
      <p className="font-body text-[#9080aa] text-sm leading-relaxed max-w-md mb-12">
        Perhaps it was a word that was never written, or a story that hasn&apos;t
        found its shape yet. Either way, there is nothing here — only the quiet.
      </p>
      <Link
        href="/"
        className="font-body text-sm text-[#120e1f] bg-[#b896d1] hover:bg-[#d6bdf0] transition-colors px-8 py-3 rounded-full"
      >
        return home
      </Link>
    </div>
  )
}
