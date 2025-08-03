"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Bot,
  Crown,
  Sparkles,
  Lock,
  Mic,
  MessageCircle,
  Zap,
  Heart,
  Globe,
  Gift,
  Settings,
  TrendingUp,
  Users,
  Brain,
  Calendar,
  Coins,
  Languages,
  SpaceIcon as Chaos,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase-client"

// Types
interface Assistant {
  id: string
  name: string
  description: string
  assistant_id: string
  tier: "Free" | "Pro" | "Pro+" | "Enterprise" | "XP_Level" | "Loyalty_NFT"
  xp_level_required?: number
  category: string
  icon: string
  persona_hint?: string
  voice_enabled: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  tier: string
  xp_level: number
  has_loyalty_nft: boolean
  role?: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AssistantSession {
  assistant_id: string
  messages: ChatMessage[]
  is_active: boolean
}

// Assistant data with all the provided IDs
const ASSISTANT_DATA: Omit<Assistant, "created_at" | "updated_at">[] = [
  {
    id: "knowledge-upload",
    name: "Knowledge Upload Bot",
    description: "Data Structuring for Core Assistant",
    assistant_id: "asst_mVzUCLJMf8w34wEzuXGKuHLF",
    tier: "Pro+",
    category: "Data Processing",
    icon: "Brain",
    voice_enabled: false,
    is_active: true,
  },
  {
    id: "agent-identity",
    name: "Agent Identity Optimizer",
    description: "Persona Matcher",
    assistant_id: "asst_xSuf7lto2ooTwl6ANpfSHNbQ",
    tier: "Pro+",
    category: "Personas",
    icon: "Users",
    voice_enabled: true,
    is_active: true,
  },
  {
    id: "occasion-mapper",
    name: "Occasion Mapper",
    description: "Giftworthy Date Decoder",
    assistant_id: "asst_AhdxKJOkBwuKEgrvqpbZJFH1",
    tier: "Pro",
    category: "Planning",
    icon: "Calendar",
    voice_enabled: false,
    is_active: true,
  },
  {
    id: "gift-engine",
    name: "Gift Engine Mastermind™",
    description: "Ultimate Gift Recommendation Engine",
    assistant_id: "asst_nG0Wk33h0SJYiwGrs1DCVDme",
    tier: "Pro+",
    category: "Core Engine",
    icon: "Gift",
    voice_enabled: true,
    is_active: true,
  },
  {
    id: "tokenomics-xp",
    name: "Tokenomics XP Controller™",
    description: "Advanced Economy Management",
    assistant_id: "asst_OFoqYv80ueCqggzWEQywmYtg",
    tier: "Enterprise",
    category: "Economy",
    icon: "Coins",
    voice_enabled: false,
    is_active: true,
  },
  {
    id: "love-language",
    name: "Love Language Listener™",
    description: "Emotional Intelligence for Gifting",
    assistant_id: "asst_lCOoCbKoCEaZ6fcL1VZznURq",
    tier: "Free",
    category: "Psychology",
    icon: "Heart",
    voice_enabled: true,
    is_active: true,
  },
  {
    id: "agent-arya",
    name: "Agent Arya",
    description: "Hindi Gifting Persona",
    assistant_id: "asst_nWRcJT1Oce8zw8nbOYSkaw1E",
    tier: "XP_Level",
    xp_level_required: 50,
    category: "Cultural Personas",
    icon: "Languages",
    persona_hint: "hindi",
    voice_enabled: true,
    is_active: true,
  },
  {
    id: "agent-mei",
    name: "Agent Mei",
    description: "Chinese Gifting Persona",
    assistant_id: "asst_ZcWT3DmUVB9qRUk4yWNgP86",
    tier: "XP_Level",
    xp_level_required: 50,
    category: "Cultural Personas",
    icon: "Languages",
    persona_hint: "chinese",
    voice_enabled: true,
    is_active: true,
  },
  {
    id: "agent-lola",
    name: "Agent Lola",
    description: "Spanish Gifting Persona",
    assistant_id: "asst_P6t69u4XrYa15UjkFENMLsf4",
    tier: "Pro+",
    category: "Cultural Personas",
    icon: "Languages",
    persona_hint: "spanish",
    voice_enabled: true,
    is_active: true,
  },
  {
    id: "agent-zola",
    name: "Agent Zola",
    description: "Chaos Concierge",
    assistant_id: "asst_6wU3S0voUEQluQOpRg9lpdvm",
    tier: "Loyalty_NFT",
    category: "Special",
    icon: "Chaos",
    persona_hint: "chaos",
    voice_enabled: true,
    is_active: true,
  },
  {
    id: "concierge-core",
    name: "Concierge Core",
    description: "Central Intelligence Hub",
    assistant_id: "asst_mDwC9xbBkSKPVoVpBYs4fbTw",
    tier: "Pro+",
    category: "Core Engine",
    icon: "Bot",
    voice_enabled: true,
    is_active: true,
  },
]

// Icon mapping
const iconMap = {
  Brain,
  Users,
  Calendar,
  Gift,
  Coins,
  Heart,
  Languages,
  Chaos,
  Bot,
  Crown,
  Sparkles,
  Lock,
  Mic,
  MessageCircle,
  Zap,
  Globe,
  Settings,
  TrendingUp,
}

// Tier styling
const getTierStyling = (tier: string, isUnlocked: boolean) => {
  const baseClasses = "transition-all duration-300"

  if (!isUnlocked) {
    return {
      card: `${baseClasses} opacity-60 blur-sm hover:blur-none`,
      badge: "bg-gray-500 text-gray-100",
      glow: "",
    }
  }

  switch (tier) {
    case "Free":
      return {
        card: `${baseClasses} border-gray-200 hover:border-gray-300`,
        badge: "bg-gray-500 text-white",
        glow: "",
      }
    case "Pro":
      return {
        card: `${baseClasses} border-blue-200 hover:border-blue-400 hover:shadow-blue-100 hover:shadow-lg`,
        badge: "bg-blue-500 text-white",
        glow: "hover:shadow-blue-200",
      }
    case "Pro+":
      return {
        card: `${baseClasses} border-purple-200 hover:border-purple-400 hover:shadow-purple-200 hover:shadow-xl`,
        badge: "bg-purple-600 text-white",
        glow: "hover:shadow-purple-300",
      }
    case "Enterprise":
      return {
        card: `${baseClasses} border-yellow-300 hover:border-yellow-500 hover:shadow-yellow-200 hover:shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50`,
        badge: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold",
        glow: "hover:shadow-yellow-400",
      }
    case "XP_Level":
      return {
        card: `${baseClasses} border-rainbow bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 hover:shadow-rainbow hover:shadow-xl`,
        badge: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white animate-pulse",
        glow: "hover:shadow-rainbow",
      }
    case "Loyalty_NFT":
      return {
        card: `${baseClasses} border-rainbow bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 hover:shadow-rainbow hover:shadow-2xl animate-shimmer`,
        badge: "bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white animate-pulse font-bold",
        glow: "hover:shadow-rainbow",
      }
    default:
      return {
        card: baseClasses,
        badge: "bg-gray-500 text-white",
        glow: "",
      }
  }
}

export default function AgentGiftAssistantDashboard() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showLockedAssistants, setShowLockedAssistants] = useState(true)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [chatSessions, setChatSessions] = useState<Map<string, AssistantSession>>(new Map())
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const supabase = createClient()

  // Initialize data
  useEffect(() => {
    initializeData()
    loadUserProfile()
  }, [])

  const initializeData = async () => {
    try {
      // Check if assistants exist in database, if not, seed them
      const { data: existingAssistants } = await supabase.from("assistant_registry").select("*")

      if (!existingAssistants || existingAssistants.length === 0) {
        // Seed the database with assistant data
        const { error } = await supabase.from("assistant_registry").insert(
          ASSISTANT_DATA.map((assistant) => ({
            ...assistant,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
        )

        if (error) {
          console.error("Error seeding assistants:", error)
        }
      }

      // Load assistants
      const { data: assistantData } = await supabase
        .from("assistant_registry")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })

      if (assistantData) {
        setAssistants(assistantData)
      }
    } catch (error) {
      console.error("Error initializing data:", error)
      // Fallback to static data
      setAssistants(ASSISTANT_DATA as Assistant[])
    }
  }

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

        if (profile) {
          setUserProfile(profile)
          setIsAdmin(profile.role === "admin")
        } else {
          // Create default profile
          const defaultProfile = {
            id: user.id,
            tier: "Free",
            xp_level: 1,
            has_loyalty_nft: false,
          }

          const { error } = await supabase.from("user_profiles").insert([defaultProfile])

          if (!error) {
            setUserProfile(defaultProfile)
          }
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      // Fallback for demo
      setUserProfile({
        id: "demo-user",
        tier: "Pro",
        xp_level: 25,
        has_loyalty_nft: false,
      })
    }
  }

  const checkAssistantAccess = (assistant: Assistant): boolean => {
    if (!userProfile) return false

    switch (assistant.tier) {
      case "Free":
        return true
      case "Pro":
        return ["Pro", "Pro+", "Enterprise"].includes(userProfile.tier)
      case "Pro+":
        return ["Pro+", "Enterprise"].includes(userProfile.tier)
      case "Enterprise":
        return userProfile.tier === "Enterprise"
      case "XP_Level":
        return userProfile.xp_level >= (assistant.xp_level_required || 50)
      case "Loyalty_NFT":
        return userProfile.has_loyalty_nft
      default:
        return false
    }
  }

  const activateAssistant = async (assistant: Assistant) => {
    if (!checkAssistantAccess(assistant)) {
      toast({
        title: "Access Denied",
        description: `Upgrade to ${assistant.tier} to unlock this assistant`,
        variant: "destructive",
      })
      return
    }

    setSelectedAssistant(assistant)

    // Initialize chat session if not exists
    if (!chatSessions.has(assistant.id)) {
      const newSession: AssistantSession = {
        assistant_id: assistant.assistant_id,
        messages: [],
        is_active: true,
      }
      setChatSessions(new Map(chatSessions.set(assistant.id, newSession)))
    }

    toast({
      title: "Assistant Activated",
      description: `${assistant.name} is ready to help!`,
    })
  }

  const sendMessage = async () => {
    if (!selectedAssistant || !currentMessage.trim() || !userProfile) return

    setIsLoading(true)

    try {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      }

      const currentSession = chatSessions.get(selectedAssistant.id)
      if (currentSession) {
        currentSession.messages.push(userMessage)
        setChatSessions(new Map(chatSessions))
      }

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("route-assistant", {
        body: {
          assistant_id: selectedAssistant.assistant_id,
          user_id: userProfile.id,
          tier: userProfile.tier,
          xp_level: userProfile.xp_level,
          input: currentMessage,
        },
      })

      if (error) throw error

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm here to help! This is a simulated response for now.",
        timestamp: new Date(),
      }

      if (currentSession) {
        currentSession.messages.push(assistantMessage)
        setChatSessions(new Map(chatSessions))
      }

      setCurrentMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Bot
    return IconComponent
  }

  const filteredAssistants = assistants.filter((assistant) => {
    if (showLockedAssistants) return true
    return checkAssistantAccess(assistant)
  })

  const groupedAssistants = filteredAssistants.reduce(
    (groups, assistant) => {
      const category = assistant.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(assistant)
      return groups
    },
    {} as Record<string, Assistant[]>,
  )

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AgentGift Assistant Dashboard
                </h1>
                <p className="text-gray-600 mt-2">Connect with specialized AI assistants for every gifting need</p>
              </div>

              <div className="flex items-center gap-4">
                {userProfile && (
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {userProfile.tier} • Level {userProfile.xp_level}
                    </Badge>
                    {userProfile.has_loyalty_nft && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Loyalty NFT
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="show-locked" checked={showLockedAssistants} onCheckedChange={setShowLockedAssistants} />
                  <Label htmlFor="show-locked">Show Locked</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assistants Grid */}
            <div className="lg:col-span-2">
              {Object.entries(groupedAssistants).map(([category, categoryAssistants]) => (
                <div key={category} className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">{category}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryAssistants.map((assistant) => {
                      const isUnlocked = checkAssistantAccess(assistant)
                      const styling = getTierStyling(assistant.tier, isUnlocked)
                      const IconComponent = getIcon(assistant.icon)

                      return (
                        <motion.div
                          key={assistant.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className={`${styling.card} ${styling.glow} cursor-pointer relative overflow-hidden`}>
                            {!isUnlocked && (
                              <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center">
                                <Lock className="w-8 h-8 text-gray-500" />
                              </div>
                            )}

                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-12 h-12">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100">
                                      <IconComponent className="w-6 h-6 text-purple-600" />
                                    </AvatarFallback>
                                  </Avatar>

                                  <div>
                                    <CardTitle className="text-lg">{assistant.name}</CardTitle>
                                    <CardDescription className="text-sm">{assistant.description}</CardDescription>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <Badge className={styling.badge}>
                                    {assistant.tier === "XP_Level"
                                      ? `Level ${assistant.xp_level_required}+`
                                      : assistant.tier}
                                  </Badge>

                                  {assistant.voice_enabled && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Mic className="w-4 h-4 text-purple-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>Voice Enabled</TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {assistant.persona_hint && (
                                    <Badge variant="outline" className="text-xs">
                                      {assistant.persona_hint}
                                    </Badge>
                                  )}
                                </div>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => activateAssistant(assistant)}
                                      disabled={!isUnlocked}
                                      size="sm"
                                      className={
                                        isUnlocked
                                          ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                          : ""
                                      }
                                    >
                                      {isUnlocked ? (
                                        <>
                                          <MessageCircle className="w-4 h-4 mr-2" />
                                          Activate
                                        </>
                                      ) : (
                                        <>
                                          <Lock className="w-4 h-4 mr-2" />
                                          Locked
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isUnlocked
                                      ? `Start chatting with ${assistant.name}`
                                      : `Upgrade to ${assistant.tier} to unlock`}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Panel */}
            <div className="lg:col-span-1">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {selectedAssistant ? selectedAssistant.name : "Select an Assistant"}
                  </CardTitle>
                  {selectedAssistant && <CardDescription>{selectedAssistant.description}</CardDescription>}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {selectedAssistant ? (
                    <>
                      <ScrollArea className="flex-1 mb-4">
                        <div className="space-y-4">
                          {chatSessions.get(selectedAssistant.id)?.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.role === "user"
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="space-y-2">
                        <Textarea
                          placeholder={`Message ${selectedAssistant.name}...`}
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                          className="min-h-[80px]"
                        />

                        <Button
                          onClick={sendMessage}
                          disabled={!currentMessage.trim() || isLoading}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center">
                      <div>
                        <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Select an assistant to start chatting</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
