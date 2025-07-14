"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Gift,
  Heart,
  Zap,
  CreditCard,
  Lock,
  ArrowRight,
  Package,
  Truck,
} from "lucide-react"
import { usePersona } from "../persona/persona-context"
import { PersonaThemeWrapper } from "../persona/persona-theme-wrapper"
import { DeliveryManager } from "../delivery/delivery-manager"
import { suggestPhysicalFollowThrough, SERVICE_CONFIG, type ExternalService } from "@/lib/external-services"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  isStreaming?: boolean
  audioUrl?: string
  creditsUsed?: number
  deliverySuggestions?: {
    service: ExternalService
    suggestion: string
    reasoning: string
  }[]
}

interface GiftConciergeModalProps {
  isOpen: boolean
  onClose: () => void
  userTier: string
  userCredits: number
  onCreditsUpdate: (newCredits: number) => void
}

const CREDIT_COSTS = {
  text_message: 1,
  voice_message: 3,
  premium_analysis: 5,
}

const TIER_LIMITS = {
  free: { maxMessages: 3, hasVoice: false, hasPersonas: false },
  premium: { maxMessages: 10, hasVoice: false, hasPersonas: true },
  pro: { maxMessages: 50, hasVoice: true, hasPersonas: true },
  agent00g: { maxMessages: -1, hasVoice: true, hasPersonas: true }, // unlimited
}

