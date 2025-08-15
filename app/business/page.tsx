"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, Gift, TrendingUp, Calendar, Star, Zap, Camera, Heart, Trophy, Target } from "lucide-react"
import Link from "next/link"
import { XPTracker } from "@/components/global/xp-tracker"
import { TIERS, type GlobalCompany } from "@/lib/global-logic"

// Mock company data
const mockCompany: GlobalCompany = {
  id: "company_123",
  name: "TechCorp Inc.",
  tier: TIERS.SMALL_BIZ,
  xp: 2500,
  level: 16,
  credits: 500,
  prestige_level: null,
  badges: ["team_builder", "culture_champion", "gift_master"],
  created_at: "2024-01-01",
  updated_at: "2024-01-15",
}

const companyTools = [
  {
    title: "Desk Drop Sent",
    description: "Surprise desk deliveries for remote teams",
    icon: <Gift className="w-6 h-6 text-white" />,
    action: "desk_drop",
    xpReward: 50,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Gift Chain Completed",
    description: "Team-wide gift chain events",
    icon: <Users className="w-6 h-6 text-white" />,
    action: "gift_chain",
    xpReward: 100,
    gradient: "from-green-500 to-teal-500",
  },
  {
    title: "Welcome Photo Upload",
    description: "New employee welcome experiences",
    icon: <Camera className="w-6 h-6 text-white" />,
    action: "welcome_photo",
    xpReward: 25,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Culture Cam Upload",
    description: "Share company culture moments",
    icon: <Heart className="w-6 h-6 text-white" />,
    action: "culture_cam",
    xpReward: 30,
    gradient: "from-red-500 to-pink-500",
  },
  {
    title: "Escape Room Participation",
    description: "Team building escape room events",
    icon: <Target className="w-6 h-6 text-white" />,
    action: "escape_room",
    xpReward: 75,
    gradient: "from-yellow-500 to-orange-500",
  },
]

const recentCompanyActivity = [
  { id: 1, action: "Desk Drop sent to Sarah M.", time: "1 hour ago", xp: 50 },
  { id: 2, action: "Gift Chain completed - Q4 Celebration", time: "2 days ago", xp: 100 },
  { id: 3, action: "Welcome Photo uploaded for new hire", time: "1 week ago", xp: 25 },
  { id: 4, action: "Culture Cam - Team lunch video", time: "1 week ago", xp: 30 },
]

export default function BusinessDashboard() {
  const [company, setCompany] = useState<GlobalCompany>(mockCompany)
  const [activeEvents, setActiveEvents] = useState([
    { id: 1, name: "Q1 Gift Chain", participants: 24, progress: 75 },
    { id: 2, name: "Welcome Week - New Hires", participants: 8, progress: 50 },
    { id: 3, name: "Anniversary Celebration", participants: 156, progress: 90 },
  ])

  const handleToolAction = async (action: string, xpReward: number) => {
    // Simulate API call to log company action
    console.log(`Company action: ${action}, XP reward: ${xpReward}`)

    // Update company XP
    setCompany((prev) => ({
      ...prev,
      xp: prev.xp + xpReward,
      level: Math.floor((prev.xp + xpReward) / 150) + 1,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {company.name} Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Building stronger teams through thoughtful gifting experiences
          </p>
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{company.level}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Company Level</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{company.xp}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Company XP</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{company.credits}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team Credits</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{company.badges.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team Badges</div>
            </CardContent>
          </Card>
        </div>

        {/* Company XP Tracker */}
        <XPTracker xp={company.xp} level={company.level} prestigeLevel={company.prestige_level} />

        {/* Company Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Company Tools & Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyTools.map((tool) => (
                <Card key={tool.title} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.gradient} flex items-center justify-center`}
                      >
                        {tool.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{tool.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          +{tool.xpReward} XP
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleToolAction(tool.action, tool.xpReward)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Use Tool
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Active Company Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeEvents.map((event) => (
                <div key={event.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{event.name}</h3>
                    <Badge variant="outline">{event.participants} participants</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-gray-600 dark:text-gray-400">{event.progress}%</span>
                    </div>
                    <Progress value={event.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Company Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recent Company Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCompanyActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{activity.action}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    +{activity.xp} XP
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-16 flex flex-col gap-2 bg-transparent">
                <Link href="/business/tools">
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm">All Tools</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex flex-col gap-2 bg-transparent">
                <Link href="/business/analytics">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Analytics</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex flex-col gap-2 bg-transparent">
                <Link href="/business/settings">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Team Settings</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex flex-col gap-2 bg-transparent">
                <Link href="/pricing">
                  <Star className="w-5 h-5" />
                  <span className="text-sm">Upgrade</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

