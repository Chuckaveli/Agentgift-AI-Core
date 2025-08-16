"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { useConciergeChat } from "@/hooks/useConciergeChat"
import LottieStatus from "./LottieStatus"
import type { DatabaseUserProfile, PersonaKey } from "@/lib/types"

interface ConciergeChatProps {
  persona: PersonaKey
  profile: DatabaseUserProfile | null
}

const PERSONA_INFO = {
  avelyn: { name: "Avelyn", color: "from-pink-500 to-rose-500", emoji: "💖" },
  galen: { name: "Galen", color: "from-blue-500 to-indigo-500", emoji: "🧠" },
  zola: { name: "Zola", color: "from-purple-500 to-violet-500", emoji: "✨" },
  mei: { name: "Mei", color: "from-green-500 to-emerald-500", emoji: "🌸" },
  arya: { name: "Arya", color: "from-orange-500 to-red-500", emoji: "🔥" },
}

export default function ConciergeChat({ persona, profile }: ConciergeChatProps) {
  const [input, setInput] = useState("")
  const [inputFocused, setInputFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    isLoading,
    lottieState,
    sendMessage,
    setInputFocused: setChatInputFocused,
    setInputValue: setChatInputValue,
  } = useConciergeChat(persona, profile)

  const personaInfo = PERSONA_INFO[persona]

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle input changes
  const handleInputChange = (value: string) => {
    setInput(value)
    setChatInputValue(value)
  }

  // Handle input focus
  const handleInputFocus = (focused: boolean) => {
    setInputFocused(focused)
    setChatInputFocused(focused)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    await sendMessage(input)
    setInput("")
    textareaRef.current?.focus()
  }

  // Handle Enter key (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Card className="flex flex-col h-[600px] bg-white shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center text-white shadow-sm",
            personaInfo.color,
          )}
        >
          <span className="text-lg">{personaInfo.emoji}</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{personaInfo.name}</h3>
          <p className="text-xs text-gray-500">AI Gift Concierge</p>
        </div>
      </div>

      {/* Lottie Status */}
      <LottieStatus state={lottieState} className="border-b border-gray-50" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div
              className={cn(
                "w-16 h-16 mx-auto rounded-full bg-gradient-to-r flex items-center justify-center text-white shadow-lg mb-4",
                personaInfo.color,
              )}
            >
              <span className="text-2xl">{personaInfo.emoji}</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Hi! I'm {personaInfo.name}</h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              I'm here to help you find the perfect gift. Tell me about the person you're shopping for!
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <div
                className={cn(
                  "w-8 h-8 rounded-full bg-gradient-to-r flex items-center justify-center text-white shadow-sm flex-shrink-0",
                  personaInfo.color,
                )}
              >
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                message.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-gray-100 text-gray-900",
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p
                className={cn("text-xs mt-1 opacity-70", message.role === "user" ? "text-purple-100" : "text-gray-500")}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => handleInputFocus(true)}
            onBlur={() => handleInputFocus(false)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${personaInfo.name} for gift suggestions...`}
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "px-3 bg-gradient-to-r text-white shadow-sm hover:shadow-md transition-all",
              personaInfo.color,
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </form>
    </Card>
  )
}
