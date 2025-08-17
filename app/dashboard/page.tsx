"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Sparkles, Trophy, Users, Calendar, Heart, Star, Zap, Target, TrendingUp } from "lucide-react"
import { analytics } from "@/lib/analytics"

interface User {
  id: string
  email: string
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [xp, setXp] = useState(100) // Welcome bonus
  const [isNewUser, setIsNewUser] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth")
          return
        }

        setUser(authUser as User)

        // Check if user signed up within the last 5 minutes (new user)
        const signupTime = new Date(authUser.created_at).getTime()
        const now = new Date().getTime()
        const fiveMinutesAgo = now - 5 * 60 * 1000
        const isNew = signupTime > fiveMinutesAgo

        setIsNewUser(isNew)

        // Track dashboard arrival
        await analytics.trackDashboardArrival(isNew, {
          user_id: authUser.id,
          signup_time: authUser.created_at,
          time_to_dashboard: isNew ? now - signupTime : null,
        })

        // Award welcome XP for new users
        if (isNew) {
          await analytics.track("welcome_bonus_awarded", {
            user_id: authUser.id,
            xp_awarded: 100,
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        router.push("/auth")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  const handleFeatureClick = async (featureName: string, featureUrl: string) => {
    await analytics.track("dashboard_feature_click", {
      feature_name: featureName,
      feature_url: featureUrl,
      user_id: user?.id,
    })

    router.push(featureUrl)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome{isNewUser ? " to AgentGift.ai" : " back"}, {user?.email?.split("@")[0]}!
                {isNewUser && <span className="ml-2">🎉</span>}
              </h1>
              <p className="text-gray-600 mt-1">
                {isNewUser ? "Let's find the perfect gifts together!" : "Ready to discover more amazing gifts?"}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">{xp} XP</span>
              </div>
              {isNewUser && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Welcome Bonus!
                </Badge>
              )}
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress to next level</span>
              <span>{xp}/250 XP</span>
            </div>
            <Progress value={(xp / 250) * 100} className="h-2" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFeatureClick("Smart Search", "/smart-search")}
          >
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Smart Search</h3>
              <p className="text-sm text-gray-600">Find gifts by description</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFeatureClick("Gift Concierge", "/concierge")}
          >
            <CardContent className="p-4 text-center">
              <Sparkles className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <h3 className="font-semibold">AI Concierge</h3>
              <p className="text-sm text-gray-600">Chat with our AI assistant</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFeatureClick("Gift DNA", "/gift-dna")}
          >
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-semibold">Gift DNA</h3>
              <p className="text-sm text-gray-600">Personality-based gifts</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFeatureClick("Group Gifting", "/group-gifting")}
          >
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Group Gifting</h3>
              <p className="text-sm text-gray-600">Collaborate on gifts</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest gift discoveries and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isNewUser ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Welcome to AgentGift.ai!</h3>
                  <p className="text-gray-600 mb-4">
                    Start exploring our AI-powered gift features to see your activity here.
                  </p>
                  <Button onClick={() => handleFeatureClick("Smart Search", "/smart-search")}>
                    <Target className="mr-2 h-4 w-4" />
                    Try Smart Search
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Gift className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Gift search completed</p>
                      <p className="text-sm text-gray-600">Found 12 perfect matches</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Occasions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Occasions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mom's Birthday</p>
                      <p className="text-sm text-gray-600">In 12 days</p>
                    </div>
                    <Badge variant="outline">Birthday</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Anniversary</p>
                      <p className="text-sm text-gray-600">In 28 days</p>
                    </div>
                    <Badge variant="outline">Anniversary</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                  Add Occasion
                </Button>
              </CardContent>
            </Card>

            {/* Achievement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Latest Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold">Welcome Explorer!</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {isNewUser ? "Joined AgentGift.ai" : "Keep exploring features"}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    +100 XP
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
