"use client"

import { useState, useCallback, useRef } from "react"
import type { DatabaseUserProfile, PersonaKey } from "@/lib/types"

type LottieState = "idle" | "userListening" | "aiThinking" | "aiSpeaking"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface UseConciergeChat {
  messages: Message[]
  isLoading: boolean
  lottieState: LottieState
  sendMessage: (content: string) => Promise<void>
  setInputFocused: (focused: boolean) => void
  setInputValue: (value: string) => void
}

export function useConciergeChat(persona: PersonaKey, profile: DatabaseUserProfile | null): UseConciergeChat {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lottieState, setLottieState] = useState<LottieState>("idle")
  const [inputValue, setInputValue] = useState("")
  const [inputFocused, setInputFocused] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  // Handle input focus/blur
  const handleSetInputFocused = useCallback(
    (focused: boolean) => {
      setInputFocused(focused)

      if (focused && lottieState === "idle") {
        setLottieState("userListening")
      } else if (!focused && lottieState === "userListening" && !inputValue.trim()) {
        setLottieState("idle")
      }
    },
    [lottieState, inputValue],
  )

  // Handle input value changes
  const handleSetInputValue = useCallback(
    (value: string) => {
      setInputValue(value)

      if (value.trim() && lottieState === "idle") {
        setLottieState("userListening")
      } else if (!value.trim() && !inputFocused && lottieState === "userListening") {
        setLottieState("idle")
      }
    },
    [lottieState, inputFocused],
  )

  // Send message function
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setLottieState("aiThinking")
      setInputValue("")

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch("/api/concierge/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            persona,
            context: {
              tier: profile?.tier ?? "Free",
              xp_level: profile?.xp_level ?? 0,
              love_language: profile?.love_language,
              life_path_number: profile?.life_path_number,
            },
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        // First byte received - switch to speaking
        setLottieState("aiSpeaking")

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply || "I'm having trouble responding right now. Could you try rephrasing?",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Stay in speaking state for 600ms after completion
        timeoutRef.current = setTimeout(() => {
          setLottieState("idle")
        }, 600)
      } catch (error: any) {
        console.error("[useConciergeChat] Error:", error)

        if (error.name !== "AbortError") {
          // Show error toast
          if (typeof window !== "undefined" && "navigator" in window) {
            // Simple toast fallback
            const toast = document.createElement("div")
            toast.textContent = "Connection issue. Try again."
            toast.className = "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
            document.body.appendChild(toast)
            setTimeout(() => document.body.removeChild(toast), 3000)
          }
        }

        setLottieState("idle")
      } finally {
        setIsLoading(false)
      }
    },
    [persona, profile, messages, isLoading],
  )

  return {
    messages,
    isLoading,
    lottieState,
    sendMessage,
    setInputFocused: handleSetInputFocused,
    setInputValue: handleSetInputValue,
  }
}
