"use client"

import { useState, useCallback, useRef } from "react"
import { toast } from "sonner"

type ChatState = "idle" | "userListening" | "aiThinking" | "aiSpeaking"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface UseConciergeChat {
  messages: Message[]
  state: ChatState
  isLoading: boolean
  handleInputFocus: () => void
  handleInputChange: (value: string) => void
  handleSubmit: (message: string, persona: string, context: any) => Promise<void>
  clearMessages: () => void
}

export function useConciergeChat(): UseConciergeChat {
  const [messages, setMessages] = useState<Message[]>([])
  const [state, setState] = useState<ChatState>("idle")
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleInputFocus = useCallback(() => {
    setState("userListening")
  }, [])

  const handleInputChange = useCallback((value: string) => {
    if (value.length > 0) {
      setState("userListening")
    } else {
      setState("idle")
    }
  }, [])

  const handleSubmit = useCallback(async (message: string, persona: string, context: any) => {
    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: message.trim(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Set thinking state
      setState("aiThinking")
      setIsLoading(true)

      // Make API call
      const response = await fetch("/api/concierge/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona,
          context,
          messages: [userMessage],
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Set speaking state when first byte received
      setState("aiSpeaking")

      const data = await response.json()

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I'm here to help with your gift search!",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Return to idle after delay
      setTimeout(() => {
        setState("idle")
        setIsLoading(false)
      }, 600)
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Request was aborted, don't show error
        return
      }

      console.error("Chat error:", error)
      toast.error("Connection issue. Try again.")
      setState("idle")
      setIsLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setState("idle")
    setIsLoading(false)

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    messages,
    state,
    isLoading,
    handleInputFocus,
    handleInputChange,
    handleSubmit,
    clearMessages,
  }
}

export default useConciergeChat
