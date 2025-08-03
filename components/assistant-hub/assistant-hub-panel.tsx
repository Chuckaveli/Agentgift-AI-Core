"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  SortAsc,
  SortDesc,
  Lock,
  Zap,
  Brain,
  Heart,
  Gift,
  Calendar,
  Users,
  Coins,
  Globe,
  MessageCircle,
  BarChart3,
  EyeOff,
  Star,
  TrendingUp,
  Activity,
  Mic,
  Languages,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase-client"
import { toast } from "sonner"

// Types
interface Assistant {
  id: string
  name: string
  description: string
  assistant_id: string
  tier: "Free" | "Pro" | "Pro+" | "Enterprise"
  unlock_type: "tier" | "xp_level" | "loyalty_nft"
  unlock_requirement: number | null
  category: string
  icon: string
  persona_hint?: string
  voice_enabled: boolean
  is_active: boolean
  xp_reward: number
  interaction_count: number
  last_used: string | null
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  email: string
  tier: "Free" | "Pro" | "Pro+" | "Enterprise"
  xp_level: number
  xp_points: number
  level: number
  has_loyalty_nft: boolean
  loyalty_nfts: string[]
  role: string
  created_at: string
}

interface AssistantStats {
  total_interactions: number
  unique_users: number
  avg_rating: number
  tokens_used: number
  cost: number
}

// Category icons mapping
const categoryIcons = {
  "Core Logic": Brain,
  "Emotion Matching": Heart,
  "XP/Rewards": Coins,
  "Language Voice Bots": Languages,
  "Gift Recommendations": Gift,
  "Occasion Planning": Calendar,
  "Persona Matching": Users,
  "Data Processing": Activity,
  "Cultural Intelligence": Globe,
  Special: Star,
  Psychology: Heart,
  Economy: TrendingUp,
  Planning: Calendar,
  Personas: Users,
  "Core Engine": Brain,
  "Cultural Personas": Globe,
}

// Tier styling configurations
const tierStyles = {
  Free: {
    badge: "bg-gray-500 text-white",
    card: "border-gray-200 hover:border-gray-300",
    glow: "",
    animation: "",
  },
  Pro: {
    badge: "bg-blue-500 text-white",
    card: "border-blue-200 hover:border-blue-400 hover:shadow-blue-100",
    glow: "hover:shadow-lg hover:shadow-blue-200/50",
    animation: "",
  },
  "Pro+": {
    badge: "bg-purple-600 text-white",
    card: "border-purple-200 hover:border-purple-400 hover:shadow-purple-200",
    glow: "hover:shadow-xl hover:shadow-purple-300/50",
    animation: "animate-pulse-slow",
  },
  Enterprise: {
    badge: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold",
    card: "border-yellow-300 hover:border-yellow-500 bg-gradient-to-br from-yellow-50/50 to-orange-50/50",
    glow: "hover:shadow-2xl hover:shadow-yellow-400/30",
    animation: "animate-shimmer",
  },
}

