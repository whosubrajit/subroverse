import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react"
import "./ProfileCard.css"

type ProfileCardProps = {
  avatarUrl: string
  iconUrl?: string
  grainUrl?: string
  innerGradient?: string
  behindGlowEnabled?: boolean
  behindGlowColor?: string
  behindGlowSize?: string
  className?: string
  enableTilt?: boolean
  enableMobileTilt?: boolean
  mobileTiltSensitivity?: number
  miniAvatarUrl?: string
  name?: string
  title?: string
  handle?: string
  contactText?: string
  showUserInfo?: boolean
  onContactClick?: () => void
}

type CardVars = CSSProperties & Record<`--${string}`, string | number>

type TiltEngine = {
  setImmediate: (x: number, y: number) => void
  setTarget: (x: number, y: number) => void
  toCenter: () => void
  beginInitial: (durationMs: number) => void
  cancel: () => void
}

const DEFAULT_INNER_GRADIENT =
  "linear-gradient(145deg, rgba(96,73,110,.55) 0%, rgba(113,196,255,.18) 100%)"

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max)

const round = (value: number, precision = 3) =>
  Number.parseFloat(value.toFixed(precision))

const adjust = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
) => round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin))

function ProfileCardComponent({
  avatarUrl,
  iconUrl,
  grainUrl,
  innerGradient,
  behindGlowEnabled = true,
  behindGlowColor = "rgba(184, 150, 209, 0.58)",
  behindGlowSize = "55%",
  className = "",
  enableTilt = true,
  enableMobileTilt = false,
  miniAvatarUrl,
  name = "Subroooo",
  title = "Author",
  handle = "subra.lmao",
  contactText = "Contact Me",
  showUserInfo = true,
  onContactClick,
}: ProfileCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const enterTimerRef = useRef<number | null>(null)

  const tiltEngine = useMemo<TiltEngine | null>(() => {
    if (!enableTilt) return null

    let rafId: number | null = null
    let running = false
    let lastTs = 0
    let initialUntil = 0
    let currentX = 0
    let currentY = 0
    let targetX = 0
    let targetY = 0

    const setVarsFromXY = (x: number, y: number) => {
      const shell = shellRef.current
      const wrap = wrapRef.current
      if (!shell || !wrap) return

      const width = shell.clientWidth || 1
      const height = shell.clientHeight || 1
      const percentX = clamp((100 / width) * x)
      const percentY = clamp((100 / height) * y)
      const centerX = percentX - 50
      const centerY = percentY - 50

      const properties: Record<string, string> = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(Math.hypot(centerY, centerX) / 50, 0, 1)}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 6))}deg`,
        "--rotate-y": `${round(centerY / 5)}deg`,
      }

      Object.entries(properties).forEach(([key, value]) =>
        wrap.style.setProperty(key, value),
      )
    }

    const step = (timestamp: number) => {
      if (!running) return
      if (lastTs === 0) lastTs = timestamp
      const delta = (timestamp - lastTs) / 1000
      lastTs = timestamp
      const tau = timestamp < initialUntil ? 0.6 : 0.14
      const factor = 1 - Math.exp(-delta / tau)

      currentX += (targetX - currentX) * factor
      currentY += (targetY - currentY) * factor
      setVarsFromXY(currentX, currentY)

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(step)
      } else {
        running = false
        lastTs = 0
        rafId = null
      }
    }

    const start = () => {
      if (running) return
      running = true
      lastTs = 0
      rafId = requestAnimationFrame(step)
    }

    return {
      setImmediate(x, y) {
        currentX = x
        currentY = y
        targetX = x
        targetY = y
        setVarsFromXY(x, y)
      },
      setTarget(x, y) {
        targetX = x
        targetY = y
        start()
      },
      toCenter() {
        const shell = shellRef.current
        if (shell) this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2)
      },
      beginInitial(durationMs) {
        initialUntil = performance.now() + durationMs
        start()
      },
      cancel() {
        if (rafId !== null) cancelAnimationFrame(rafId)
        rafId = null
        running = false
        lastTs = 0
      },
    }
  }, [enableTilt])

  useEffect(() => {
    if (!tiltEngine || !shellRef.current) return
    const shell = shellRef.current
    tiltEngine.setImmediate(shell.clientWidth - 70, 60)
    tiltEngine.toCenter()
    tiltEngine.beginInitial(1200)
    return () => {
      if (enterTimerRef.current !== null) window.clearTimeout(enterTimerRef.current)
      tiltEngine.cancel()
    }
  }, [tiltEngine])

  const pointerPosition = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!tiltEngine) return
      event.currentTarget.classList.add("active", "entering")
      if (enterTimerRef.current !== null) window.clearTimeout(enterTimerRef.current)
      enterTimerRef.current = window.setTimeout(
        () => shellRef.current?.classList.remove("entering"),
        180,
      )
      const { x, y } = pointerPosition(event)
      tiltEngine.setTarget(x, y)
    },
    [tiltEngine],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!tiltEngine) return
      const { x, y } = pointerPosition(event)
      tiltEngine.setTarget(x, y)
    },
    [tiltEngine],
  )

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.currentTarget.classList.remove("active")
      tiltEngine?.toCenter()
    },
    [tiltEngine],
  )

  const cardStyle = useMemo<CardVars>(
    () => ({
      "--icon": iconUrl ? `url(${iconUrl})` : "none",
      "--grain": grainUrl ? `url(${grainUrl})` : "none",
      "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
      "--behind-glow-color": behindGlowColor,
      "--behind-glow-size": behindGlowSize,
    }),
    [iconUrl, grainUrl, innerGradient, behindGlowColor, behindGlowSize],
  )

  return (
    <div
      ref={wrapRef}
      className={`pc-card-wrapper ${className}`.trim()}
      style={cardStyle}
      data-mobile-tilt={enableMobileTilt ? "enabled" : "disabled"}
    >
      {behindGlowEnabled && <div className="pc-behind" aria-hidden="true" />}
      <div
        ref={shellRef}
        className="pc-card-shell"
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <section className="pc-card" aria-label={`${name}, ${title}`}>
          <div className="pc-inside">
            <div className="pc-shine" aria-hidden="true" />
            <div className="pc-glare" aria-hidden="true" />
            <div className="pc-avatar-content">
              <img className="pc-avatar" src={avatarUrl} alt={`${name} portrait`} />
              {showUserInfo && (
                <div className="pc-user-info">
                  <div className="pc-user-details">
                    <img
                      className="pc-mini-avatar"
                      src={miniAvatarUrl || avatarUrl}
                      alt=""
                      aria-hidden="true"
                    />
                    <div className="pc-user-text">
                      <span className="pc-handle">@{handle}</span>
                    </div>
                  </div>
                  <button
                    className="pc-contact-btn"
                    onClick={(event) => {
                      event.stopPropagation()
                      onContactClick?.()
                    }}
                    type="button"
                    aria-label={`Contact ${name}`}
                  >
                    {contactText}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default memo(ProfileCardComponent)