export function GiftConciergeModal({
  isOpen,
  onClose,
  userTier,
  userCredits,
  onCreditsUpdate,
}: GiftConciergeModalProps) {
  const { currentPersona, personas, setPersona } = usePersona()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null)
  const [selectedPersona, setSelectedPersona] = useState(currentPersona?.id || "avelyn")
  const [messagesUsed, setMessagesUsed] = useState(0)
  const [showDeliveryManager, setShowDeliveryManager] = useState(false)
  const [selectedDeliverySuggestion, setSelectedDeliverySuggestion] = useState<{
    service: ExternalService
    suggestion: string
  } | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const tierLimits = TIER_LIMITS[userTier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free
  const hasVoiceAccess = tierLimits.hasVoice
  const hasPersonaAccess = tierLimits.hasPersonas
  const maxMessages = tierLimits.maxMessages
  const canSendMessage = maxMessages === -1 || messagesUsed < maxMessages

  // Initialize with welcome message when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const persona = personas.find((p) => p.id === selectedPersona) || personas[0]
      const welcomeMessage: Message = {
        id: "welcome",
        content: `Hi! I'm ${persona.name}, your AI gift concierge. I specialize in ${persona.specialty.toLowerCase()} and I'm here to help you find the perfect gift. What's the occasion?`,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, selectedPersona, personas, messages.length])

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

  const handlePersonaChange = async (personaId: string) => {
    setSelectedPersona(personaId)
    await setPersona(personaId)

    // Add persona switch message
    const persona = personas.find((p) => p.id === personaId)
    if (persona) {
      const switchMessage: Message = {
        id: Date.now().toString(),
        content: `I'm now speaking as ${persona.name}! I specialize in ${persona.specialty.toLowerCase()} with a ${persona.tone.toLowerCase()} approach. How can I help you find the perfect gift?`,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, switchMessage])
    }
  }

  const detectEmotionFromMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("cozy") || lowerMessage.includes("comfort") || lowerMessage.includes("warm")) {
      return "cozy"
    }
    if (lowerMessage.includes("celebrate") || lowerMessage.includes("party") || lowerMessage.includes("birthday")) {
      return "celebration"
    }
    if (lowerMessage.includes("romantic") || lowerMessage.includes("love") || lowerMessage.includes("anniversary")) {
      return "romantic"
    }
    if (lowerMessage.includes("thank") || lowerMessage.includes("appreciate") || lowerMessage.includes("grateful")) {
      return "appreciation"
    }

    return "general"
  }

  const handleSendMessage = async (useVoice = false) => {
    if (!inputValue.trim() || !canSendMessage) return

    const creditCost = useVoice ? CREDIT_COSTS.voice_message : CREDIT_COSTS.text_message

    if (userCredits < creditCost) {
      toast.error("Insufficient credits! Upgrade to continue chatting.")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      creditsUsed: creditCost,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsTyping(true)
    setMessagesUsed((prev) => prev + 1)
    onCreditsUpdate(userCredits - creditCost)

    // Simulate OpenAI API call
    try {
      const persona = personas.find((p) => p.id === selectedPersona) || personas[0]

      // Detect emotion and generate delivery suggestions
      const detectedEmotion = detectEmotionFromMessage(currentInput)
      const deliverySuggestions = suggestPhysicalFollowThrough(detectedEmotion, "concierge_chat", userTier)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const responses = [
        `That's a wonderful occasion! Based on my expertise in ${persona.specialty.toLowerCase()}, I have some perfect suggestions for you...`,
        `I love helping with this! With my ${persona.tone.toLowerCase()} approach, here are some thoughtful gift ideas...`,
        `Great choice! Let me think of some gifts that would be absolutely perfect for this situation...`,
        `How exciting! I can already think of several meaningful gifts that would make this moment truly special...`,
      ]

      let responseContent = responses[Math.floor(Math.random() * responses.length)]

      // Add delivery suggestions to response if available
      if (deliverySuggestions.length > 0) {
        responseContent +=
          "\n\nI also noticed this might be perfect for a physical follow-up! Would you like me to help arrange something special to be delivered?"
      }

      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "assistant",
        timestamp: new Date(),
        isStreaming: true,
        audioUrl: useVoice ? generateMockAudioUrl() : undefined,
        deliverySuggestions: deliverySuggestions.length > 0 ? deliverySuggestions : undefined,
      }

      setMessages((prev) => [...prev, assistantResponse])
      setIsTyping(false)

      // Simulate streaming effect
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantResponse.id ? { ...msg, isStreaming: false } : msg)),
        )
      }, 2000)

      // Auto-play voice if enabled
      if (useVoice && assistantResponse.audioUrl) {
        playAudio(assistantResponse.audioUrl, assistantResponse.id)
      }
    } catch (error) {
      setIsTyping(false)
      toast.error("Failed to get response. Please try again.")
    }
  }

  const generateMockAudioUrl = () => {
    // In real implementation, this would call ElevenLabs API
    return `https://api.elevenlabs.io/v1/text-to-speech/${currentPersona?.voiceId}/stream`
  }

  const playAudio = async (audioUrl: string, messageId: string) => {
    try {
      setIsPlayingAudio(messageId)

      // Simulate audio playback
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setIsPlayingAudio(null)
    } catch (error) {
      setIsPlayingAudio(null)
      toast.error("Failed to play audio")
    }
  }

  const toggleRecording = () => {
    if (!hasVoiceAccess) {
      toast.error("Voice features require Pro tier or higher")
      return
    }
    setIsRecording(!isRecording)
    // Here you would implement actual voice recording logic
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getProgressPercentage = () => {
    if (maxMessages === -1) return 100
    return (messagesUsed / maxMessages) * 100
  }

  const getRemainingMessages = () => {
    if (maxMessages === -1) return "Unlimited"
    return Math.max(0, maxMessages - messagesUsed)
  }

  const handleDeliverySuggestionClick = (suggestion: { service: ExternalService; suggestion: string }) => {
    setSelectedDeliverySuggestion(suggestion)
    setShowDeliveryManager(true)
  }

  if (!currentPersona) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg w-full mx-4 p-0 gap-0 max-h-[90vh]">
          <PersonaThemeWrapper applyBackground className="rounded-lg border-2 flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="p-4 pb-2 border-b border-white/20 flex-shrink-0">
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
                      Gift Concierge
                    </DialogTitle>
                    <Badge variant="secondary" className="text-xs mt-1 bg-white/20 text-white border-white/30">
                      {currentPersona.specialty}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Persona Selector & Credits */}
              <div className="flex items-center justify-between gap-4 mt-3">
                {hasPersonaAccess ? (
                  <Select value={selectedPersona} onValueChange={handlePersonaChange}>
                    <SelectTrigger className="w-40 h-8 bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {personas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={persona.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">{persona.name[0]}</AvatarFallback>
                            </Avatar>
                            {persona.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Personas Locked
                  </Badge>
                )}

                <div className="flex items-center gap-2 text-white text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>{userCredits} credits</span>
                </div>
              </div>

              {/* Usage Progress */}
              {maxMessages !== -1 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>Messages Used</span>
                    <span>
                      {messagesUsed}/{maxMessages}
                    </span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-1 bg-white/20" />
                </div>
              )}
            </DialogHeader>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900">
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "assistant" && (
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

                        {/* Delivery Suggestions */}
                        {message.deliverySuggestions && message.deliverySuggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Physical Follow-up Suggestions:</p>
                            {message.deliverySuggestions.map((suggestion, index) => (
                              <Card
                                key={index}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleDeliverySuggestionClick(suggestion)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <span className="text-lg">{SERVICE_CONFIG[suggestion.service].icon}</span>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <h5 className="font-medium text-sm">
                                          {SERVICE_CONFIG[suggestion.service].name}
                                        </h5>
                                        <Badge variant="secondary" className="text-xs">
                                          {SERVICE_CONFIG[suggestion.service].creditCost} credits
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-1">{suggestion.suggestion}</p>
                                      <p className="text-xs text-muted-foreground italic">{suggestion.reasoning}</p>
                                    </div>
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div
                            className={`text-xs opacity-70 ${
                              message.sender === "user" ? "text-white/80" : "text-muted-foreground"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {message.creditsUsed && <span className="ml-2">• {message.creditsUsed} credits</span>}
                          </div>

                          {message.audioUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playAudio(message.audioUrl!, message.id)}
                              className="h-6 w-6 p-0"
                            >
                              {isPlayingAudio === message.id ? (
                                <VolumeX className="h-3 w-3" />
                              ) : (
                                <Volume2 className="h-3 w-3" />
                              )}
                            </Button>
                          )}
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

              {/* Input Area */}
              <PersonaThemeWrapper
                applyBackground
                className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
              >
                {!canSendMessage ? (
                  <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4 text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Message Limit Reached</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Upgrade to chat with your AI gift strategist
                      </p>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Upgrade Now
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ) : userCredits < CREDIT_COSTS.text_message ? (
                  <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="p-4 text-center">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Insufficient Credits</h3>
                      <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                        You need {CREDIT_COSTS.text_message} credit to send a message
                      </p>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Zap className="w-4 h-4 mr-1" />
                        Buy Credits
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask about the perfect gift..."
                          className="pr-12 border-white/30 focus:border-white/50 focus:ring-white/50 bg-white/90 dark:bg-gray-800/90"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleRecording}
                          className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full ${
                            isRecording
                              ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                              : hasVoiceAccess
                                ? "hover:bg-white/20 text-gray-600 dark:text-gray-400"
                                : "opacity-50 cursor-not-allowed text-gray-400"
                          }`}
                          disabled={!hasVoiceAccess}
                        >
                          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                      </div>

                      <Button
                        onClick={() => handleSendMessage(false)}
                        disabled={!inputValue.trim() || isTyping}
                        className={`bg-gradient-to-r ${currentPersona.theme.gradient} hover:opacity-90 text-white rounded-full h-10 w-10 p-0`}
                      >
                        <Send className="h-4 w-4" />
                      </Button>

                      {hasVoiceAccess && (
                        <Button
                          onClick={() => handleSendMessage(true)}
                          disabled={!inputValue.trim() || isTyping || userCredits < CREDIT_COSTS.voice_message}
                          className={`bg-gradient-to-r ${currentPersona.theme.gradient} hover:opacity-90 text-white rounded-full h-10 w-10 p-0`}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-4 text-xs text-white/80">
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
                      {hasVoiceAccess && (
                        <div className="flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          <span>Voice Ready</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span>Physical Delivery</span>
                      </div>
                    </div>
                  </>
                )}
              </PersonaThemeWrapper>
            </div>
          </PersonaThemeWrapper>
        </DialogContent>
      </Dialog>

      {/* Delivery Manager Modal */}
      {showDeliveryManager && (
        <DeliveryManager
          userId="demo-user-id"
          userTier={userTier}
          userCredits={userCredits}
          onCreditsUpdate={onCreditsUpdate}
          prefilledService={selectedDeliverySuggestion?.service}
          prefilledOptions={{
            gift: {
              type: "Concierge Suggestion",
              description: selectedDeliverySuggestion?.suggestion || "",
            },
          }}
        />
      )}
    </>
  )
}
