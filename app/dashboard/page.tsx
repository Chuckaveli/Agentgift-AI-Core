import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Sparkles, Calendar, TrendingUp, Users, Heart, Star, Crown, Zap, Plus, LogOut } from "lucide-react"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get authenticated user
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()

  if (authError || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Please Sign In</CardTitle>
            <CardDescription>You need to be signed in to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = session.user
  const userEmail = user.email || "User"
  const userName = userEmail.split("@")[0]

  // Mock data for features
  const features = [
    {
      name: "Smart Search™",
      description: "AI-powered gift discovery",
      href: "/smart-search",
      icon: Sparkles,
      tier: "FREE",
      available: true,
    },
    {
      name: "Agent Gifty™",
      description: "Personalized gift drops",
      href: "/agent-gifty",
      icon: Gift,
      tier: "PRO",
      available: true,
    },
    {
      name: "Gift Gut Check™",
      description: "AI gift evaluation",
      href: "/gut-check",
      icon: TrendingUp,
      tier: "PRO",
      available: true,
    },
    {
      name: "Emotion Tag Gifting",
      description: "Emotional intelligence matching",
      href: "/emotion-tags",
      icon: Heart,
      tier: "PRO+",
      available: true,
    },
    {
      name: "Group Gifting",
      description: "Collaborative gift planning",
      href: "/group-gifting",
      icon: Users,
      tier: "PRO+",
      available: true,
    },
    {
      name: "Cultural Respect Engine",
      description: "Culturally aware recommendations",
      href: "/cultural-respect",
      icon: Star,
      tier: "ENTERPRISE",
      available: true,
    },
  ]

  const upcomingOccasions = [
    { name: "Mom's Birthday", date: "Dec 15", daysAway: 12, type: "birthday" },
    { name: "Holiday Season", date: "Dec 25", daysAway: 22, type: "holiday" },
    { name: "New Year", date: "Jan 1", daysAway: 29, type: "celebration" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AgentGift.ai Dashboard
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {userName}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Crown className="w-3 h-3 mr-1" />
                FREE
              </Badge>
              <form action="/auth/signout" method="post">
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">Welcome, {userName}! Let's make someone's day. ✨</h2>
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
                    <p className="text-3xl font-bold">1</p>
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
                    <p className="text-3xl font-bold">50</p>
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
                    <p className="text-3xl font-bold">0</p>
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
                    <p className="text-3xl font-bold">0</p>
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
                    {features.map((feature) => (
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
                          <Badge variant="secondary" className="text-xs">
                            {feature.tier}
                          </Badge>
                        </Link>
                      </Button>
                    ))}
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
                    <p className="text-2xl font-bold text-gray-900">50 XP</p>
                    <p className="text-sm text-gray-600">Level 1</p>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                      style={{ width: "50%" }}
                    ></div>
                  </div>

                  <p className="text-xs text-gray-500 text-center">50 XP to next level</p>
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

                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    asChild
                  >
                    <Link href="/gut-check">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Start Gut Check
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
