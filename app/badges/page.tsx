"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Crown,
  Gift,
  Users,
  Sparkles,
  Target,
  Star,
  Zap,
  Heart,
  Coins,
  Shield,
  Flame,
  Lock,
  Search,
  Filter,
} from "lucide-react"
import { getCurrentUser, type User } from "@/lib/feature-access"
import Link from "next/link"

interface BadgeData {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  rarity: "common" | "rare" | "epic" | "legendary" | "ultra-rare"
  category: "seasonal" | "prestige" | "level-based" | "campaign" | "referral" | "achievement"
  unlockMethod: string
  xpRequired?: number
  levelRequired?: number
  isEarned?: boolean
  earnedAt?: string
  progress?: number
  maxProgress?: number
}

const allBadges: BadgeData[] = [
  // Level-Based Badges
  {
    id: "first_steps",
    name: "First Steps",
    description: "Welcome to AgentGift.ai! Your journey begins.",
    icon: Gift,
    rarity: "common",
    category: "level-based",
    unlockMethod: "Sign up and complete profile",
    xpRequired: 0,
    levelRequired: 1,
  },
  {
    id: "gift_apprentice",
    name: "Gift Apprentice",
    description: "Learning the art of thoughtful giving.",
    icon: Target,
    rarity: "common",
    category: "level-based",
    unlockMethod: "Reach Level 5",
    xpRequired: 5000,
    levelRequired: 5,
  },
  {
    id: "gift_master",
    name: "Gift Master",
    description: "Mastered the science of perfect gifts.",
    icon: Trophy,
    rarity: "rare",
    category: "level-based",
    unlockMethod: "Reach Level 25",
    xpRequired: 25000,
    levelRequired: 25,
  },
  {
    id: "gift_legend",
    name: "Gift Legend",
    description: "Your gifting skills are legendary.",
    icon: Crown,
    rarity: "legendary",
    category: "level-based",
    unlockMethod: "Reach Level 100",
    xpRequired: 100000,
    levelRequired: 100,
  },

  // Achievement Badges
  {
    id: "first_gift",
    name: "First Gift",
    description: "Sent your very first AI-recommended gift.",
    icon: Heart,
    rarity: "common",
    category: "achievement",
    unlockMethod: "Send 1 gift recommendation",
  },
  {
    id: "gift_streak",
    name: "Gift Streak",
    description: "Consistent gifting for 7 days straight.",
    icon: Flame,
    rarity: "rare",
    category: "achievement",
    unlockMethod: "7-day gifting streak",
  },
  {
    id: "budget_optimizer",
    name: "Budget Optimizer",
    description: "Found amazing gifts under $25.",
    icon: Coins,
    rarity: "common",
    category: "achievement",
    unlockMethod: "Use budget filter 10 times",
  },
  {
    id: "eco_warrior",
    name: "Eco Warrior",
    description: "Champion of sustainable gifting.",
    icon: Sparkles,
    rarity: "rare",
    category: "achievement",
    unlockMethod: "Choose eco-friendly gifts 20 times",
  },

  // Seasonal Badges
  {
    id: "summer_vibes",
    name: "Summer Vibes",
    description: "Embraced the summer gifting season.",
    icon: Star,
    rarity: "epic",
    category: "seasonal",
    unlockMethod: "Summer 2024 Event Participation",
  },
  {
    id: "holiday_hero",
    name: "Holiday Hero",
    description: "Spread joy during the holiday season.",
    icon: Gift,
    rarity: "epic",
    category: "seasonal",
    unlockMethod: "December Holiday Event",
  },
  {
    id: "valentines_cupid",
    name: "Valentine's Cupid",
    description: "Master of romantic gift-giving.",
    icon: Heart,
    rarity: "rare",
    category: "seasonal",
    unlockMethod: "Valentine's Day 2024 Event",
  },

  // Prestige Badges
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Joined AgentGift.ai in its early days.",
    icon: Shield,
    rarity: "ultra-rare",
    category: "prestige",
    unlockMethod: "Beta user (2024)",
  },
  {
    id: "community_leader",
    name: "Community Leader",
    description: "Helped shape the AgentGift community.",
    icon: Users,
    rarity: "legendary",
    category: "prestige",
    unlockMethod: "Community contributions",
  },
  {
    id: "feedback_champion",
    name: "Feedback Champion",
    description: "Provided valuable product feedback.",
    icon: Target,
    rarity: "epic",
    category: "prestige",
    unlockMethod: "Submit 50+ feedback reports",
  },

  // Campaign Badges
  {
    id: "launch_week",
    name: "Launch Week Warrior",
    description: "Participated in our epic launch week.",
    icon: Zap,
    rarity: "epic",
    category: "campaign",
    unlockMethod: "Launch Week 2024 Campaign",
  },
  {
    id: "referral_master",
    name: "Referral Master",
    description: "Brought friends to the gifting revolution.",
    icon: Users,
    rarity: "rare",
    category: "referral",
    unlockMethod: "Refer 10 successful users",
  },
  {
    id: "social_sharer",
    name: "Social Sharer",
    description: "Spread the word on social media.",
    icon: Sparkles,
    rarity: "common",
    category: "campaign",
    unlockMethod: "Share on 3 social platforms",
  },
]

