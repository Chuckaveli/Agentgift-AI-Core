"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type ChatState = "idle" | "userListening" | "aiThinking" | "aiSpeaking"

interface LottieStatusProps {
  state: ChatState
  persona: string
}

export function LottieStatus({ state, persona }: LottieStatusProps) {
  const [lottieData, setLottieData] = useState<Record<string, any>>({})
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  // Load Lottie animations
  useEffect(() => {
    const loadLottie = async () => {
      try {
        const animations = {
          userListening: "https://app.lottiefiles.com/share/105572d0-39ba-4ac1-a98b-919ec046926c",
          aiThinking: "https://app.lottiefiles.com/share/dfb79e3c-a1b8-4bd5-a2d7-2d34eddcadc9",
          aiSpeaking: "https://app.lottiefiles.com/share/6ff2e240-1dfb-42f3-99c7-727df933897d",
        }

        const loadedData: Record<string, any> = {}

        for (const [key, url] of Object.entries(animations)) {
          try {
            const response = await fetch(url)
            if (response.ok) {
              loadedData[key] = await response.json()
            }
          } catch (error) {
            console.warn(`Failed to load ${key} animation:`, error)
          }
        }

        setLottieData(loadedData)
      } catch (error) {
        console.warn("Failed to load Lottie animations:", error)
      }
    }

    if (!prefersReducedMotion) {
      loadLottie()
    }
  }, [prefersReducedMotion])

  // Get emoji fallback
  const getEmoji = (state: ChatState) => {
    switch (state) {
      case "userListening":
        return "💬"
      case "aiThinking":
        return "✨"
      case "aiSpeaking":
        return "🎙️"
      default:
        return ""
    }
  }

  // Get caption text
  const getCaption = (state: ChatState) => {
    switch (state) {
      case "userListening":
        return "Listening…"
      case "aiThinking":
        return "Thinking…"
      case "aiSpeaking":
        return "Responding…"
      default:
        return ""
    }
  }

  // Get persona colors
  const getPersonaColors = (persona: string) => {
    switch (persona) {
      case "avelyn":
        return "from-pink-400 to-rose-400"
      case "galen":
        return "from-gray-400 to-slate-400"
      case "zola":
        return "from-purple-400 to-fuchsia-400"
      case "mei":
        return "from-red-400 to-pink-400"
      case "arya":
        return "from-yellow-400 to-orange-400"
      default:
        return "from-purple-400 to-pink-400"
    }
  }

  if (state === "idle") return null

  const shouldShowLottie = !prefersReducedMotion && lottieData[state]
  const emoji = getEmoji(state)
  const caption = getCaption(state)
  const gradientColors = getPersonaColors(persona)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.16 }}
        className="flex flex-col items-center justify-center py-6"
      >
        {/* Animation Container */}
        <div
          className={`relative w-20 h-20 rounded-full bg-gradient-to-r ${gradientColors} p-1 ${
            state === "aiSpeaking" ? "animate-pulse" : ""
          }`}
        >
          <div className="w-full h-full rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
            {shouldShowLottie ? (
              <div className="w-12 h-12 flex items-center justify-center">
                {/* Lottie animation would render here */}
                <span className="text-2xl">{emoji}</span>
              </div>
            ) : (
              <span className="text-2xl">{emoji}</span>
            )}
          </div>
        </div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.16 }}
          className={`mt-3 text-sm font-medium bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}
          aria-live="polite"
        >
          {caption}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  )
}

export default LottieStatus
