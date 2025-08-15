"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Search,
  Users,
  Building2,
  Brain,
  Heart,
  Sparkles,
  Gift,
  Zap,
  Crown,
  Globe,
  Camera,
  Trophy,
  Target,
  Eye,
  Calendar,
  Star,
  CheckCircle,
} from "lucide-react"

interface Feature {
  id: string
  name: string
  description: string
  category: "individual" | "business" | "game" | "admin" | "ai_engine"
  tier_required: string
  status: "active" | "beta" | "coming_soon" | "locked"
  icon: React.ComponentType<{ className?: string }>
  route: string
  credits_cost?: number
  xp_reward?: number
  special_notes?: string
}

const ALL_FEATURES: Feature[] = [
  // 🎮 GAMES & INTERACTIVE EXPERIENCES
  {
    id: "agent-gifty",
    name: "Agent Gifty™",
    description: "Personalized gift drops with QR codes and AI recommendations",
    category: "game",
    tier_required: "Pro Agent",
    status: "active",
    icon: Sparkles,
    route: "/agent-gifty",
    credits_cost: 5,
    xp_reward: 25,
    special_notes: "QR code generation, voice commands",
  },
  {
    id: "gift-gut-check",
    name: "Gift Gut Check™",
    description: "AI-powered gift validation and emotional analysis",
    category: "game",
    tier_required: "Premium Spy",
    status: "active",
    icon: Heart,
    route: "/gut-check",
    credits_cost: 3,
    xp_reward: 15,
  },
  {
    id: "thought-heist",
    name: "The Thought Heist™",
    description: "Gamified emotional escape room testing gifting intelligence",
    category: "game",
    tier_required: "Pro Agent",
    status: "active",
    icon: Brain,
    route: "/thought-heist",
    credits_cost: 10,
    xp_reward: 50,
    special_notes: "Team-based, 4-phase puzzle system",
  },
  {
    id: "ghost-hunt",
    name: "Ghost Gift Hunt™",
    description: "Seasonal scavenger hunt rewarding emotional intelligence",
    category: "game",
    tier_required: "Premium Spy",
    status: "active",
    icon: Eye,
    route: "/ghost-hunt",
    credits_cost: 5,
    xp_reward: 30,
    special_notes: "Seasonal themes, rare ghost clues",
  },
  {
    id: "bondcraft",
    name: "BondCraft™",
    description: "Interactive relationship discovery through guided questions",
    category: "game",
    tier_required: "Premium Spy",
    status: "active",
    icon: Users,
    route: "/bondcraft",
    credits_cost: 8,
    xp_reward: 40,
    special_notes: "Trivia + guessing phases, relationship scoring",
  },
  {
    id: "serendipity",
    name: "No One Knows I Needed This™",
    description: "SerendipityCircuit for solo emotional gift revelation",
    category: "game",
    tier_required: "Free Agent",
    status: "active",
    icon: Sparkles,
    route: "/serendipity",
    credits_cost: 0,
    xp_reward: 20,
    special_notes: "Emotional calibration, affirmations, gift vault",
  },

  // 👥 INDIVIDUAL USER FEATURES
  {
    id: "smart-search",
    name: "Smart Search™",
    description: "AI-powered gift search with emotional context",
    category: "individual",
    tier_required: "Free Agent",
    status: "active",
    icon: Search,
    route: "/smart-search",
    credits_cost: 1,
    xp_reward: 5,
  },
  {
    id: "gift-dna",
    name: "Gift DNA™",
    description: "Personality-based gift profiling system",
    category: "individual",
    tier_required: "Premium Spy",
    status: "active",
    icon: Brain,
    route: "/gift-dna",
    credits_cost: 5,
    xp_reward: 25,
  },
  {
    id: "emotion-tags",
    name: "Emotion Tag Gifting",
    description: "Gifts based on emotional analysis and mood detection",
    category: "individual",
    tier_required: "Pro Agent",
    status: "active",
    icon: Heart,
    route: "/emotion-tags",
    credits_cost: 3,
    xp_reward: 15,
  },
  {
    id: "characters",
    name: "Character Personas",
    description: "Gift recommendations based on personality archetypes",
    category: "individual",
    tier_required: "Premium Spy",
    status: "active",
    icon: Users,
    route: "/characters",
    credits_cost: 2,
    xp_reward: 10,
  },
  {
    id: "badges",
    name: "Badge System",
    description: "Gamified achievement system for gift-giving milestones",
    category: "individual",
    tier_required: "Free Agent",
    status: "active",
    icon: Trophy,
    route: "/badges",
    xp_reward: 0,
    special_notes: "XP-based progression, prestige levels",
  },
  {
    id: "reveal",
    name: "Gift Reveal™",
    description: "Dramatic gift unveiling with animations and effects",
    category: "individual",
    tier_required: "Premium Spy",
    status: "active",
    icon: Gift,
    route: "/reveal",
    credits_cost: 2,
    xp_reward: 15,
  },
  {
    id: "group-gifting",
    name: "Group Gifting",
    description: "Collaborative gift planning and contribution system",
    category: "individual",
    tier_required: "Pro Agent",
    status: "active",
    icon: Users,
    route: "/group-gifting",
    credits_cost: 5,
    xp_reward: 30,
  },
  {
    id: "social-proof-verifier",
    name: "Social Proof Verifier",
    description: "Verify gift authenticity through social media integration",
    category: "individual",
    tier_required: "Agent 00G",
    status: "active",
    icon: CheckCircle,
    route: "/features/social-proof-verifier",
    credits_cost: 10,
    xp_reward: 50,
  },
  {
    id: "pride-alliance",
    name: "GiftVerse Pride Alliance™",
    description: "LGBTQ+ inclusive gifting with identity-aware suggestions",
    category: "individual",
    tier_required: "Premium Spy",
    status: "active",
    icon: Heart,
    route: "/features/pride-alliance",
    credits_cost: 3,
    xp_reward: 20,
    special_notes: "Seasonal quests, ally squads, care kits",
  },
  {
    id: "giftbridge",
    name: "GiftBridge™",
    description: "Global nomination system for community-driven gifting",
    category: "individual",
    tier_required: "Premium Spy",
    status: "active",
    icon: Globe,
    route: "/giftbridge",
    credits_cost: 20,
    xp_reward: 100,
    special_notes: "Monthly winners, $10K annual finale",
  },
  {
    id: "cultural-respect",
    name: "Cultural Intelligence",
    description: "Culturally-aware gift recommendations across 50+ countries",
    category: "individual",
    tier_required: "Pro Agent",
    status: "active",
    icon: Globe,
    route: "/cultural-respect",
    credits_cost: 5,
    xp_reward: 25,
  },

  // 🏢 BUSINESS FEATURES
  {
    id: "business-dashboard",
    name: "Business Dashboard",
    description: "Company-level gifting tools and team collaboration",
    category: "business",
    tier_required: "Small Business",
    status: "active",
    icon: Building2,
    route: "/business",
    special_notes: "Team XP, company levels, bulk gifting",
  },
  {
    id: "desk-drop",
    name: "Desk Drop Sent",
    description: "Surprise desk deliveries for remote teams",
    category: "business",
    tier_required: "Small Business",
    status: "active",
    icon: Gift,
    route: "/business",
    credits_cost: 10,
    xp_reward: 50,
    special_notes: "Team building tool",
  },
  {
    id: "gift-chain",
    name: "Gift Chain Events",
    description: "Team-wide gift chain celebrations",
    category: "business",
    tier_required: "Small Business",
    status: "active",
    icon: Users,
    route: "/business",
    credits_cost: 20,
    xp_reward: 100,
    special_notes: "Company-wide events",
  },
  {
    id: "welcome-photo",
    name: "Welcome Photo Upload",
    description: "New employee welcome experiences",
    category: "business",
    tier_required: "Small Business",
    status: "active",
    icon: Camera,
    route: "/business",
    credits_cost: 5,
    xp_reward: 25,
  },
  {
    id: "culture-cam",
    name: "Culture Cam Upload",
    description: "Share company culture moments",
    category: "business",
    tier_required: "Small Business",
    status: "active",
    icon: Camera,
    route: "/business",
    credits_cost: 5,
    xp_reward: 30,
  },
  {
    id: "escape-room",
    name: "Escape Room Participation",
    description: "Team building escape room events",
    category: "business",
    tier_required: "Small Business",
    status: "active",
    icon: Target,
    route: "/business",
    credits_cost: 15,
    xp_reward: 75,
    special_notes: "Team building game",
  },
  {
    id: "custom-holidays",
    name: "Custom Company Holidays",
    description: "Create and manage company-specific celebration days",
    category: "business",
    tier_required: "Enterprise",
    status: "active",
    icon: Calendar,
    route: "/business/custom-holidays",
    credits_cost: 25,
    xp_reward: 100,
  },

  // 🤖 AI ENGINES & ADMIN TOOLS
  {
    id: "emotional-signature-engine",
    name: "Emotional Signature Engine™",
    description: "Advanced emotional analysis and routing system",
    category: "ai_engine",
    tier_required: "Admin Only",
    status: "active",
    icon: Brain,
    route: "/admin/emotional-signature-engine",
    special_notes: "LUMIENCE integration, Make.com webhooks",
  },
  {
    id: "feature-builder",
    name: "Feature Builder System",
    description: "No-code tool creation and management platform",
    category: "admin",
    tier_required: "Admin Only",
    status: "active",
    icon: Zap,
    route: "/admin/feature-builder",
    special_notes: "Voice commands, template system",
  },
  {
    id: "giftverse-mastermind",
    name: "Giftverse Mastermind™",
    description: "Central AI control brain for all platform operations",
    category: "admin",
    tier_required: "Admin Only",
    status: "active",
    icon: Crown,
    route: "/admin/giftverse-mastermind",
    special_notes: "Bot monitoring, analytics, creator controls",
  },
  {
    id: "social-proofs-admin",
    name: "Social Proofs Management",
    description: "Admin panel for managing social proof verification",
    category: "admin",
    tier_required: "Admin Only",
    status: "active",
    icon: CheckCircle,
    route: "/admin/social-proofs",
  },
  {
    id: "tokenomics-admin",
    name: "Tokenomics Control Panel",
    description: "Manage XP, credits, and reward systems",
    category: "admin",
    tier_required: "Admin Only",
    status: "active",
    icon: Star,
    route: "/admin/tokenomics",
  },
  {
    id: "giftbridge-admin",
    name: "GiftBridge Admin Panel",
    description: "Manage global nominations and voting system",
    category: "admin",
    tier_required: "Admin Only",
    status: "active",
    icon: Globe,
    route: "/admin/giftbridge",
  },

  // 🔮 COMING SOON / BETA
  {
    id: "lumience-dev",
    name: "LUMIENCE™ Development",
    description: "Advanced grief and anxiety support system",
    category: "individual",
    tier_required: "Agent 00G",
    status: "beta",
    icon: Heart,
    route: "/lumience-dev",
    special_notes: "Emotional support, crisis intervention",
  },
  {
    id: "mission",
    name: "Mission Control",
    description: "Platform mission and values dashboard",
    category: "individual",
    tier_required: "Free Agent",
    status: "active",
    icon: Target,
    route: "/mission",
  },
]

