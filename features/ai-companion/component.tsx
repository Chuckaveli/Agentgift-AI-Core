"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserTierGate } from "@/components/global/user-tier-gate"
import { Send, MessageCircle, Zap, Star, Users } from "lucide-react"
import { TIERS, type UserTier, XPEngine, CreditSystem } from "@/lib/global-logic"
import { triggerXPGain } from "@/components/global/toast-badge-notifier"

interface AIPersona {
  id: string
  name: string
  personalityTraits: {
    traits: string[]
    communicationStyle: string
    expertise: string
  }
  specialty: string
  greetingMessage: string
  avatarUrl: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  mood?: string
  suggestions?: string[]
}

interface AICompanionProps {
  userTier: UserTier
  userId: string
  userCredits: number
  onCreditsUpdate: (credits: number) => void
}

const personas: AIPersona[] = [
  {
    id: "avelyn",
    name: "Avelyn",
    personalityTraits: {
      traits: ["empathetic", "intuitive", "warm"],
      communicationStyle: "gentle and encouraging",
      expertise: "emotional intelligence",
    },
    specialty: "Emotional Gifting Coach",
    greetingMessage:
      "Hi there! I'm Avelyn, your emotional gifting companion. I'm here to help you connect hearts through meaningful gifts. What's on your mind today?",
    avatarUrl: "/avatars/avelyn.png",
  },
  {
    id: "galen",
    name: "Galen",
    personalityTraits: {
      traits: ["analytical", "practical", "precise"],
      communicationStyle: "clear and methodical",
      expertise: "strategic planning",
    },
    specialty: "Strategic Gift Planner",
    greetingMessage:
      "Hello! I'm Galen, your strategic gifting advisor. I specialize in creating systematic approaches to perfect gift-giving. How can I help you plan something special?",
    avatarUrl: "/avatars/galen.png",
  },
  {
    id: "zola",
    name: "Zola",
    personalityTraits: {
      traits: ["creative", "spontaneous", "energetic"],
      communicationStyle: "playful and inspiring",
      expertise: "creative experiences",
    },
    specialty: "Creative Experience Designer",
    greetingMessage:
      "Hey there, gift-giver! I'm Zola, your creative gifting muse. I love turning ordinary moments into extraordinary memories. Ready to create some magic?",
    avatarUrl: "/avatars/zola.png",
  },
]

