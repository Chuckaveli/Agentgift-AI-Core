"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Sparkles, Star, Trophy, Heart, Users, Calendar, TrendingUp, Zap, Target } from "lucide-react"
import { analytics } from "@/lib/analytics"
import type { User } from "@supabase/auth-helpers-nextjs"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNewUser, setIsNewUser] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        // Check if user is new (signed up within last 5 minutes)
        const signupTime = new Date(user.created_at).getTime()
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        const newUser = now - signupTime < fiveMinutes

        setIsNewUser(newUser)

        // Track dashboard arrival
        await analytics.trackDashboardArrival(newUser)
      }

      setLoading(false)
    }

    getUser()
  }, [supabase])

  const handleFeatureClick = async (featureName: string) => {
    await analytics.track("feature_clicked", {
      feature: featureName,
      page: "dashboard",
      user_id: user?.id,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => (window.location.href = "/auth")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          {isNewUser && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <h3 className="font-semibold text-green-800">Welcome to AgentGift.ai! 🎉</h3>
                  <p className="text-green-700 text-sm">
                    You've earned 100 XP as a welcome bonus. Start exploring to unlock more features!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.email?.split("@")[0]}!</h1>
              <p className="text-gray-600 mt-1">Ready to find the perfect gifts?</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Star className="w-3 h-3 mr-1" />
                Free Agent
              </Badge>
              <div className="text-right">
                <p className="text-sm text-gray-500">XP Balance</p>
                <p className="font-bold text-purple-600">{isNewUser ? "100" : "0"} XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Gift className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gifts Found</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recipients</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Level</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Gift Concierge */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleFeatureClick("ai_concierge")}
          >
            <CardHeader>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>AI Gift Concierge</CardTitle>
                  <CardDescription>Get personalized recommendations instantly</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Chat with our AI to find the perfect gift based on personality, interests, and cultural context.
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Start Chatting
              </Button>
            </CardContent>
          </Card>

          {/* Smart Search */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleFeatureClick("smart_search")}
          >
            <CardHeader>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Smart Search</CardTitle>
                  <CardDescription>Advanced filtering and discovery</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Use our intelligent search to filter by budget, occasion, personality, and more.
              </p>
              <Button variant="outline" className="w-full bg-transparent">
                Explore Gifts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleFeatureClick("upcoming_occasions")}
          >
            <CardHeader>
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <CardTitle className="text-lg">Upcoming Occasions</CardTitle>
                  <CardDescription>Never miss an important date</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Track birthdays, anniversaries, and holidays with smart reminders.
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleFeatureClick("gift_history")}
          >
            <CardHeader>
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <CardTitle className="text-lg">Gift History</CardTitle>
                  <CardDescription>Track your gifting success</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">See what you've given before and how recipients reacted.</p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleFeatureClick("cultural_intelligence")}
          >
            <CardHeader>
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <CardTitle className="text-lg">Cultural Intelligence</CardTitle>
                  <CardDescription>Respect traditions worldwide</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Get culturally appropriate suggestions for any country or tradition.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        {isNewUser && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
                Your Progress
              </CardTitle>
              <CardDescription>Complete these steps to unlock more features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Created</span>
                  <Badge className="bg-green-100 text-green-700">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">First Gift Search</span>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Add First Recipient</span>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <Progress value={33} className="mt-4" />
                <p className="text-xs text-gray-500">1 of 3 steps completed</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