const rarityColors = {
  common: {
    bg: "bg-gray-100 dark:bg-gray-800",
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-700 dark:text-gray-300",
    badge: "bg-gray-500",
  },
  rare: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-300 dark:border-blue-600",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-500",
  },
  epic: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-300 dark:border-purple-600",
    text: "text-purple-700 dark:text-purple-300",
    badge: "bg-purple-500",
  },
  legendary: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-300 dark:border-yellow-600",
    text: "text-yellow-700 dark:text-yellow-300",
    badge: "bg-yellow-500",
  },
  "ultra-rare": {
    bg: "bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20",
    border: "border-pink-300 dark:border-pink-600",
    text: "text-pink-700 dark:text-pink-300",
    badge: "bg-gradient-to-r from-pink-500 to-purple-500",
  },
}

const categoryLabels = {
  seasonal: "Seasonal",
  prestige: "Prestige",
  "level-based": "Level-Based",
  campaign: "Campaign",
  referral: "Referral",
  achievement: "Achievement",
}

export default function BadgesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [badges, setBadges] = useState<BadgeData[]>(allBadges)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser) {
        // Simulate badge progress based on user data
        const updatedBadges = allBadges.map((badge) => {
          const isEarned = currentUser.badges?.includes(badge.id) || Math.random() > 0.7
          const progress = isEarned ? 100 : Math.floor(Math.random() * 80)

          return {
            ...badge,
            isEarned,
            progress,
            maxProgress: 100,
            earnedAt: isEarned ? new Date().toISOString() : undefined,
          }
        })
        setBadges(updatedBadges)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredBadges = badges.filter((badge) => {
    const matchesSearch =
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || badge.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const earnedCount = badges.filter((badge) => badge.isEarned).length
  const totalCount = badges.length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Badge Collection
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Unlock achievements and show off your gifting expertise
          </p>

          {user ? (
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{earnedCount}</div>
                <div className="text-sm text-gray-500">Earned</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{totalCount}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round((earnedCount / totalCount) * 100)}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Sign in to track your progress
                </h3>
              </div>
              <p className="text-purple-700 dark:text-purple-300 mb-4">
                Create an account to earn badges and track your gifting achievements
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full lg:w-auto">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="seasonal" className="text-xs">
                  Seasonal
                </TabsTrigger>
                <TabsTrigger value="prestige" className="text-xs">
                  Prestige
                </TabsTrigger>
                <TabsTrigger value="level-based" className="text-xs">
                  Level
                </TabsTrigger>
                <TabsTrigger value="campaign" className="text-xs">
                  Campaign
                </TabsTrigger>
                <TabsTrigger value="achievement" className="text-xs">
                  Achievement
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map((badge) => {
            const IconComponent = badge.icon
            const rarity = rarityColors[badge.rarity]
            const isLocked = !user || !badge.isEarned

            return (
              <Card
                key={badge.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  rarity.border
                } ${isLocked ? "opacity-60" : ""}`}
              >
                {/* Blur overlay for non-authenticated users */}
                {!user && (
                  <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-white mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">Sign in to view</p>
                    </div>
                  </div>
                )}

                {/* Lock overlay for locked badges */}
                {user && isLocked && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="w-8 h-8 bg-gray-900/80 rounded-full flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <CardContent className={`p-6 ${rarity.bg}`}>
                  <div className="text-center space-y-4">
                    {/* Badge Icon */}
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                        badge.isEarned ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-400 dark:bg-gray-600"
                      }`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Badge Info */}
                    <div className="space-y-2">
                      <h3 className={`font-semibold text-lg ${rarity.text}`}>{badge.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{badge.description}</p>

                      {/* Rarity Badge */}
                      <Badge className={`${rarity.badge} text-white border-0 capitalize`}>
                        {badge.rarity.replace("-", " ")}
                      </Badge>

                      {/* Category */}
                      <div className="text-xs text-gray-500 dark:text-gray-400">{categoryLabels[badge.category]}</div>

                      {/* Unlock Method */}
                      <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                        {badge.unlockMethod}
                      </div>

                      {/* Progress Bar (for authenticated users with incomplete badges) */}
                      {user && !badge.isEarned && badge.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{badge.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${badge.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Earned Date */}
                      {badge.isEarned && badge.earnedAt && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* No Results */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No badges found</h3>
            <p className="text-gray-500 dark:text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