// Pre-seeded assistant data
const ASSISTANT_SEED_DATA = [
  {
    name: "Concierge Core",
    description: "Central Intelligence Hub for comprehensive gift planning",
    assistant_id: "asst_mDwC9xbBkSKPVoVpBYs4fbTw",
    tier: "Pro+",
    unlock_type: "tier",
    category: "Core Logic",
    icon: "Brain",
    voice_enabled: true,
    xp_reward: 20,
  },
  {
    name: "Gift Engine Mastermind",
    description: "Ultimate AI-powered gift recommendation engine",
    assistant_id: "asst_nG0Wk33h0SJYiwGrs1DCVDme",
    tier: "Pro+",
    unlock_type: "tier",
    category: "Gift Recommendations",
    icon: "Gift",
    voice_enabled: true,
    xp_reward: 25,
  },
  {
    name: "Love Language Listener",
    description: "Emotional intelligence for perfect gift matching",
    assistant_id: "asst_lCOoCbKoCEaZ6fcL1VZznURq",
    tier: "Free",
    unlock_type: "tier",
    category: "Emotion Matching",
    icon: "Heart",
    voice_enabled: true,
    xp_reward: 10,
  },
  {
    name: "Tokenomics XP Controller",
    description: "Advanced economy and reward management system",
    assistant_id: "asst_OFoqYv80ueCqggzWEQywmYtg",
    tier: "Enterprise",
    unlock_type: "tier",
    category: "XP/Rewards",
    icon: "Coins",
    voice_enabled: false,
    xp_reward: 50,
  },
  {
    name: "Occasion Mapper",
    description: "Giftworthy date decoder and event planner",
    assistant_id: "asst_AhdxKJOkBwuKEgrvqpbZJFH1",
    tier: "Pro",
    unlock_type: "tier",
    category: "Occasion Planning",
    icon: "Calendar",
    voice_enabled: false,
    xp_reward: 15,
  },
  {
    name: "Agent Identity Optimizer",
    description: "Persona matcher for optimal gift personalization",
    assistant_id: "asst_xSuf7lto2ooTwl6ANpfSHNbQ",
    tier: "Pro+",
    unlock_type: "tier",
    category: "Persona Matching",
    icon: "Users",
    voice_enabled: true,
    xp_reward: 20,
  },
  {
    name: "Knowledge Upload Bot",
    description: "Data structuring for enhanced AI responses",
    assistant_id: "asst_mVzUCLJMf8w34wEzuXGKuHLF",
    tier: "Pro+",
    unlock_type: "tier",
    category: "Data Processing",
    icon: "Activity",
    voice_enabled: false,
    xp_reward: 15,
  },
  {
    name: "Agent Zola",
    description: "Chaos Concierge for unique gift solutions",
    assistant_id: "asst_6wU3S0voUEQluQOpRg9lpdvm",
    tier: "Pro+",
    unlock_type: "loyalty_nft",
    category: "Special",
    icon: "Star",
    persona_hint: "chaos",
    voice_enabled: true,
    xp_reward: 30,
  },
  {
    name: "Agent Lola",
    description: "Spanish gifting persona and cultural expert",
    assistant_id: "asst_P6t69u4XrYa15UjkFENMLsf4",
    tier: "Pro+",
    unlock_type: "tier",
    category: "Language Voice Bots",
    icon: "Languages",
    persona_hint: "spanish",
    voice_enabled: true,
    xp_reward: 20,
  },
  {
    name: "Agent Arya",
    description: "Hindi gifting persona for Indian traditions",
    assistant_id: "asst_nWRcJT1Oce8zw8nbOYSkaw1E",
    tier: "Pro+",
    unlock_type: "xp_level",
    unlock_requirement: 50,
    category: "Language Voice Bots",
    icon: "Languages",
    persona_hint: "hindi",
    voice_enabled: true,
    xp_reward: 25,
  },
  {
    name: "Agent Mei",
    description: "Chinese gifting persona and cultural intelligence",
    assistant_id: "asst_ZcWT3DmUVB9qRUk4yWNgP86",
    tier: "Pro+",
    unlock_type: "xp_level",
    unlock_requirement: 50,
    category: "Language Voice Bots",
    icon: "Languages",
    persona_hint: "chinese",
    voice_enabled: true,
    xp_reward: 25,
  },
]

interface AssistantHubPanelProps {
  className?: string
  showAdminControls?: boolean
}

export function AssistantHubPanel({ className = "", showAdminControls = false }: AssistantHubPanelProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "category" | "tier" | "created_at">("category")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showInactive, setShowInactive] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [assistantStats, setAssistantStats] = useState<Record<string, AssistantStats>>({})
  const [isAdmin, setIsAdmin] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    initializeData()
    loadUserProfile()
  }, [])

  // Real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel("assistant_registry_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assistant_registry",
        },
        (payload) => {
          console.log("Assistant registry updated:", payload)
          fetchAssistants()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)

      // Check if assistants exist, if not seed them
      const { data: existingAssistants } = await supabase.from("assistant_registry").select("*").limit(1)

      if (!existingAssistants || existingAssistants.length === 0) {
        await seedAssistants()
      }

      await fetchAssistants()
      await fetchAssistantStats()
    } catch (error) {
      console.error("Error initializing data:", error)
      toast.error("Failed to load assistant data")
    } finally {
      setLoading(false)
    }
  }

  const seedAssistants = async () => {
    try {
      const { error } = await supabase.functions.invoke("assistant_registry_fetch", {
        body: { action: "seed", data: ASSISTANT_SEED_DATA },
      })

      if (error) {
        console.error("Error seeding assistants:", error)
        // Fallback to direct insert
        const seedData = ASSISTANT_SEED_DATA.map((assistant) => ({
          ...assistant,
          is_active: true,
          interaction_count: 0,
          last_used: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        const { error: insertError } = await supabase.from("assistant_registry").insert(seedData)

        if (insertError) {
          console.error("Fallback insert error:", insertError)
        }
      }
    } catch (error) {
      console.error("Error in seedAssistants:", error)
    }
  }

  const fetchAssistants = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("assistant_registry_fetch", {
        body: { action: "fetch_all" },
      })

      if (error) {
        console.error("Edge function error:", error)
        // Fallback to direct query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("assistant_registry")
          .select("*")
          .order("category", { ascending: true })

        if (fallbackError) {
          throw fallbackError
        }

        setAssistants(fallbackData || [])
      } else {
        setAssistants(data.assistants || [])
      }
    } catch (error) {
      console.error("Error fetching assistants:", error)
      toast.error("Failed to fetch assistants")
    }
  }

  const fetchAssistantStats = async () => {
    try {
      const { data, error } = await supabase.from("assistant_interactions").select("assistant_id, tokens_used, cost")

      if (error) throw error

      const stats: Record<string, AssistantStats> = {}

      data?.forEach((interaction) => {
        if (!stats[interaction.assistant_id]) {
          stats[interaction.assistant_id] = {
            total_interactions: 0,
            unique_users: 0,
            avg_rating: 0,
            tokens_used: 0,
            cost: 0,
          }
        }

        stats[interaction.assistant_id].total_interactions++
        stats[interaction.assistant_id].tokens_used += interaction.tokens_used || 0
        stats[interaction.assistant_id].cost += Number.parseFloat(interaction.cost?.toString() || "0")
      })

      setAssistantStats(stats)
    } catch (error) {
      console.error("Error fetching assistant stats:", error)
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
          setIsAdmin(profile.role === "admin" || profile.email === "admin@agentgift.ai")
        } else {
          // Create default profile
          const defaultProfile = {
            id: user.id,
            email: user.email || "",
            tier: "Free" as const,
            xp_level: 1,
            xp_points: 0,
            level: 1,
            has_loyalty_nft: false,
            loyalty_nfts: [],
            role: "user",
          }

          const { error } = await supabase.from("user_profiles").insert([defaultProfile])

          if (!error) {
            setUserProfile(defaultProfile)
          }
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      // Demo fallback
      setUserProfile({
        id: "demo-user",
        email: "demo@agentgift.ai",
        tier: "Pro",
        xp_level: 25,
        xp_points: 2500,
        level: 25,
        has_loyalty_nft: false,
        loyalty_nfts: [],
        role: "user",
        created_at: new Date().toISOString(),
      })
    }
  }

  const hasAccess = (assistant: Assistant): boolean => {
    if (!userProfile) return assistant.tier === "Free"

    switch (assistant.unlock_type) {
      case "tier":
        const tierHierarchy = { Free: 0, Pro: 1, "Pro+": 2, Enterprise: 3 }
        const userTierLevel = tierHierarchy[userProfile.tier]
        const requiredTierLevel = tierHierarchy[assistant.tier as keyof typeof tierHierarchy]
        return userTierLevel >= requiredTierLevel

      case "xp_level":
        return userProfile.level >= (assistant.unlock_requirement || 0)

      case "loyalty_nft":
        return userProfile.has_loyalty_nft || userProfile.loyalty_nfts.length > 0

      default:
        return false
    }
  }

  const getUnlockProgress = (assistant: Assistant): number => {
    if (!userProfile || hasAccess(assistant)) return 100

    if (assistant.unlock_type === "xp_level" && assistant.unlock_requirement) {
      return Math.min(100, (userProfile.level / assistant.unlock_requirement) * 100)
    }

    return 0
  }

  const toggleAssistantActive = async (assistantId: string, currentState: boolean) => {
    if (!isAdmin) {
      toast.error("Admin access required")
      return
    }

    try {
      const { error } = await supabase
        .from("assistant_registry")
        .update({
          is_active: !currentState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assistantId)

      if (error) throw error

      toast.success(`Assistant ${!currentState ? "activated" : "deactivated"}`)
      fetchAssistants()
    } catch (error) {
      console.error("Error toggling assistant:", error)
      toast.error("Failed to update assistant")
    }
  }

  const activateAssistant = async (assistant: Assistant) => {
    if (!hasAccess(assistant)) {
      toast.error(`Upgrade to ${assistant.tier} to unlock this assistant`)
      return
    }

    if (!userProfile) {
      toast.error("Please log in to use assistants")
      return
    }

    try {
      // Log interaction
      const { error } = await supabase.from("assistant_interactions").insert([
        {
          user_id: userProfile.id,
          assistant_id: assistant.assistant_id,
          input_message: "Assistant activated",
          user_tier: userProfile.tier,
          user_xp_level: userProfile.level,
        },
      ])

      if (error) throw error

      // Award XP
      const { error: xpError } = await supabase.rpc("add_user_xp", {
        user_id: userProfile.id,
        xp_amount: assistant.xp_reward,
        reason: `Used ${assistant.name}`,
      })

      if (xpError) {
        console.error("XP award error:", xpError)
      }

      toast.success(`${assistant.name} activated! +${assistant.xp_reward} XP`)
      setSelectedAssistant(assistant)
    } catch (error) {
      console.error("Error activating assistant:", error)
      toast.error("Failed to activate assistant")
    }
  }

  // Filtered and sorted assistants
  const filteredAssistants = useMemo(() => {
    const filtered = assistants.filter((assistant) => {
      // Search filter
      if (
        searchQuery &&
        !assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !assistant.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Category filter
      if (selectedCategory !== "all" && assistant.category !== selectedCategory) {
        return false
      }

      // Active/inactive filter
      if (!showInactive && !assistant.is_active && !isAdmin) {
        return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]

      if (sortBy === "created_at") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [assistants, searchQuery, selectedCategory, showInactive, sortBy, sortOrder, isAdmin])

  // Group assistants by category
  const groupedAssistants = useMemo(() => {
    const groups: Record<string, Assistant[]> = {}

    filteredAssistants.forEach((assistant) => {
      if (!groups[assistant.category]) {
        groups[assistant.category] = []
      }
      groups[assistant.category].push(assistant)
    })

    return groups
  }, [filteredAssistants])

  const categories = useMemo(() => {
    return Array.from(new Set(assistants.map((a) => a.category)))
  }, [assistants])

  const AssistantCard = ({ assistant }: { assistant: Assistant }) => {
    const hasUserAccess = hasAccess(assistant)
    const unlockProgress = getUnlockProgress(assistant)
    const styling = tierStyles[assistant.tier as keyof typeof tierStyles]
    const CategoryIcon = categoryIcons[assistant.category as keyof typeof categoryIcons] || Brain
    const stats = assistantStats[assistant.assistant_id]

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: hasUserAccess ? -4 : 0 }}
        className={`group relative ${styling.glow}`}
      >
        <Card
          className={`h-full transition-all duration-300 ${styling.card} ${
            !hasUserAccess ? "opacity-70" : ""
          } ${!assistant.is_active ? "border-red-200 bg-red-50/30" : ""}`}
        >
          {/* Admin Controls */}
          {isAdmin && (
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              <Switch
                checked={assistant.is_active}
                onCheckedChange={() => toggleAssistantActive(assistant.id, assistant.is_active)}
                size="sm"
              />
              {!assistant.is_active && (
                <Badge variant="destructive" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
          )}

          {/* Lock Overlay */}
          {!hasUserAccess && (
            <div className="absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center z-5">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                <Lock className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100">
                    <CategoryIcon className="w-5 h-5 text-purple-600" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-semibold truncate">{assistant.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{assistant.description}</CardDescription>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Badge className={`${styling.badge} text-xs`}>{assistant.tier}</Badge>

                {assistant.voice_enabled && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Mic className="w-3 h-3 text-purple-500" />
                    </TooltipTrigger>
                    <TooltipContent>Voice Enabled</TooltipContent>
                  </Tooltip>
                )}

                {assistant.persona_hint && (
                  <Badge variant="outline" className="text-xs">
                    {assistant.persona_hint}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                {assistant.xp_reward}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Unlock Progress */}
            {!hasUserAccess && unlockProgress > 0 && unlockProgress < 100 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(unlockProgress)}%</span>
                </div>
                <Progress value={unlockProgress} className="h-1" />
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="text-center p-1 bg-gray-50 rounded">
                  <div className="font-semibold">{stats.total_interactions}</div>
                  <div className="text-gray-500">Uses</div>
                </div>
                <div className="text-center p-1 bg-gray-50 rounded">
                  <div className="font-semibold">{stats.tokens_used}</div>
                  <div className="text-gray-500">Tokens</div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={!hasUserAccess || !assistant.is_active}
                  className={`w-full ${
                    hasUserAccess && assistant.is_active
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      : ""
                  }`}
                >
                  {!assistant.is_active ? (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  ) : !hasUserAccess ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Activate
                    </>
                  )}
                </Button>
              </DialogTrigger>

              {hasUserAccess && assistant.is_active && (
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CategoryIcon className="w-5 h-5" />
                      {assistant.name}
                    </DialogTitle>
                    <DialogDescription>{assistant.description}</DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="stats">Statistics</TabsTrigger>
                      <TabsTrigger value="activate">Activate</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Tier</Label>
                          <Badge className={styling.badge}>{assistant.tier}</Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">XP Reward</Label>
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span>{assistant.xp_reward}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Category</Label>
                          <p className="text-sm">{assistant.category}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Features</Label>
                          <div className="flex gap-1">
                            {assistant.voice_enabled && (
                              <Badge variant="outline" className="text-xs">
                                <Mic className="w-3 h-3 mr-1" />
                                Voice
                              </Badge>
                            )}
                            {assistant.persona_hint && (
                              <Badge variant="outline" className="text-xs">
                                {assistant.persona_hint}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-4">
                      {stats ? (
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Total Uses</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{stats.total_interactions}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Tokens Used</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{stats.tokens_used.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No usage statistics available</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="activate" className="space-y-4">
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <CategoryIcon className="w-16 h-16 mx-auto text-purple-500 mb-2" />
                          <h3 className="text-lg font-semibold">Ready to activate {assistant.name}?</h3>
                          <p className="text-gray-600">You'll earn {assistant.xp_reward} XP for using this assistant</p>
                        </div>

                        <Button
                          onClick={() => activateAssistant(assistant)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Activate Assistant
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              )}
            </Dialog>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Assistant Hub
            </h1>
            <p className="text-gray-600 mt-1">Discover and activate AI assistants for every gifting need</p>
          </div>

          {userProfile && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{userProfile.tier}</Badge>
                <Badge variant="outline">Level {userProfile.level}</Badge>
              </div>
              <div className="text-sm text-gray-500">{userProfile.xp_points.toLocaleString()} XP</div>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assistants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="tier">Tier</SelectItem>
                  <SelectItem value="created_at">Date</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>

              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
                  <Label htmlFor="show-inactive" className="text-sm">
                    Show Inactive
                  </Label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assistant Grid */}
        <div className="space-y-8">
          {Object.entries(groupedAssistants).map(([category, categoryAssistants]) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Brain

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <CategoryIcon className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-800">{category}</h2>
                  <Badge variant="outline" className="ml-2">
                    {categoryAssistants.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {categoryAssistants.map((assistant) => (
                      <AssistantCard key={assistant.id} assistant={assistant} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>

        {/* No Results */}
        {filteredAssistants.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Brain className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No assistants found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  )
}
