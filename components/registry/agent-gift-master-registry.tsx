"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Sparkles,
  Users,
  Building,
  Brain,
  Gamepad2,
  ExternalLink,
  Lock,
  Edit,
  Plus,
  Mic,
  Crown,
  Star,
} from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Enhanced types with forward compatibility
interface AgentGiftFeature {
  id: string
  feature_name: string
  description: string
  tier_access: "Free" | "Pro" | "Pro+" | "Enterprise"
  category: "Games" | "Individual User Tools" | "Business Features" | "AI/Admin Systems"
  route_path: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Forward compatibility fields
  xp_value?: number
  persona_hint?: "Zola" | "Galen" | "Arya" | "Zyxen"
  lottie_url?: string
  is_gamified?: boolean
  unlock_xp_required?: number
}

interface UserProfile {
  id: string
  tier: string
  xp_points: number
  is_admin: boolean
  email: string
}

// Tier configurations with enhanced styling
const tierConfig = {
  Free: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    hoverColor: "hover:bg-gray-200",
    cardStyle: "border-gray-200 hover:border-gray-300",
    icon: null,
    gradient: "",
  },
  Pro: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    hoverColor: "hover:bg-blue-200",
    cardStyle: "border-blue-200 hover:border-blue-400 hover:shadow-blue-100",
    icon: <Star className="w-3 h-3 ml-1" />,
    gradient: "hover:shadow-lg hover:shadow-blue-100/50",
  },
  "Pro+": {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    hoverColor: "hover:bg-purple-200",
    cardStyle: "border-purple-200 hover:border-purple-400 hover:shadow-purple-200/50",
    icon: <Sparkles className="w-3 h-3 ml-1" />,
    gradient: "hover:shadow-lg hover:shadow-purple-200/50",
  },
  Enterprise: {
    color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300",
    hoverColor: "hover:shadow-lg hover:shadow-yellow-400/50",
    cardStyle: "border-yellow-300 hover:border-yellow-400 hover:shadow-yellow-400/30",
    icon: <Crown className="w-3 h-3 ml-1" />,
    gradient: "hover:shadow-2xl hover:shadow-yellow-400/30",
  },
}

