"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Heart, Users, Sparkles, TrendingUp, Star, Crown, Zap, Target } from "lucide-react"
import Link from "next/link"
import { FeatureTile } from "@/components/global/feature-tile"
import { XPTracker } from "@/components/global/xp-tracker"
import { ToastBadgeNotifier } from "@/components/global/toast-badge-notifier"
import { TIERS, type GlobalUser } from "@/lib/global-logic"

// Mock user data - in real app, this would come from auth/database
const mockUser: GlobalUser = {
  id: "user_123",
  email: "user@example.com",
  name: "Gift Agent",
  tier: TIERS.PREMIUM_SPY,
  xp: 1250,
  level: 8,
  credits: 150,
  prestige_level: null,
  badges: ["first_steps", "getting_started"],
  created_at: "2024-01-01",
  updated_at: "2024-01-15",
}

const features = [
  {
    title: "Gift Gut Check™",
    description: "Trust your instincts with AI-powered gift validation",
    icon: <Heart className="w-6 h-6 text-white" />,
    href: "/features/gift-gut-check",
    requiredTier: TIERS.PREMIUM_SPY,
    gradient: "from-red-500 to-pink-500",
    isNew: true,
  },
  {
    title: "Agent Gifty™",
    description: "Create QR code gift drops for surprise reveals",
    icon: <Gift className="w-6 h-6 text-white" />,
    href: "/features/agent-gifty",
    requiredTier: TIERS.PRO_AGENT,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Emotion Tags",
    description: "Tag gifts with emotions for perfect matching",
    icon: <Sparkles className="w-6 h-6 text-white" />,
    href: "/features/emotion-tags",
    requiredTier: TIERS.PREMIUM_SPY,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Gift DNA Quiz",
    description: "Discover your unique gifting personality",
    icon: <Target className="w-6 h-6 text-white" />,
    href: "/features/gift-dna-quiz",
    requiredTier: TIERS.FREE_AGENT,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Group Splitter",
    description: "Smart group gift coordination and splitting",
    icon: <Users className="w-6 h-6 text-white" />,
    href: "/features/group-splitter",
    requiredTier: TIERS.PREMIUM_SPY,
    gradient: "from-green-500 to-teal-500",
  },
  {
    title: "Gift Reveal Viewer",
    description: "Experience magical gift reveals and reactions",
    icon: <Star className="w-6 h-6 text-white" />,
    href: "/features/gift-reveal-viewer",
    requiredTier: TIERS.FREE_AGENT,
    gradient: "from-indigo-500 to-purple-500",
  },
]

export default function DashboardPage() {
  const [user, setUser] = useState<GlobalUser>(mockUser)
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: "Completed Gift Gut Check", time: "2 hours ago", xp: 25 },
    { id: 2, action: "Unlocked 'Getting Started' badge", time: "1 day ago", xp: 50 },
    { id: 3, action: "Created Agent Gifty drop", time: "3 days ago", xp: 30 },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <ToastBadgeNotifier />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user.name}! 🎁
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Ready to create some gift magic today?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.level}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.xp}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.credits}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Credits</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.badges.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Badges</div>
            </CardContent>
          </Card>
        </div>

        {/* XP Tracker */}
        <XPTracker xp={user.xp} level={user.level} prestigeLevel={user.prestige_level} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                asChild
                className="h-20 flex flex-col gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/features/gift-gut-check">
                  <Heart className="w-6 h-6" />
                  <span className="text-sm">Gut Check</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Link href="/features/agent-gifty">
                  <Gift className="w-6 h-6" />
                  <span className="text-sm">Agent Gifty</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Link href="/features/gift-dna-quiz">
                  <Target className="w-6 h-6" />
                  <span className="text-sm">DNA Quiz</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Link href="/pricing">
                  <Crown className="w-6 h-6" />
                  <span className="text-sm">Upgrade</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureTile
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                href={feature.href}
                userTier={user.tier}
                requiredTier={feature.requiredTier}
                gradient={feature.gradient}
                isNew={feature.isNew}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{activity.action}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    +{activity.xp} XP
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
