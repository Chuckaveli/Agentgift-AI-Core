"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type LottieState = "idle" | "userListening" | "aiThinking" | "aiSpeaking"

interface LottieStatusProps {
  state: LottieState
  className?: string
}

const LOTTIE_URLS = {
  userListening: "https://app.lottiefiles.com/share/105572d0-39ba-4ac1-a98b-919ec046926c",
  aiThinking: "https://app.lottiefiles.com/share/dfb79e3c-a1b8-4bd5-a2d7-2d34eddcadc9",
  aiSpeaking: "https://app.lottiefiles.com/share/6ff2e240-1dfb-42f3-99c7-727df933897d",
}

const FALLBACK_EMOJIS = {
  userListening: "💬",
  aiThinking: "✨",
  aiSpeaking: "🎙️",
}

const CAPTIONS = {
  idle: "",
  userListening: "Listening…",
  aiThinking: "Thinking…",
  aiSpeaking: "Responding…",
}

export default function LottieStatus({ state, className }: LottieStatusProps) {
  const [lottieLoaded, setLottieLoaded] = useState(false)
  const [lottieError, setLottieError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    if (state === "idle" || prefersReducedMotion) return

    // Dynamically import Lottie only when needed
    let mounted = true

    const loadLottie = async () => {
      try {
        const { default: Lottie } = await import("react-lottie-player")
        if (mounted) {
          setLottieLoaded(true)
          setLottieError(false)
        }
      } catch (error) {
        console.warn("[LottieStatus] Failed to load Lottie:", error)
        if (mounted) {
          setLottieError(true)
          setLottieLoaded(false)
        }
      }
    }

    loadLottie()

    return () => {
      mounted = false
    }
  }, [state, prefersReducedMotion])

  if (state === "idle") {
    return null
  }

  const shouldShowLottie = lottieLoaded && !lottieError && !prefersReducedMotion
  const currentUrl = LOTTIE_URLS[state as keyof typeof LOTTIE_URLS]
  const fallbackEmoji = FALLBACK_EMOJIS[state as keyof typeof FALLBACK_EMOJIS]
  const caption = CAPTIONS[state]

  return (
    <div className={cn("flex flex-col items-center justify-center py-6 transition-all duration-300", className)}>
      {/* Animation Container */}
      <div
        className={cn(
          "relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300",
          "bg-gradient-to-br from-pink-100 to-purple-100",
          state === "aiSpeaking" && "animate-pulse shadow-lg shadow-purple-200/50",
        )}
      >
        {/* Gradient Glow */}
        <div
          className={cn(
            "absolute inset-0 rounded-full opacity-60 transition-opacity duration-300",
            "bg-gradient-to-br from-pink-400 to-purple-600 blur-sm",
            state === "aiSpeaking" ? "opacity-80" : "opacity-40",
          )}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {shouldShowLottie ? (
            <LottiePlayer
              src={currentUrl}
              loop={state !== "aiSpeaking"}
              play
              style={{ width: 48, height: 48 }}
              onError={() => setLottieError(true)}
            />
          ) : (
            <span className="text-2xl animate-bounce" role="img" aria-label={caption}>
              {fallbackEmoji}
            </span>
          )}
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <p
          className={cn(
            "mt-3 text-sm font-medium transition-all duration-300",
            "bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent",
            "animate-in fade-in-0 slide-in-from-bottom-2",
          )}
          aria-live="polite"
        >
          {caption}
        </p>
      )}
    </div>
  )
}

// Dynamic Lottie Player Component
function LottiePlayer({
  src,
  loop,
  play,
  style,
  onError,
}: {
  src: string
  loop: boolean
  play: boolean
  style: React.CSSProperties
  onError: () => void
}) {
  const [Lottie, setLottie] = useState<any>(null)

  useEffect(() => {
    import("react-lottie-player")
      .then(({ default: LottieComponent }) => {
        setLottie(() => LottieComponent)
      })
      .catch(onError)
  }, [onError])

  if (!Lottie) {
    return <div style={style} className="animate-pulse bg-gray-200 rounded" />
  }

  return <Lottie src={src} loop={loop} play={play} style={style} onError={onError} />
}