// Category icons and colors
const categoryConfig = {
  Games: {
    icon: <Gamepad2 className="w-5 h-5" />,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  "Individual User Tools": {
    icon: <Users className="w-5 h-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  "Business Features": {
    icon: <Building className="w-5 h-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  "AI/Admin Systems": {
    icon: <Brain className="w-5 h-5" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
}

// Persona icons
const personaIcons = {
  Zola: <Mic className="w-3 h-3 text-pink-500" />,
  Galen: <Mic className="w-3 h-3 text-blue-500" />,
  Arya: <Mic className="w-3 h-3 text-purple-500" />,
  Zyxen: <Mic className="w-3 h-3 text-orange-500" />,
}

// Tier hierarchy for access control
const tierHierarchy = {
  Free: 0,
  Pro: 1,
  "Pro+": 2,
  Enterprise: 3,
}

interface AgentGiftMasterRegistryProps {
  className?: string
  showAdminControls?: boolean
}

export function AgentGiftMasterRegistry({ className = "", showAdminControls = false }: AgentGiftMasterRegistryProps) {
  const [features, setFeatures] = useState<AgentGiftFeature[]>([])
  const [filteredFeatures, setFilteredFeatures] = useState<AgentGiftFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("Games")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // Fetch user profile and features
  useEffect(() => {
    fetchUserProfile()
    fetchFeatures()
  }, [])

  // Filter features when criteria change
  useEffect(() => {
    filterFeatures()
  }, [features, searchTerm, selectedCategory, selectedTier])

  // Set up real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel("agentgift_features_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "agentgift_features" }, (payload) => {
        console.log("Feature updated:", payload)
        fetchFeatures() // Refresh features on any change
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

        if (profile) {
          const adminCheck = profile.email === "admin@agentgift.ai" || profile.role === "admin"
          setUserProfile({
            id: profile.id,
            tier: profile.tier || "Free",
            xp_points: profile.xp_points || 0,
            is_admin: adminCheck,
            email: profile.email,
          })
          setIsAdmin(adminCheck)
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchFeatures = async () => {
    try {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Call Edge Function with filters
      const { data, error } = await supabase.functions.invoke("agentgift_features_query", {
        body: {
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          tier_access: selectedTier !== "all" ? selectedTier : undefined,
        },
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : undefined,
        },
      })

      if (error) {
        console.error("Error fetching features:", error)
        toast.error("Failed to load features")
        return
      }

      setFeatures(data || [])
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to connect to feature registry")
    } finally {
      setLoading(false)
    }
  }

  const filterFeatures = useCallback(() => {
    let filtered = features.filter((feature) => feature.is_active || isAdmin)

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (feature) =>
          feature.feature_name.toLowerCase().includes(term) ||
          feature.description.toLowerCase().includes(term) ||
          feature.category.toLowerCase().includes(term),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((feature) => feature.category === selectedCategory)
    }

    // Tier filter
    if (selectedTier !== "all") {
      filtered = filtered.filter((feature) => feature.tier_access === selectedTier)
    }

    setFilteredFeatures(filtered)
  }, [features, searchTerm, selectedCategory, selectedTier, isAdmin])

  const handleLaunchTool = (routePath: string, featureName: string, tierAccess: string) => {
    // Check if user has access
    if (!hasAccess(tierAccess)) {
      toast.error(`Upgrade to ${tierAccess} to access ${featureName}`)
      router.push("/pricing")
      return
    }

    if (routePath.startsWith("http")) {
      window.open(routePath, "_blank")
    } else {
      router.push(routePath)
    }

    toast.success(`Launching ${featureName}...`)
  }

  const hasAccess = (requiredTier: string): boolean => {
    if (!userProfile) return requiredTier === "Free"

    const userTierLevel = tierHierarchy[userProfile.tier as keyof typeof tierHierarchy] || 0
    const requiredTierLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 0

    return userTierLevel >= requiredTierLevel
  }

  const getXPProgress = (feature: AgentGiftFeature): number => {
    if (!feature.unlock_xp_required || !userProfile) return 0
    return Math.min((userProfile.xp_points / feature.unlock_xp_required) * 100, 100)
  }

  const toggleFeatureActive = async (featureId: string, currentState: boolean) => {
    if (!isAdmin) return

    try {
      const { error } = await supabase
        .from("agentgift_features")
        .update({ is_active: !currentState, updated_at: new Date().toISOString() })
        .eq("id", featureId)

      if (error) throw error

      toast.success(`Feature ${!currentState ? "activated" : "deactivated"}`)
      fetchFeatures()
    } catch (error) {
      console.error("Error toggling feature:", error)
      toast.error("Failed to update feature")
    }
  }

  const getFeaturesByCategory = (category: string) => {
    return filteredFeatures.filter((feature) => feature.category === category)
  }

  const FeatureCard = ({ feature }: { feature: AgentGiftFeature }) => {
    const tierStyle = tierConfig[feature.tier_access]
    const categoryStyle = categoryConfig[feature.category]
    const hasUserAccess = hasAccess(feature.tier_access)
    const xpProgress = getXPProgress(feature)
    const isLocked = !hasUserAccess

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: isLocked ? 0 : -4 }}
        className={`group relative ${tierStyle.gradient}`}
      >
        <Card
          className={`h-full transition-all duration-300 ${tierStyle.cardStyle} ${
            isLocked ? "opacity-60 grayscale" : ""
          } ${feature.tier_access === "Pro+" ? "animate-pulse-slow" : ""}`}
        >
          {/* Admin Controls */}
          {isAdmin && (
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              <Switch
                checked={feature.is_active}
                onCheckedChange={() => toggleFeatureActive(feature.id, feature.is_active)}
                size="sm"
              />
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center z-5">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                <Lock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1 rounded ${categoryStyle.bgColor}`}>
                    <div className={categoryStyle.color}>{categoryStyle.icon}</div>
                  </div>
                  {feature.persona_hint && personaIcons[feature.persona_hint]}
                  {feature.is_gamified && <Sparkles className="w-3 h-3 text-purple-500" />}
                </div>

                <CardTitle
                  className={`text-lg font-bold transition-colors ${
                    isLocked ? "text-gray-500" : "text-gray-900 group-hover:text-purple-600"
                  }`}
                >
                  {feature.feature_name}
                </CardTitle>

                <CardDescription className="mt-2 text-sm line-clamp-2">{feature.description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            {/* XP Progress Bar for locked features */}
            {isLocked && feature.unlock_xp_required && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>XP Progress</span>
                  <span>{Math.round(xpProgress)}%</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
                <p className="text-xs text-gray-500">
                  {feature.unlock_xp_required - (userProfile?.xp_points || 0)} XP to unlock
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge
                className={`${tierStyle.color} ${tierStyle.hoverColor} transition-all duration-200 flex items-center border`}
              >
                {feature.tier_access}
                {tierStyle.icon}
                {feature.tier_access === "Pro+" && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="ml-1"
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                )}
              </Badge>

              <Button
                size="sm"
                onClick={() => handleLaunchTool(feature.route_path, feature.feature_name, feature.tier_access)}
                disabled={isLocked}
                className={`transition-all duration-200 ${
                  isLocked
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </>
                ) : (
                  <>
                    Launch Tool
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {/* XP Value Display */}
            {feature.xp_value && (
              <div className="text-xs text-purple-600 font-medium">+{feature.xp_value} XP on completion</div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const CategorySection = ({ category }: { category: string }) => {
    const categoryFeatures = getFeaturesByCategory(category)
    const categoryStyle = categoryConfig[category]

    if (categoryFeatures.length === 0) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 rounded-lg ${categoryStyle.bgColor}`}>
            <div className={categoryStyle.color}>{categoryStyle.icon}</div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {category}
          </h2>
          <Badge variant="outline" className="ml-2">
            {categoryFeatures.length} {categoryFeatures.length === 1 ? "feature" : "features"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {categoryFeatures.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-4 w-[500px] mx-auto" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4 items-center justify-between bg-white p-4 rounded-lg border">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Feature Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const categories = ["Games", "Individual User Tools", "Business Features", "AI/Admin Systems"]
  const tiers = ["Free", "Pro", "Pro+", "Enterprise"]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
          Giftverse Feature Registry
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Discover and launch all AgentGift.ai tools and experiences</p>
        {userProfile && (
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <Badge variant="outline">{userProfile.tier} Tier</Badge>
            <span>{userProfile.xp_points} XP</span>
          </div>
        )}
      </div>

      {/* Admin Create Button */}
      {isAdmin && (
        <div className="flex justify-end">
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Feature
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
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

          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {tiers.map((tier) => (
                <SelectItem key={tier} value={tier}>
                  {tier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feature Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          {categories.map((category) => {
            const categoryStyle = categoryConfig[category]
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
              >
                {categoryStyle.icon}
                <span className="hidden sm:inline">{category.replace(/^[^\s]+ /, "")}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <CategorySection category={category} />
          </TabsContent>
        ))}
      </Tabs>

      {/* No Results */}
      {filteredFeatures.length === 0 && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No features found</h3>
          <p className="text-gray-500">Try adjusting your search terms or filters</p>
        </motion.div>
      )}
    </div>
  )
}
