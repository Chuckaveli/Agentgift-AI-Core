import React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Sparkles, Calendar, TrendingUp, Users, Heart, Star, Crown, Zap, Lock, Plus } from "lucide-react"
import Link from "next/link"
import { LockedFeatureCard } from "@/components/bridge/locked-feature-card"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth?redirect=/dashboard")
  }

  // Get user profile and data
  const [{ data: profile }, { data: recipients }, { data: giftSuggestions }, { data: xpTransactions }] =
    await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("recipients").select("*").eq("user_id", user.id).limit(5),
      supabase
        .from("gift_suggestions")
        .select("*, recipients(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("xp_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const userTier = profile?.tier?.[0] || "FREE"
  const isProUser = ["PRO", "PRO+", "ENTERPRISE"].includes(userTier)
  const currentXP = profile?.current_xp || 0
  const level = profile?.level || 1
  const nextLevelXP = level * 100 // Simple XP calculation

  // Mock upcoming occasions (in real app, this would come from a calendar integration)
  const upcomingOccasions = [
    { name: "Mom's Birthday", date: "Dec 15", daysAway: 12, type: "birthday" },
    { name: "Holiday Season", date: "Dec 25", daysAway: 22, type: "holiday" },
    { name: "New Year", date: "Jan 1", daysAway: 29, type: "celebration" },
  ]

  const features = [
    {
      name: "Smart Search™",
      description: "AI-powered gift discovery",
      href: "/smart-search",
      icon: Sparkles,
      tier: "FREE",
      locked: false,
    },
    {
      name: "Agent Gifty™",
      description: "Personalized gift drops",
      href: "/agent-gifty",
      icon: Gift,
      tier: "PRO",
      locked: !isProUser && profile?.demo_completed,
    },
    {
      name: "Gift Gut Check™",
      description: "AI gift evaluation",
      href: "/gut-check",
      icon: TrendingUp,
      tier: "PRO",
      locked: !isProUser && profile?.demo_completed,
    },
    {
      name: "Emotion Tag Gifting",
      description: "Emotional intelligence matching",
      href: "/emotion-tags",
      icon: Heart,
      tier: "PRO+",
      locked: userTier !== "PRO+" && userTier !== "ENTERPRISE",
    },
    {
      name: "Group Gifting",
      description: "Collaborative gift planning",
      href: "/group-gifting",
      icon: Users,
      tier: "PRO+",
      locked: userTier !== "PRO+" && userTier !== "ENTERPRISE",
    },
    {
      name: "Cultural Respect Engine",
      description: "Culturally aware recommendations",
      href: "/cultural-respect",
      icon: Star,
      tier: "ENTERPRISE",
      locked: userTier !== "ENTERPRISE",
    },
  ]

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "PRO":
        return Crown
      case "PRO+":
        return Zap
      case "ENTERPRISE":
        return Star
      default:
        return Gift
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "PRO":
        return "text-purple-600"
      case "PRO+":
        return "text-pink-600"
      case "ENTERPRISE":
        return "text-indigo-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AgentGift.ai
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user.email?.split("@")[0]}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className={`${getTierColor(userTier)} bg-white border`}>
                {React.createElement(getTierIcon(userTier), { className: "w-3 h-3 mr-1" })}
                {userTier}
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href="/pricing">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Welcome, {user.email?.split("@")[0]}! Let's make someone's day. ✨
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your culturally intelligent gifting companion is ready to help you find the perfect gifts for every
              occasion.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Current Level</p>
                    <p className="text-3xl font-bold">{level}</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm">Total XP</p>
                    <p className="text-3xl font-bold">{profile?.lifetime_xp || 0}</p>
                  </div>
                  <Zap className="w-8 h-8 text-pink-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm">Recipients</p>
                    <p className="text-3xl font-bold">{recipients?.length || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-indigo-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Gifts Found</p>
                    <p className="text-3xl font-bold">{giftSuggestions?.length || 0}</p>
                  </div>
                  <Gift className="w-8 h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Demo Results */}
              {giftSuggestions && giftSuggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span>Your Personalized Gift Recommendations</span>
                    </CardTitle>
                    <CardDescription>
                      Based on your demo session - here are your AI-generated gift ideas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {giftSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.id}
                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                {suggestion.kind === "meaningful" && "💝 Meaningful"}
                                {suggestion.kind === "unconventional" && "🎨 Unconventional"}
                                {suggestion.kind === "otb" && "📦 Out of the Box"}
                              </Badge>
                              <span className="text-sm text-gray-600">For {suggestion.recipients?.name}</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{suggestion.text}</h4>
                            <p className="text-sm text-gray-600">{suggestion.rationale}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            {userTier === "FREE" ? (
                              <Button size="sm" variant="outline" disabled>
                                <Lock className="w-4 h-4 mr-2" />
                                Save (Pro)
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline">
                                <Heart className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {userTier === "FREE" && (
                      <div className="text-center p-4 bg-gradient-to-r from-purple-900/10 to-pink-900/10 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-600 mb-3">
                          Upgrade to Pro to save your recommendations, set reminders, and unlock advanced features!
                        </p>
                        <Button
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          asChild
                        >
                          <Link href="/pricing">
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Pro
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-purple-600" />
                    <span>Start a New Gift Journey</span>
                  </CardTitle>
                  <CardDescription>Find the perfect gift with our AI-powered tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      asChild
                    >
                      <Link href="/smart-search">
                        <Sparkles className="w-6 h-6" />
                        <span className="font-medium">Smart Search™</span>
                        <span className="text-xs opacity-90">AI-powered discovery</span>
                      </Link>
                    </Button>

                    {isProUser || !profile?.demo_completed ? (
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
                        asChild
                      >
                        <Link href="/gut-check">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                          <span className="font-medium">Gift Gut Check™</span>
                          <span className="text-xs text-gray-600">Evaluate your ideas</span>
                        </Link>
                      </Button>
                    ) : (
                      <LockedFeatureCard
                        title="Gift Gut Check™"
                        description="Evaluate your ideas"
                        tier="PRO"
                        icon={TrendingUp}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Features Grid */}
              <Card>
                <CardHeader>
                  <CardTitle>Giftverse Features</CardTitle>
                  <CardDescription>Explore all the tools available in your current tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature) => {
                      if (feature.locked) {
                        return (
                          <LockedFeatureCard
                            key={feature.name}
                            title={feature.name}
                            description={feature.description}
                            tier={feature.tier}
                            icon={feature.icon}
                          />
                        )
                      }

                      return (
                        <Button
                          key={feature.name}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 transition-all duration-200 bg-transparent"
                          asChild
                        >
                          <Link href={feature.href}>
                            <feature.icon className="w-6 h-6 text-purple-600" />
                            <span className="font-medium">{feature.name}</span>
                            <span className="text-xs text-gray-600 text-center">{feature.description}</span>
                          </Link>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* XP Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span>XP Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{currentXP} XP</p>
                    <p className="text-sm text-gray-600">Level {level}</p>
                  </div>

                  <Progress value={currentXP % 100} className="w-full" />

                  <p className="text-xs text-gray-500 text-center">{100 - (currentXP % 100)} XP to next level</p>

                  {xpTransactions && xpTransactions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Recent Activity</h4>
                      {xpTransactions.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{transaction.reason}</span>
                          <span className="text-green-600 font-medium">+{transaction.amount} XP</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Occasions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>Upcoming Occasions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingOccasions.map((occasion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{occasion.name}</p>
                        <p className="text-sm text-gray-600">{occasion.date}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {occasion.daysAway} days
                      </Badge>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Occasion
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Gift Check */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span>Quick Gift Check</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Got a gift idea? Get instant AI feedback on how well it matches your recipient.
                  </p>

                  {isProUser || !profile?.demo_completed ? (
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      asChild
                    >
                      <Link href="/gut-check">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Start Gut Check
                      </Link>
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Pro Feature</p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/pricing">Upgrade to Unlock</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
