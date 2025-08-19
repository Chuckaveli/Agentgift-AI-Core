"use client"

import type React from "react"

import { useState } from "react"
import { Send, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LottieStatus } from "./LottieStatus"
import { useConciergeChat } from "@/hooks/useConciergeChat"
import type { PersonaKey } from "@/lib/types"

interface ConciergeChatProps {
  persona: PersonaKey
  context: any
}

export function ConciergeChat({ persona, context }: ConciergeChatProps) {
  const [input, setInput] = useState("")
  const { messages, state, isLoading, handleInputFocus, handleInputChange, handleSubmit, clearMessages } =
    useConciergeChat()

  const handleInputValueChange = (value: string) => {
    setInput(value)
    handleInputChange(value)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const message = input
    setInput("")
    handleInputChange("")

    await handleSubmit(message, persona, context)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getPersonaName = (persona: PersonaKey) => {
    switch (persona) {
      case "avelyn":
        return "Avelyn"
      case "galen":
        return "Galen"
      case "zola":
        return "Zola"
      case "mei":
        return "Mei"
      case "arya":
        return "Arya"
      default:
        return "Assistant"
    }
  }

  const getPersonaEmoji = (persona: PersonaKey) => {
    switch (persona) {
      case "avelyn":
        return "🌸"
      case "galen":
        return "🖤"
      case "zola":
        return "💃"
      case "mei":
        return "🌹"
      case "arya":
        return "🌞"
      default:
        return "🤖"
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Lottie Status */}
      <LottieStatus state={state} persona={persona} />

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">{getPersonaEmoji(persona)}</div>
              <h3 className="font-semibold text-lg mb-1">Chat with {getPersonaName(persona)}</h3>
              <p className="text-gray-600 text-sm">
                Describe what you're looking for and I'll help you find the perfect gift!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === "user" ? "text-purple-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => handleInputValueChange(e.target.value)}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${getPersonaName(persona)} for gift suggestions...`}
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">{input.length}/500</div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Send className="h-4 w-4" />
            </Button>
            {messages.length > 0 && (
              <Button onClick={clearMessages} disabled={isLoading} size="sm" variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConciergeChat
