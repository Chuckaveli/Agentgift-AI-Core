"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  Gift,
  Languages,
  Star,
  Zap,
  Mic,
  Eye,
  Settings,
  RefreshCw,
  Tag,
  Link,
  Shield,
  Gamepad2,
  Search,
  TrendingUp,
  Bot,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TooltipProvider } from "@/components/ui/tooltip"
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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase-client"
import { toast } from "sonner"

// Enhanced AI Assistant Interface with Universal Tagging
interface UniversalAIAssistant {
  id: string
  name: string
  description: string
  assistant_id: string
  tier: "Free" | "Pro" | "Pro+" | "Enterprise"
  unlock_type: "tier" | "xp_level" | "loyalty_nft" | "seasonal" | "beta"
  unlock_requirement: number | null
  category: string
  icon: string
  persona_hint?: string
  voice_enabled: boolean
  is_active: boolean
  xp_reward: number

  // Universal Plugin Loader Tags
  type: "internal" | "user-facing" | "hybrid"
  tier_required: "Free" | "Pro" | "Pro+" | "Enterprise" | "NFT" | "XP_Unlock"
  voice_persona: boolean
  api_required: ("GPT" | "DeepInfra" | "ElevenLabs" | "Whisper" | "Fal")[]
  connected_features: string[]
  category_tag:
    | "Emotional Engine"
    | "Gifting Logic"
    | "Multilingual Voice"
    | "Seasonal Drop"
    | "Internal Bot"
    | "Game Engine"
    | "XP Controller"
  status: "active" | "seasonal" | "beta" | "maintenance"
  linked_to: {
    feature_slugs: string[]
    edge_functions: string[]
    xp_level: number | null
  }

  // Analytics & Performance
  interaction_count: number
  last_used: string | null
  performance_score: number
  user_satisfaction: number
  created_at: string
  updated_at: string
}

// Feature Connection Mapping
const FEATURE_CONNECTIONS = {
  asst_mDwC9xbBkSKPVoVpBYs4fbTw: {
    // Concierge Core
    connected_features: ["agent-gifty", "lumience-dev", "gift-concierge", "smart-search"],
    edge_functions: ["gift_suggestion_engine", "user_query_handler"],
    category_tag: "Gifting Logic" as const,
  },
  asst_nG0Wk33h0SJYiwGrs1DCVDme: {
    // Gift Engine Mastermind
    connected_features: ["gut-check", "gift-dna", "reveal", "smart-search"],
    edge_functions: ["gift_suggestion_engine", "gift_matching_engine"],
    category_tag: "Gifting Logic" as const,
  },
  asst_lCOoCbKoCEaZ6fcL1VZznURq: {
    // Love Language Listener
    connected_features: ["lumience-dev", "emotion-tags", "no-one-knows", "pride-alliance"],
    edge_functions: ["emotion_signature_injector", "emotional_filter_engine"],
    category_tag: "Emotional Engine" as const,
  },
  asst_OFoqYv80ueCqggzWEQywmYtg: {
    // Tokenomics XP Controller
    connected_features: ["tokenomics", "badges", "agentvault", "emotitokens", "daily-spin"],
    edge_functions: ["xp_unlock_status", "tier_management", "reward_distribution"],
    category_tag: "XP Controller" as const,
  },
  asst_nWRcJT1Oce8zw8nbOYSkaw1E: {
    // Agent Arya
    connected_features: ["cultural-respect", "culture/IN", "voice-rooms"],
    edge_functions: ["voice_persona_handler", "cultural_adaptation"],
    category_tag: "Multilingual Voice" as const,
  },
  asst_ZcWT3DmUVB9qRUk4yWNgP86: {
    // Agent Mei
    connected_features: ["cultural-respect", "culture/CN", "voice-rooms"],
    edge_functions: ["voice_persona_handler", "cultural_adaptation"],
    category_tag: "Multilingual Voice" as const,
  },
  asst_P6t69u4XrYa15UjkFENMLsf4: {
    // Agent Lola
    connected_features: ["cultural-respect", "culture/ES", "voice-rooms"],
    edge_functions: ["voice_persona_handler", "cultural_adaptation"],
    category_tag: "Multilingual Voice" as const,
  },
  asst_6wU3S0voUEQluQOpRg9lpdvm: {
    // Agent Zola
    connected_features: ["ghost-hunt", "thought-heist", "serendipity", "seasonal-drops"],
    edge_functions: ["chaos_advisor", "seasonal_unlock_handler"],
    category_tag: "Seasonal Drop" as const,
  },
  asst_AhdxKJOkBwuKEgrvqpbZJFH1: {
    // Occasion Mapper
    connected_features: ["business/custom-holidays", "cultural-respect", "group-gifting"],
    edge_functions: ["occasion_detection", "cultural_calendar"],
    category_tag: "Gifting Logic" as const,
  },
  asst_xSuf7lto2ooTwl6ANpfSHNbQ: {
    // Agent Identity Optimizer
    connected_features: ["characters", "persona-selector", "gift-dna"],
    edge_functions: ["persona_matching", "identity_optimization"],
    category_tag: "Internal Bot" as const,
  },
  asst_mVzUCLJMf8w34wEzuXGKuHLF: {
    // Knowledge Upload Bot
    connected_features: ["admin/feature-builder", "memory-vault", "analytics"],
    edge_functions: ["data_structuring", "knowledge_processing"],
    category_tag: "Internal Bot" as const,
  },
}

// API Requirements Mapping
const API_REQUIREMENTS = {
  voice_enabled: ["GPT", "ElevenLabs"],
  emotional_analysis: ["GPT", "DeepInfra"],
  image_generation: ["Fal", "DeepInfra"],
  speech_recognition: ["Whisper"],
  multilingual: ["GPT", "ElevenLabs"],
} as const

// Category Icons and Styling
const categoryConfig = {
  "Emotional Engine": {
    icon: Heart,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    gradient: "from-pink-500 to-rose-500",
  },
  "Gifting Logic": {
    icon: Gift,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    gradient: "from-purple-500 to-indigo-500",
  },
  "Multilingual Voice": {
    icon: Languages,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    gradient: "from-blue-500 to-cyan-500",
  },
  "Seasonal Drop": {
    icon: Star,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    gradient: "from-orange-500 to-yellow-500",
  },
  "Internal Bot": {
    icon: Bot,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    gradient: "from-gray-500 to-slate-500",
  },
  "Game Engine": {
    icon: Gamepad2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    gradient: "from-green-500 to-emerald-500",
  },
  "XP Controller": {
    icon: TrendingUp,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    gradient: "from-yellow-500 to-amber-500",
  },
}

// Tier Styling with Enhanced Effects
const tierStyles = {
  Free: {
    badge: "bg-gray-500 text-white",
    card: "border-gray-200 hover:border-gray-300",
    glow: "",
    animation: "",
    overlay: "",
  },
  Pro: {
    badge: "bg-blue-500 text-white",
    card: "border-blue-200 hover:border-blue-400 hover:shadow-blue-100",
    glow: "hover:shadow-lg hover:shadow-blue-200/50",
    animation: "",
    overlay: "bg-gradient-to-br from-blue-500/5 to-transparent",
  },
  "Pro+": {
    badge: "bg-purple-600 text-white",
    card: "border-purple-200 hover:border-purple-400 hover:shadow-purple-200",
    glow: "hover:shadow-xl hover:shadow-purple-300/50",
    animation: "animate-pulse-slow",
    overlay: "bg-gradient-to-br from-purple-500/10 to-pink-500/5",
  },
  Enterprise: {
    badge: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold",
    card: "border-yellow-300 hover:border-yellow-500 bg-gradient-to-br from-yellow-50/50 to-orange-50/50",
    glow: "hover:shadow-2xl hover:shadow-yellow-400/30",
    animation: "animate-shimmer",
    overlay: "bg-gradient-to-br from-yellow-400/10 to-orange-400/10",
  },
}

// Status Indicators
const statusConfig = {
  active: { color: "text-green-600", bg: "bg-green-100", label: "Active" },
  seasonal: { color: "text-orange-600", bg: "bg-orange-100", label: "Seasonal" },
  beta: { color: "text-blue-600", bg: "bg-blue-100", label: "Beta" },
  maintenance: { color: "text-red-600", bg: "bg-red-100", label: "Maintenance" },
}

interface UniversalAIPluginLoaderProps {
  className?: string
  showAdminControls?: boolean
  autoRefresh?: boolean
}

