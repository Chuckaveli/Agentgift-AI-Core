"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Send, Mic, MicOff, X, Sparkles, Gift, Heart } from "lucide-react"
import { usePersona } from "./persona/persona-context"
import { PersonaSelector } from "./persona/persona-selector"
import { PersonaThemeWrapper } from "./persona/persona-theme-wrapper"

interface Message {
  id: string
  content: string
  sender: "user" | "agent"
  timestamp: Date
  isStreaming?: boolean
}

interface AIConciergeProps {
  isOpen: boolean
  onClose: () => void
}

export function AIConciergeChat({ isOpen, onClose }: AIConciergeProps) {
  const { currentPersona } = usePersona()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize with welcome message when persona changes
  useEffect(() => {
    if (isOpen && currentPersona) {
      const welcomeMessage: Message = {
        id: "welcome",
        content: `Hi there! I'm ${currentPersona.name}, your AI gifting concierge specializing in ${currentPersona.specialty.toLowerCase()}. I'm here to help you find the perfect gift! What's the occasion?`,
        sender: "agent",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, currentPersona])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentPersona) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response with persona-specific content
    setTimeout(() => {
      const responses = [
        `That sounds like a wonderful occasion! As someone who specializes in ${currentPersona.specialty.toLowerCase()}, let me think of some perfect gift ideas for you...`,
        `I love helping with gift selection! Based on what you've told me and my expertise in ${currentPersona.specialty.toLowerCase()}, here are some thoughtful suggestions...`,
        `Great choice of occasion! With my ${currentPersona.tone.toLowerCase()} approach, I can already think of several gifts that would be absolutely perfect...`,
        `How exciting! I can already think of several gifts that would make this moment truly special, especially considering my focus on ${currentPersona.specialty.toLowerCase()}...`,
      ]

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "agent",
        timestamp: new Date(),
        isStreaming: true,
      }

      setMessages((prev) => [...prev, agentResponse])
      setIsTyping(false)

      // Simulate streaming effect
      setTimeout(() => {
        setMessages((prev) => prev.map((msg) => (msg.id === agentResponse.id ? { ...msg, isStreaming: false } : msg)))
      }, 2000)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Here you would implement actual voice recording logic with ElevenLabs
  }

  if (!currentPersona) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 p-0 gap-0">
        <PersonaThemeWrapper applyBackground className="rounded-lg border-2">
          <DialogHeader className="p-4 pb-2 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`relative p-1 rounded-full bg-gradient-to-r ${currentPersona.theme.gradient}`}>
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage src={currentPersona.avatar || "/placeholder.svg"} alt={currentPersona.name} />
                    <AvatarFallback className="bg-white text-purple-600 font-bold">
                      {currentPersona.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>

                <div className="flex-1">
                  <DialogTitle className="text-lg font-bold text-white flex items-center gap-1">
                    {currentPersona.name}
                  </DialogTitle>
                  <Badge variant="secondary" className="text-xs mt-1 bg-white/20 text-white border-white/30">
                    {currentPersona.specialty}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PersonaSelector variant="dropdown" size="sm" showDescription={false} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col h-[500px] bg-white dark:bg-gray-900">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "agent" && (
                      <div
                        className={`p-1 rounded-full bg-gradient-to-r ${currentPersona.theme.gradient} flex-shrink-0`}
                      >
                        <Avatar className="h-8 w-8 border border-white">
                          <AvatarImage src={currentPersona.avatar || "/placeholder.svg"} alt={currentPersona.name} />
                          <AvatarFallback className="bg-white text-purple-600 text-sm font-bold">
                            {currentPersona.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? `bg-gradient-to-r ${currentPersona.theme.gradient} text-white ml-auto`
                          : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                      }`}
                    >
                      <p className={`text-sm ${message.isStreaming ? "animate-pulse" : ""}`}>
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse" />
                        )}
                      </p>
                      <div
                        className={`text-xs mt-1 opacity-70 ${
                          message.sender === "user" ? "text-white/80" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className={`p-1 rounded-full bg-gradient-to-r ${currentPersona.theme.gradient}`}>
                      <Avatar className="h-8 w-8 border border-white">
                        <AvatarImage src={currentPersona.avatar || "/placeholder.svg"} alt={currentPersona.name} />
                        <AvatarFallback className="bg-white text-purple-600 text-sm font-bold">
                          {currentPersona.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <PersonaThemeWrapper applyBackground className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about the perfect gift..."
                    className="pr-12 border-white/30 focus:border-white/50 focus:ring-white/50 bg-white/90 dark:bg-gray-800/90"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRecording}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full ${
                      isRecording
                        ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                        : "hover:bg-white/20 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className={`bg-gradient-to-r ${currentPersona.theme.gradient} hover:opacity-90 text-white rounded-full h-10 w-10 p-0`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/80">
                <div className="flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  <span>Gift Expert</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Powered</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>Personalized</span>
                </div>
              </div>
            </PersonaThemeWrapper>
          </div>
        </PersonaThemeWrapper>
      </DialogContent>
    </Dialog>
  )
}

