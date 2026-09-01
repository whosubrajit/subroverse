export type IntroMode = "full" | "compact"

export function shouldShowEntryIntro(hash: string) {
  if (hash.startsWith("#story/")) return false
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/stories/")) return false
  return true
}

export function introDuration(mode: IntroMode, reducedMotion = false) {
  if (reducedMotion) return 150
  return mode === "full" ? 4000 : 1000
}
