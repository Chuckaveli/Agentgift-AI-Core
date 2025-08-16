"use client"

import { useState, useCallback, useRef, useEffect } from "react"
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

const SPEAKING_HOLD_MS = 600
const MAX_RETRIES = 2

export function useConciergeChat(
  persona: PersonaKey,
  profile: DatabaseUserProfile | null
): UseConciergeChat {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lottieState, setLottieState] = useState<LottieState>("idle")
  const [inputValue, setInputValue] = useState("")
  const [inputFocused, setInputFocused] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [])

  // --- focus toggles listening orb
  const handleSetInputFocused = useCallback(
    (focused: boolean) => {
      setInputFocused(focused)
      if (focused && lottieState === "idle") setLottieState("userListening")
      if (!focused && !inputValue.trim() && lottieState === "userListening") {
        setLottieState("idle")
      }
    },
    [lottieState, inputValue]
  )

  // --- typing toggles listening orb
  const handleSetInputValue = useCallback(
    (value: string) => {
      setInputValue(value)
      if (value.trim() && lottieState === "idle") setLottieState("userListening")
      if (!value.trim() && !inputFocused && lottieState === "userListening") {
        setLottieState("idle")
      }
    },
    [lottieState, inputFocused]
  )

  // --- basic toast without any deps
  function toast(msg: string) {
    try {
      const el = document.createElement("div")
      el.textContent = msg
      el.className =
        "fixed top-4 right-4 z-[9999] rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg"
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 2500)
    } catch {
      // noop (SSR or locked DOM)
    }
  }

  async function fetchWithRetry(
    body: unknown,
    attempt = 0
  ): Promise<Response> {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const res = await fetch("/api/concierge/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: abortRef.current.signal,
    })

    if (res.ok) return res

    // Retry on 429/5xx
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      const backoff = 400 * Math.pow(2, attempt) // 400ms, 800ms
      await new Promise((r) => setTimeout(r, backoff))
      return fetchWithRetry(body, attempt + 1)
    }

    // surface error
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }

  // --- main send
  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim()
      if (!text || isLoading) return

      // cancel in-flight + clear speaking hold
      abortRef.current?.abort()
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)
      setLottieState("aiThinking")
      setInputValue("")

      // prepare assistant placeholder for streaming
      const assistantId = crypto.randomUUID()
      const startAssistant: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, startAssistant])

      const requestBody = {
        persona,
        context: {
          tier: profile?.tier ?? "Free",
          xp_level: profile?.xp_level ?? 0,
          love_language: profile?.love_language ?? null,
          life_path_number: profile?.life_path_number ?? null,
        },
        // send the _new_ list including the user message only; assistant will stream back
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true, // your /api route can ignore this if not streaming
      }

      try {
        const res = await fetchWithRetry(requestBody)

        // switch to speaking on first byte
        setLottieState("aiSpeaking")

        // Stream if possible
        if (res.body) {
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let buf = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buf += decoder.decode(value, { stream: true })

            // naive chunk split by \n\n (Server-Sent-Chunks or JSONL)
            const parts = buf.split(/\n{2,}/)
            // keep last partial in buffer
            buf = parts.pop() ?? ""

            for (const part of parts) {
              // try JSON first; if it fails, treat as plain text chunk
              try {
                const j = JSON.parse(part)
                if (j.delta) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: (m.content || "") + j.delta }
                        : m
                    )
                  )
                }
                if (j.done) {
                  // no-op here; finish handled below
                }
              } catch {
                // plain text chunk
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: (m.content || "") + part }
                      : m
                  )
                )
              }
            }
          }
        } else {
          // fallback: non-stream JSON
          const data = await res.json().catch(() => ({}))
          const reply =
            data.reply ||
            "I’m having trouble responding right now. Could you try again?"
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: reply } : m
            )
          )
        }

        // small “speaking” hold for polish
        holdTimerRef.current = setTimeout(() => {
          setLottieState("idle")
        }, SPEAKING_HOLD_MS)
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("[useConciergeChat] Error:", err)
          toast("Connection issue. Please try again.")
          setLottieState("idle")
          // Clean the empty assistant placeholder if it exists
          setMessages((prev) =>
            prev.filter((m) => !(m.id === assistantId && !m.content))
          )
        }
      } finally {
        setIsLoading(false)
      }
    },
    [persona, profile, messages, isLoading]
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
