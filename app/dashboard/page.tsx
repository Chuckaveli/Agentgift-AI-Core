"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Sparkles, Globe, Brain, Users, Zap, TrendingUp, Calendar, Star, Crown, Heart } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [xp, setXp] = useState(1250)
  const [level, setLevel] = useState(5)
  const [nextLevelXp, setNextLevelXp] = useState(1500)

  const quickActions = [
    {
      title: "Find Perfect Gift",
      description: "Get AI-powered recommendations",
      icon: Gift,
      href: "/gift-dna",
      color: "bg-purple-500",
      xp: "+50 XP",
    },
    {
      title: "Cultural Check",
      description: "Ensure cultural appropriateness",
      icon: Globe,
      href: "/cultural-respect",
      color: "bg-blue-500",
      xp: "+30 XP",
    },
    {
      title: "Smart Search",
      description: "Intelligent gift discovery",
      icon: Brain,
      href: "/smart-search",
      color: "bg-green-500",
      xp: "+40 XP",
    },
    {
      title: "Group Gift",
      description: "Coordinate with others",
      icon: Users,
      href: "/group-gifting",
      color: "bg-pink-500",
      xp: "+60 XP",
    },
  ]

  const recentActivity = [
    {
      action: "Completed Gift DNA Analysis",
      time: "2 hours ago",
      xp: 50,
      icon: Gift,
    },
    {
      action: "Unlocked Cultural Insights",
      time: "1 day ago",
      xp: 100,
      icon: Globe,
    },
    {
      action: "Used Smart Search",
      time: "2 days ago",
      xp: 40,
      icon: Brain,
    },
  ]

  const upcomingOccasions = [
    {
      name: "Mom's Birthday",
      date: "Dec 25, 2024",
      daysLeft: 12,
      type: "Birthday",
    },
    {
      name: "Anniversary",
      date: "Jan 15, 2025",
      daysLeft: 33,
      type: "Anniversary",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, Gift Master!
            <Sparkles className="inline-block ml-2 h-8 w-8 text-yellow-500" />
          </h1>
          <p className="text-muted-foreground">Ready to create some magical gifting moments?</p>
        </div>

        {/* XP Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Level {level} - Gift Enthusiast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{xp} XP</span>
                <span>{nextLevelXp} XP</span>
              </div>
              <Progress value={(xp / nextLevelXp) * 100} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {nextLevelXp - xp} XP until Level {level + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center pb-2">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full ${action.color} flex items-center justify-center mb-3`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      {action.xp}
                    </Badge>
                    <Button size="sm" className="w-full" asChild>
                      <Link href={action.href}>Start</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      +{activity.xp} XP
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Occasions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Upcoming Occasions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingOccasions.map((occasion, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{occasion.name}</p>
                      <p className="text-xs text-muted-foreground">{occasion.date}</p>
                    </div>
                    <Badge variant={occasion.daysLeft <= 14 ? "destructive" : "secondary"} className="text-xs">
                      {occasion.daysLeft} days
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Add Occasion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <Gift className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold mb-1">Gift DNA</h3>
                <p className="text-sm text-muted-foreground mb-3">Analyze personality for perfect matches</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/gift-dna">Try Now</Link>
                </Button>
              </div>

              <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <Globe className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Cultural Respect</h3>
                <p className="text-sm text-muted-foreground mb-3">Ensure culturally appropriate gifting</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/cultural-respect">Explore</Link>
                </Button>
              </div>

              <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <Brain className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1">Smart Search</h3>
                <p className="text-sm text-muted-foreground mb-3">AI-powered gift discovery</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/smart-search">Search</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
