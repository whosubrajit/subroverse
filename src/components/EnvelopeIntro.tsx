"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import { introDuration, type IntroMode } from "@/lib/intro-timing"
import "./EnvelopeIntro.css"

export default function EnvelopeIntro({
  mode,
  onDone,
}: {
  mode: IntroMode
  onDone: () => void
}) {
  const doneRef = useRef(onDone)
  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    const timer = window.setTimeout(
      () => doneRef.current(),
      introDuration(mode, reduced),
    )
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = previousOverflow
    }
  }, [mode])

  return (
    <div
      className={`envelope-intro se-playing ${mode === "compact" ? "se-flip-only" : ""
        }`}
      style={{ "--se-duration": `${introDuration(mode)}ms` } as CSSProperties}
      role="status"
      aria-label={
        mode === "full" ? "Welcome to SubroVerse" : "Opening your next page"
      }
      data-mode={mode}
      data-duration={introDuration(mode)}
    >
      <div className="se-stage" aria-hidden="true">
        <div className="se-aura" aria-hidden="true"></div>
        <div className="se-scene" aria-hidden="true">
          <div className="se-envelope">
            <div className="se-front">
              <div className="se-postmark">
                <svg viewBox="0 0 100 60">
                  <circle cx="31" cy="30" r="22" />
                  <circle cx="31" cy="30" r="17" />
                  <path d="M54 19q12-7 25 0t19 0M54 28q12-7 25 0t19 0M54 37q12-7 25 0t19 0" />
                </svg>
              </div>
              <div className="se-stamp">
                <svg viewBox="0 0 32 40">
                  <path d="M16 32V14m0 11c-10 0-10-9-10-9 9 0 10 6 10 9Zm0-4c10 0 10-9 10-9-9 0-10 6-10 9Z" />
                  <path d="M16 15c-12-2-11-12-5-10 0-6 10-6 10 0 6-2 7 8-5 10Z" />
                </svg>
              </div>
              <span className="se-to">a letter for you</span>
              <span className="se-address">someone who couldn&apos;t stay quiet</span>
              <span className="se-front-note">written in the small hours</span>
            </div>
            <div className="se-back">
              <div className="se-inner"></div>
              <div className="se-flap">
                <svg viewBox="0 0 320 155" preserveAspectRatio="none">
                  <path d="M0 0H320L176 140Q160 155 144 140Z" />
                </svg>
              </div>
              <div className="se-letter">
                <div className="se-paper"></div>
                <div className="se-letter-text">
                  <span className="se-welcome">You have wandered into</span>
                  <span className="se-title">SubroVerse</span>
                  <span className="se-signature">
                    a love letter that never learned to stop
                  </span>
                </div>
              </div>
              <svg className="se-folds" viewBox="0 0 320 210" preserveAspectRatio="none">
                <path fill="#e99caf" d="M0 0 173 112 0 210Z" />
                <path fill="#e6a0b3" d="M320 0 147 112 320 210Z" />
                <path fill="#f1b2c3" d="M0 210V198L144 94Q160 82 176 94L320 198V210Z" />
                <path d="m0 198 144-104q16-12 32 0l144 104" fill="none" stroke="#d38ca2" strokeOpacity=".5" />
              </svg>
            </div>
          </div>
        </div>
        <div className="se-final" aria-hidden="true">
          <span className="se-welcome">You have wandered into</span>
          <span className="se-title">SubroVerse</span>
          <span className="se-signature">a love letter that never learned to stop</span>
        </div>
      </div>
    </div>
  )
}
