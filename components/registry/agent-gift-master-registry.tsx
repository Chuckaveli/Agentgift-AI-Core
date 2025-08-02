"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Sparkles, Zap, Users, Building, Brain, Gamepad2, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Types
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
}

// Localization structure for future expansion
interface RegistryLocalization {
  title: string
  subtitle: string
  searchPlaceholder: string
  filterByCategory: string
  filterByTier: string
  allCategories: string
  allTiers: string
  launchTool: string
  noFeaturesFound: string
  categories: {
    Games: string
    "Individual User Tools": string
    "Business Features": string
    "AI/Admin Systems": string
  }
  tiers: {
    Free: string
    Pro: string
    "Pro+": string
    Enterprise: string
  }
}

const defaultLocalization: RegistryLocalization = {
  title: "Giftverse Feature Registry",
  subtitle: "Discover and launch all AgentGift.ai tools and experiences",
  searchPlaceholder: "Search features...",
  filterByCategory: "Filter by Category",
  filterByTier: "Filter by Tier",
  allCategories: "All Categories",
  allTiers: "All Tiers",
  launchTool: "Launch Tool",
  noFeaturesFound: "No features found matching your criteria",
  categories: {
    Games: "🎮 Games",
    "Individual User Tools": "👤 Individual Tools",
    "Business Features": "🏢 Business Features",
    "AI/Admin Systems": "🧠 AI/Admin Systems",
  },
  tiers: {
    Free: "Free",
    Pro: "Pro",
    "Pro+": "Pro+",
    Enterprise: "Enterprise",
  },
}

// Tier configurations
const tierConfig = {
  Free: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    hoverColor: "hover:bg-gray-200",
    icon: null,
  },
  Pro: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    hoverColor: "hover:bg-blue-200",
    icon: null,
  },
  "Pro+": {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    hoverColor: "hover:bg-purple-200",
    icon: <Sparkles className="w-3 h-3 ml-1" />,
  },
  Enterprise: {
    color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300",
    hoverColor: "hover:shadow-lg hover:shadow-yellow-400/50",
    icon: <Zap className="w-3 h-3 ml-1" />,
  },
}

// Category icons
const categoryIcons = {
  Games: <Gamepad2 className="w-5 h-5" />,
  "Individual User Tools": <Users className="w-5 h-5" />,
  "Business Features": <Building className="w-5 h-5" />,
  "AI/Admin Systems": <Brain className="w-5 h-5" />,
}

interface AgentGiftMasterRegistryProps {
  localization?: Partial<RegistryLocalization>
  className?: string
}

export function AgentGiftMasterRegistry({
  localization: customLocalization,
  className = "",
}: AgentGiftMasterRegistryProps) {
  const [features, setFeatures] = useState<AgentGiftFeature[]>([])
  const [filteredFeatures, setFilteredFeatures] = useState<AgentGiftFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("Games")

  const router = useRouter()
  const supabase = createClient()

  // Merge custom localization with defaults
  const loc: RegistryLocalization = {
    ...defaultLocalization,
    ...customLocalization,
    categories: { ...defaultLocalization.categories, ...customLocalization?.categories },
    tiers: { ...defaultLocalization.tiers, ...customLocalization?.tiers },
  }

  // Fetch features from Supabase
  useEffect(() => {
    fetchFeatures()
  }, [])

  // Filter features when search/filter criteria change
  useEffect(() => {
    filterFeatures()
  }, [features, searchTerm, selectedCategory, selectedTier])

  const fetchFeatures = async () => {
    try {
      setLoading(true)

      // Try to get user session for authenticated requests
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Call Supabase Edge Function
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

  const filterFeatures = () => {
    let filtered = features.filter((feature) => feature.is_active)

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (feature) =>
          feature.feature_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feature.description.toLowerCase().includes(searchTerm.toLowerCase()),
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
  }

  const handleLaunchTool = (routePath: string, featureName: string) => {
    if (routePath.startsWith("http")) {
      window.open(routePath, "_blank")
    } else {
      router.push(routePath)
    }

    // Track feature launch
    toast.success(`Launching ${featureName}...`)
  }

  const getFeaturesByCategory = (category: string) => {
    return filteredFeatures.filter((feature) => feature.category === category)
  }

  const FeatureCard = ({ feature }: { feature: AgentGiftFeature }) => {
    const tierStyle = tierConfig[feature.tier_access]
    const isEnterprise = feature.tier_access === "Enterprise"
    const isProPlus = feature.tier_access === "Pro+"

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        className={`group ${isEnterprise ? "hover:shadow-2xl hover:shadow-yellow-400/30" : ""}`}
      >
        <Card
          className={`h-full transition-all duration-300 ${isEnterprise ? "border-yellow-300 hover:border-yellow-400" : "hover:shadow-lg"}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {feature.feature_name}
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {feature.description}
                </CardDescription>
              </div>
              <div className="ml-3">{categoryIcons[feature.category]}</div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <Badge
                className={`${tierStyle.color} ${tierStyle.hoverColor} transition-all duration-200 flex items-center border ${isProPlus ? "animate-pulse" : ""}`}
              >
                {loc.tiers[feature.tier_access]}
                {tierStyle.icon}
                {isProPlus && (
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
                onClick={() => handleLaunchTool(feature.route_path, feature.feature_name)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-200"
              >
                {loc.launchTool}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const CategorySection = ({ category }: { category: string }) => {
    const categoryFeatures = getFeaturesByCategory(category)

    if (categoryFeatures.length === 0) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 mb-6">
          {categoryIcons[category as keyof typeof categoryIcons]}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {loc.categories[category as keyof typeof loc.categories]}
          </h2>
          <Badge variant="outline" className="ml-2">
            {categoryFeatures.length} {categoryFeatures.length === 1 ? "feature" : "features"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
          <p className="text-gray-600">Loading Giftverse features...</p>
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
          {loc.title}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{loc.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={loc.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={loc.filterByCategory} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{loc.allCategories}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {loc.categories[category as keyof typeof loc.categories]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={loc.filterByTier} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{loc.allTiers}</SelectItem>
              {tiers.map((tier) => (
                <SelectItem key={tier} value={tier}>
                  {loc.tiers[tier as keyof typeof loc.tiers]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feature Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              {categoryIcons[category as keyof typeof categoryIcons]}
              <span className="hidden sm:inline">
                {loc.categories[category as keyof typeof loc.categories].replace(/^[^\s]+ /, "")}
              </span>
            </TabsTrigger>
          ))}
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
          <h3 className="text-lg font-semibold text-gray-600 mb-2">{loc.noFeaturesFound}</h3>
          <p className="text-gray-500">Try adjusting your search terms or filters</p>
        </motion.div>
      )}
    </div>
  )
}