export default function FeatureInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredFeatures = ALL_FEATURES.filter((feature) => {
    const matchesSearch =
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || feature.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "beta":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "coming_soon":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "locked":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryStats = () => {
    const stats = {
      individual: ALL_FEATURES.filter((f) => f.category === "individual").length,
      business: ALL_FEATURES.filter((f) => f.category === "business").length,
      game: ALL_FEATURES.filter((f) => f.category === "game").length,
      admin: ALL_FEATURES.filter((f) => f.category === "admin").length,
      ai_engine: ALL_FEATURES.filter((f) => f.category === "ai_engine").length,
      total: ALL_FEATURES.length,
      active: ALL_FEATURES.filter((f) => f.status === "active").length,
    }
    return stats
  }

  const stats = getCategoryStats()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AgentGift.ai Feature Inventory</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete catalog of all features, tools, and games we've built together
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Features</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.individual}</div>
              <div className="text-sm text-gray-600">Individual</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.business}</div>
              <div className="text-sm text-gray-600">Business</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.game}</div>
              <div className="text-sm text-gray-600">Games</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.admin}</div>
              <div className="text-sm text-gray-600">Admin</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.ai_engine}</div>
              <div className="text-sm text-gray-600">AI Engines</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="game">Games</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="ai_engine">AI</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">{feature.name}</CardTitle>
                        <Badge className={getStatusColor(feature.status)} variant="secondary">
                          {feature.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Tier Required:</span>
                      <Badge variant="outline">{feature.tier_required}</Badge>
                    </div>

                    {feature.credits_cost && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Credits:</span>
                        <span className="font-medium">{feature.credits_cost}</span>
                      </div>
                    )}

                    {feature.xp_reward && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">XP Reward:</span>
                        <span className="font-medium text-purple-600">+{feature.xp_reward}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Route:</span>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{feature.route}</code>
                    </div>
                  </div>

                  {feature.special_notes && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Special:</strong> {feature.special_notes}
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Badge
                      variant="outline"
                      className={
                        feature.category === "game"
                          ? "border-pink-300 text-pink-700"
                          : feature.category === "business"
                            ? "border-orange-300 text-orange-700"
                            : feature.category === "admin"
                              ? "border-red-300 text-red-700"
                              : feature.category === "ai_engine"
                                ? "border-purple-300 text-purple-700"
                                : "border-blue-300 text-blue-700"
                      }
                    >
                      {feature.category.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No features found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