export default function AICompanion({ userTier, userId, userCredits, onCreditsUpdate }: AICompanionProps) {
  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(personas[0])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [conversationCount, setConversationCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const hasProAccess = userTier === TIERS.PRO_AGENT || userTier === TIERS.AGENT_00G

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const startConversation = async () => {
    if (!hasProAccess) return

    // Deduct credits for starting conversation
    const success = await CreditSystem.deductCredits(userId, 1, "AI Companion conversation")
    if (!success) {
      alert("Insufficient credits to start conversation")
      return
    }

    setSessionStarted(true)
    setMessages([
      {
        id: "greeting",
        role: "assistant",
        content: selectedPersona.greetingMessage,
        timestamp: new Date(),
      },
    ])

    // Update credits
    onCreditsUpdate(userCredits - 1)
    setConversationCount((prev) => prev + 1)
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionStarted) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Simulate AI response based on persona
      const responses = getPersonaResponses(selectedPersona.id, inputMessage)
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      // Add slight delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse.content,
        timestamp: new Date(),
        suggestions: randomResponse.suggestions,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Award XP for interaction
      await XPEngine.addXP(userId, 5, "AI Companion interaction")
      triggerXPGain(5, "AI Companion interaction")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPersonaResponses = (personaId: string, userInput: string) => {
    const input = userInput.toLowerCase()

    if (personaId === "avelyn") {
      if (input.includes("sad") || input.includes("upset") || input.includes("difficult")) {
        return [
          {
            content:
              "I can sense you're going through a tough time. Sometimes the most meaningful gifts come from the heart during difficult moments. What would help them feel truly seen and supported right now?",
            suggestions: ["Comfort gifts", "Emotional support", "Memory keepsakes"],
          },
        ]
      }
      if (input.includes("anniversary") || input.includes("romantic")) {
        return [
          {
            content:
              "How beautiful! Anniversaries are about celebrating your unique love story. Tell me about a moment that perfectly captures your relationship - that's where we'll find the perfect gift inspiration.",
            suggestions: ["Memory lane gifts", "Romantic experiences", "Love language gifts"],
          },
        ]
      }
      return [
        {
          content:
            "I love how thoughtful you are! The fact that you're here shows how much you care. What emotions do you want your gift to express? Joy? Gratitude? Love? Let's start there.",
          suggestions: ["Emotional connection", "Heartfelt messages", "Meaningful experiences"],
        },
      ]
    }

    if (personaId === "galen") {
      if (input.includes("budget") || input.includes("expensive") || input.includes("cost")) {
        return [
          {
            content:
              "Smart thinking! Let's approach this strategically. What's your target budget range? I can help you maximize impact while staying within your parameters.",
            suggestions: ["Budget optimization", "Value gifts", "DIY alternatives"],
          },
        ]
      }
      if (input.includes("group") || input.includes("multiple") || input.includes("colleagues")) {
        return [
          {
            content:
              "Group gifts require coordination and consensus. I recommend starting with a clear budget per person and a unified theme. What's the occasion and group size?",
            suggestions: ["Group coordination", "Bulk gifting", "Team experiences"],
          },
        ]
      }
      return [
        {
          content:
            "Let's break this down systematically. First, tell me: recipient, occasion, relationship level, and any constraints. With these parameters, I can develop an optimal gifting strategy.",
          suggestions: ["Strategic planning", "Gift categories", "Timeline planning"],
        },
      ]
    }

    if (personaId === "zola") {
      if (input.includes("boring") || input.includes("ordinary") || input.includes("creative")) {
        return [
          {
            content:
              "Boring? Not on my watch! Let's flip the script and create something absolutely unforgettable. What if we turned this gift into an experience, a story, or even a treasure hunt?",
            suggestions: ["Creative experiences", "Surprise elements", "Interactive gifts"],
          },
        ]
      }
      if (input.includes("surprise") || input.includes("unexpected")) {
        return [
          {
            content:
              "YES! Surprises are my specialty! The best gifts catch people completely off guard but feel perfectly 'them.' What's something they'd never expect but would absolutely love?",
            suggestions: ["Surprise reveals", "Unexpected experiences", "Creative presentations"],
          },
        ]
      }
      return [
        {
          content:
            "Oh, this is going to be fun! I'm already buzzing with ideas. Tell me about this special person - what makes them unique? Let's create something that's pure magic!",
          suggestions: ["Creative concepts", "Unique experiences", "Artistic presentations"],
        },
      ]
    }

    return [
      {
        content: "I'm here to help you create something special! Tell me more about what you have in mind.",
        suggestions: ["Get started", "Share details", "Explore options"],
      },
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            AG AI Companion
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Your emotional gifting coach powered by advanced AI</p>
          <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Beta</Badge>
        </div>

        <UserTierGate userTier={userTier} requiredTier={TIERS.PRO_AGENT} featureName="AI Companion">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Persona Selection */}
            {!sessionStarted && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Choose Your AI Companion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {personas.map((persona) => (
                      <Card
                        key={persona.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedPersona.id === persona.id
                            ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : ""
                        }`}
                        onClick={() => setSelectedPersona(persona)}
                      >
                        <CardContent className="p-4 text-center">
                          <Avatar className="w-16 h-16 mx-auto mb-3">
                            <AvatarImage src={persona.avatarUrl || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg">
                              {persona.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{persona.name}</h3>
                          <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">{persona.specialty}</p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {persona.personalityTraits.traits.map((trait) => (
                              <Badge key={trait} variant="secondary" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="text-center mt-6">
                    <Button
                      onClick={startConversation}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      size="lg"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Conversation (1 Credit)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chat Interface */}
            {sessionStarted && (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="flex-shrink-0 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedPersona.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {selectedPersona.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{selectedPersona.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPersona.specialty}</p>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active Session
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                          }`}
                        >
                          <p className="mb-2">{message.content}</p>
                          {message.suggestions && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs bg-transparent"
                                  onClick={() => setInputMessage(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                          <div className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedPersona.name} is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="flex-shrink-0 border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Share what's on your mind..."
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Stats */}
            {sessionStarted && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{messages.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Messages</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{conversationCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{userCredits}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Credits Left</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </UserTierGate>
      </div>
    </div>
  )
}