export function UniversalAIPluginLoader({
  className = "",
  showAdminControls = false,
  autoRefresh = true,
}: UniversalAIPluginLoaderProps) {
  const [assistants, setAssistants] = useState<UniversalAIAssistant[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<UniversalAIAssistant | null>(null)

  const supabase = createClient()

  useEffect(() => {
    initializeUniversalSystem()
    loadUserProfile()
  }, [])

  // Auto-refresh system
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      syncUniversalRegistry()
    }, 30000) // Sync every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel("universal_ai_system")
      .on("postgres_changes", { event: "*", schema: "public", table: "assistant_registry" }, () => {
        syncUniversalRegistry()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "agentgift_features" }, () => {
        syncFeatureConnections()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  const initializeUniversalSystem = async () => {
    try {
      setLoading(true)
      await syncUniversalRegistry()
      await syncFeatureConnections()
      await updateAssistantTags()
    } catch (error) {
      console.error("Error initializing universal system:", error)
      toast.error("Failed to initialize AI Plugin Loader")
    } finally {
      setLoading(false)
    }
  }

  const syncUniversalRegistry = async () => {
    try {
      setSyncing(true)

      const { data, error } = await supabase.functions.invoke("assistant_registry_fetch", {
        body: { action: "fetch_universal" },
      })

      if (error) throw error

      // Transform data with universal tags
      const enhancedAssistants = data.assistants.map((assistant: any) => enhanceAssistantWithUniversalTags(assistant))

      setAssistants(enhancedAssistants)
      toast.success("Universal registry synced")
    } catch (error) {
      console.error("Error syncing registry:", error)
      toast.error("Failed to sync universal registry")
    } finally {
      setSyncing(false)
    }
  }

  const enhanceAssistantWithUniversalTags = (assistant: any): UniversalAIAssistant => {
    const connections = FEATURE_CONNECTIONS[assistant.assistant_id as keyof typeof FEATURE_CONNECTIONS]

    // Determine type based on connections and usage
    let type: "internal" | "user-facing" | "hybrid" = "user-facing"
    if (connections?.connected_features.some((f) => f.includes("admin"))) {
      type = "internal"
    } else if (connections?.connected_features.length > 2) {
      type = "hybrid"
    }

    // Determine API requirements
    const apiRequired: ("GPT" | "DeepInfra" | "ElevenLabs" | "Whisper" | "Fal")[] = ["GPT"]
    if (assistant.voice_enabled) {
      apiRequired.push("ElevenLabs")
    }
    if (assistant.persona_hint) {
      apiRequired.push("Whisper")
    }

    // Determine status
    let status: "active" | "seasonal" | "beta" | "maintenance" = "active"
    if (assistant.name.includes("Zola")) status = "seasonal"
    if (assistant.name.includes("Beta")) status = "beta"
    if (!assistant.is_active) status = "maintenance"

    return {
      ...assistant,
      type,
      tier_required:
        assistant.unlock_type === "loyalty_nft"
          ? "NFT"
          : assistant.unlock_type === "xp_level"
            ? "XP_Unlock"
            : assistant.tier,
      voice_persona: assistant.voice_enabled,
      api_required: apiRequired,
      connected_features: connections?.connected_features || [],
      category_tag: connections?.category_tag || "Internal Bot",
      status,
      linked_to: {
        feature_slugs: connections?.connected_features || [],
        edge_functions: connections?.edge_functions || [],
        xp_level: assistant.unlock_requirement,
      },
      performance_score: Math.random() * 100, // Mock data
      user_satisfaction: Math.random() * 5, // Mock data
    }
  }

  const syncFeatureConnections = async () => {
    try {
      // Sync with agentgift_features table
      const { data: features } = await supabase.from("agentgift_features").select("*").eq("is_active", true)

      // Update assistant connections based on active features
      if (features) {
        const updatedAssistants = assistants.map((assistant) => {
          const connectedFeatures = features
            .filter((feature) =>
              assistant.connected_features.some(
                (cf) => feature.route_path.includes(cf) || feature.feature_name.toLowerCase().includes(cf),
              ),
            )
            .map((f) => f.feature_name)

          return {
            ...assistant,
            connected_features: [...new Set([...assistant.connected_features, ...connectedFeatures])],
          }
        })

        setAssistants(updatedAssistants)
      }
    } catch (error) {
      console.error("Error syncing feature connections:", error)
    }
  }

  const updateAssistantTags = async () => {
    if (!isAdmin) return

    try {
      // Update Supabase with universal tags
      for (const assistant of assistants) {
        await supabase
          .from("assistant_registry")
          .update({
            type: assistant.type,
            category_tag: assistant.category_tag,
            status: assistant.status,
            api_required: assistant.api_required,
            connected_features: assistant.connected_features,
            updated_at: new Date().toISOString(),
          })
          .eq("id", assistant.id)
      }

      toast.success("Universal tags updated")
    } catch (error) {
      console.error("Error updating tags:", error)
      toast.error("Failed to update universal tags")
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
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const toggleAssistantStatus = async (assistantId: string, currentStatus: boolean) => {
    if (!isAdmin) {
      toast.error("Admin access required")
      return
    }

    try {
      const { error } = await supabase
        .from("assistant_registry")
        .update({
          is_active: !currentStatus,
          status: !currentStatus ? "active" : "maintenance",
          updated_at: new Date().toISOString(),
        })
        .eq("id", assistantId)

      if (error) throw error

      toast.success(`Assistant ${!currentStatus ? "activated" : "deactivated"}`)
      syncUniversalRegistry()
    } catch (error) {
      console.error("Error toggling assistant:", error)
      toast.error("Failed to update assistant")
    }
  }

  const forceUnlockAssistant = async (assistantId: string) => {
    if (!isAdmin) {
      toast.error("Admin access required")
      return
    }

    try {
      // Create temporary unlock for testing
      const { error } = await supabase.from("assistant_overrides").upsert({
        assistant_id: assistantId,
        user_id: userProfile?.id,
        override_type: "force_unlock",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })

      if (error) throw error

      toast.success("Assistant temporarily unlocked for testing")
    } catch (error) {
      console.error("Error force unlocking:", error)
      toast.error("Failed to force unlock assistant")
    }
  }

  // Filtered assistants
  const filteredAssistants = useMemo(() => {
    return assistants.filter((assistant) => {
      if (
        searchQuery &&
        !assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !assistant.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      if (selectedCategory !== "all" && assistant.category_tag !== selectedCategory) {
        return false
      }

      if (selectedType !== "all" && assistant.type !== selectedType) {
        return false
      }

      if (selectedStatus !== "all" && assistant.status !== selectedStatus) {
        return false
      }

      if (!showInactive && !assistant.is_active && !isAdmin) {
        return false
      }

      return true
    })
  }, [assistants, searchQuery, selectedCategory, selectedType, selectedStatus, showInactive, isAdmin])

  // Group by category
  const groupedAssistants = useMemo(() => {
    const groups: Record<string, UniversalAIAssistant[]> = {}

    filteredAssistants.forEach((assistant) => {
      const category = assistant.category_tag
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(assistant)
    })

    return groups
  }, [filteredAssistants])

  const UniversalAssistantCard = ({ assistant }: { assistant: UniversalAIAssistant }) => {
    const categoryStyle = categoryConfig[assistant.category_tag]
    const tierStyle = tierStyles[assistant.tier as keyof typeof tierStyles]
    const statusStyle = statusConfig[assistant.status]
    const CategoryIcon = categoryStyle.icon

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        className={`group relative ${tierStyle.glow}`}
      >
        <Card className={`h-full transition-all duration-300 ${tierStyle.card} ${tierStyle.animation}`}>
          {/* Tier Overlay */}
          <div className={`absolute inset-0 rounded-lg ${tierStyle.overlay} pointer-events-none`} />

          {/* Admin Controls */}
          {isAdmin && (
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              <Switch
                checked={assistant.is_active}
                onCheckedChange={() => toggleAssistantStatus(assistant.id, assistant.is_active)}
                size="sm"
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => forceUnlockAssistant(assistant.id)}
              >
                <Shield className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Status Indicator */}
          <div className="absolute top-2 left-2 z-10">
            <Badge className={`${statusStyle.bg} ${statusStyle.color} text-xs`}>{statusStyle.label}</Badge>
          </div>

          <CardHeader className="pb-3 pt-8">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className={`${categoryStyle.bgColor} ${categoryStyle.borderColor} border-2`}>
                  <CategoryIcon className={`w-6 h-6 ${categoryStyle.color}`} />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold truncate flex items-center gap-2">
                  {assistant.name}
                  {assistant.voice_persona && <Mic className="w-3 h-3 text-purple-500" />}
                  {assistant.type === "hybrid" && <Link className="w-3 h-3 text-blue-500" />}
                  {assistant.type === "internal" && <Eye className="w-3 h-3 text-gray-500" />}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">{assistant.description}</CardDescription>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-3">
              <Badge className={`${tierStyle.badge} text-xs`}>{assistant.tier_required}</Badge>
              <Badge variant="outline" className="text-xs">
                {assistant.type}
              </Badge>
              {assistant.api_required.map((api) => (
                <Badge key={api} variant="secondary" className="text-xs">
                  {api}
                </Badge>
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Connected Features */}
            <div className="mb-3">
              <Label className="text-xs font-medium text-gray-600">Connected Features</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {assistant.connected_features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {assistant.connected_features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{assistant.connected_features.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="text-center p-1 bg-gray-50 rounded">
                <div className="font-semibold">{assistant.interaction_count}</div>
                <div className="text-gray-500">Uses</div>
              </div>
              <div className="text-center p-1 bg-gray-50 rounded">
                <div className="font-semibold">{Math.round(assistant.performance_score)}%</div>
                <div className="text-gray-500">Score</div>
              </div>
            </div>

            {/* Action Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className={`w-full bg-gradient-to-r ${categoryStyle.gradient} text-white hover:opacity-90`}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CategoryIcon className="w-5 h-5" />
                    {assistant.name} - Universal Configuration
                  </DialogTitle>
                  <DialogDescription>
                    Manage connections, settings, and performance for this AI assistant
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="connections">Connections</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Universal Tags</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Type</Label>
                            <Badge variant="outline">{assistant.type}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Category</Label>
                            <Badge className={`${categoryStyle.bg} ${categoryStyle.color}`}>
                              {assistant.category_tag}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Status</Label>
                            <Badge className={`${statusStyle.bg} ${statusStyle.color}`}>{statusStyle.label}</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">API Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {assistant.api_required.map((api) => (
                              <Badge key={api} variant="secondary" className="text-xs">
                                {api}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="connections" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Connected Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-32">
                            <div className="space-y-1">
                              {assistant.connected_features.map((feature) => (
                                <div key={feature} className="flex items-center justify-between p-1 rounded bg-gray-50">
                                  <span className="text-xs">{feature}</span>
                                  <Link className="w-3 h-3 text-blue-500" />
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Edge Functions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-32">
                            <div className="space-y-1">
                              {assistant.linked_to.edge_functions.map((func) => (
                                <div key={func} className="flex items-center justify-between p-1 rounded bg-gray-50">
                                  <span className="text-xs">{func}</span>
                                  <Zap className="w-3 h-3 text-yellow-500" />
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{assistant.interaction_count}</div>
                          <div className="text-xs text-gray-500">Total Interactions</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{Math.round(assistant.performance_score)}%</div>
                          <Progress value={assistant.performance_score} className="mt-1" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Satisfaction</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{assistant.user_satisfaction.toFixed(1)}/5</div>
                          <div className="flex gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.round(assistant.user_satisfaction)
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    {isAdmin && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Active Status</Label>
                          <Switch
                            checked={assistant.is_active}
                            onCheckedChange={() => toggleAssistantStatus(assistant.id, assistant.is_active)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Voice Enabled</Label>
                          <Switch checked={assistant.voice_persona} disabled />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label>Override Controls</Label>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => forceUnlockAssistant(assistant.id)}>
                              <Shield className="w-3 h-3 mr-1" />
                              Force Unlock
                            </Button>
                            <Button size="sm" variant="outline">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Reset Stats
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DialogContent>
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
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Universal AI Plugin Loader
            </h1>
            <p className="text-gray-600 mt-1">Auto-sync and manage all AgentGift AI assistants across the ecosystem</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={syncUniversalRegistry} disabled={syncing}>
              <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync"}
            </Button>

            {isAdmin && (
              <Button size="sm" onClick={updateAssistantTags} className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Tag className="w-4 h-4 mr-1" />
                Update Tags
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search assistants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(categoryConfig).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="user-facing">User-Facing</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
                  <Label htmlFor="show-inactive" className="text-sm">
                    Show All
                  </Label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assistant Grid by Category */}
        <div className="space-y-8">
          {Object.entries(groupedAssistants).map(([category, categoryAssistants]) => {
            const categoryStyle = categoryConfig[category as keyof typeof categoryConfig]
            const CategoryIcon = categoryStyle.icon

            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${categoryStyle.bgColor} ${categoryStyle.borderColor} border`}>
                    <CategoryIcon className={`w-5 h-5 ${categoryStyle.color}`} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">{category}</h2>
                  <Badge variant="outline" className="ml-2">
                    {categoryAssistants.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {categoryAssistants.map((assistant) => (
                      <UniversalAssistantCard key={assistant.id} assistant={assistant} />
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
              <Bot className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No assistants found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  )
}
