"use client";
import { getBrowserClient } from "@/lib/supabase/clients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Users, Gift, Star, Trophy, Flag, Sparkles } from "lucide-react"

interface PrideAlliancePreviewProps {
  isLocked?: boolean
  userTier?: string
}

export default function PrideAlliancePreview({ isLocked = false, userTier = "free_agent" }: PrideAlliancePreviewProps) {
  const mockStats = {
    totalXP: 1250,
    questsCompleted: 3,
    careKitsSent: 2,
    friendsNominated: 1,
    currentLevel: 2,
  }

  const mockQuests = [
    {
      id: "pride-drops-quest",
      title: "🎉 Complete 3 Pride Drops",
      description: "Send 3 identity-affirming gifts this week",
      xpReward: 50,
      progress: 1,
      maxProgress: 3,
      completed: false,
    },
    {
      id: "ally-squad-quest",
      title: "🫂 Join an Ally Squad",
      description: "Connect with allies and complete a group mission",
      xpReward: 25,
      progress: 0,
      maxProgress: 1,
      completed: false,
    },
    {
      id: "care-kit-quest",
      title: "💌 Send a Care Kit",
      description: "Create and send a coming-out support care kit",
      xpReward: 40,
      progress: 0,
      maxProgress: 1,
      completed: false,
    },
  ]

  const mockAllySquads = [
    {
      id: "1",
      name: "Rainbow Warriors",
      description: "Supporting LGBTQ+ youth through thoughtful gifting",
      memberCount: 247,
      currentMission: "Send care packages to LGBTQ+ teens",
      xpBonus: 15,
      isJoined: false,
    },
    {
      id: "2",
      name: "Pride Parents",
      description: "Parents and allies supporting LGBTQ+ family members",
      memberCount: 189,
      currentMission: "Create coming-out celebration kits",
      xpBonus: 20,
      isJoined: true,
    },
  ]

  if (isLocked) {
    return (
      <div className="relative">
        {/* Blur overlay for locked content */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upgrade to Premium Spy or Pro Agent to access Pride Alliance features
            </p>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
              Upgrade Now
            </Button>
          </div>
        </div>

        {/* Blurred preview content */}
        <div className="filter blur-sm">
          <PrideAllianceContent stats={mockStats} quests={mockQuests} allySquads={mockAllySquads} />
        </div>
      </div>
    )
  }

  return <PrideAllianceContent stats={mockStats} quests={mockQuests} allySquads={mockAllySquads} />
}

function PrideAllianceContent({ stats, quests, allySquads }: any) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="text-3xl">🌈</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            GiftVerse Pride Alliance™
          </h2>
          <div className="text-3xl">🏳️‍🌈</div>
        </div>
        <p className="text-gray-600 max-w-xl mx-auto">
          Inclusive emotional gifting with identity-aware suggestions, coming-out care kits, and seasonal quests
        </p>

        {/* Seasonal Banner */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white p-3 rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-sm">Pride Month - 1.5x XP Multiplier Active!</span>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="text-center">
            <Trophy className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
            <div className="text-lg font-bold">{stats.totalXP}</div>
            <div className="text-xs text-gray-600">Total XP</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <Star className="h-6 w-6 mx-auto mb-1 text-purple-500" />
            <div className="text-lg font-bold">{stats.questsCompleted}</div>
            <div className="text-xs text-gray-600">Quests Done</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <Heart className="h-6 w-6 mx-auto mb-1 text-pink-500" />
            <div className="text-lg font-bold">{stats.careKitsSent}</div>
            <div className="text-xs text-gray-600">Care Kits</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <Users className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold">{stats.friendsNominated}</div>
            <div className="text-xs text-gray-600">Nominations</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <Flag className="h-6 w-6 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold">{stats.currentLevel}</div>
            <div className="text-xs text-gray-600">Level</div>
          </div>
        </Card>
      </div>

      {/* Featured Quests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🎯 Active Pride Quests</h3>
        <div className="grid gap-4">
          {quests.slice(0, 2).map((quest: any) => (
            <Card key={quest.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{quest.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    +{quest.xpReward} XP
                  </Badge>
                </div>
                <CardDescription className="text-xs">{quest.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    Progress: {quest.progress}/{quest.maxProgress}
                  </span>
                  <Button size="sm" className="text-xs h-7 bg-gradient-to-r from-pink-500 to-purple-500">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Ally Squads */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🤝 Ally Squads</h3>
        <div className="grid gap-4">
          {allySquads.slice(0, 2).map((squad: any) => (
            <Card key={squad.id} className={squad.isJoined ? "bg-blue-50 border-blue-200" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {squad.name}
                    {squad.isJoined && (
                      <Badge variant="secondary" className="text-xs">
                        Joined
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    +{squad.xpBonus} XP Bonus
                  </Badge>
                </div>
                <CardDescription className="text-xs">{squad.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {squad.memberCount} members
                  </span>
                  {!squad.isJoined && (
                    <Button size="sm" className="text-xs h-7 bg-gradient-to-r from-blue-500 to-purple-500">
                      Join Squad
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Care Kit Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">💌 Care Kit Templates</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl mb-2">💌</div>
              <div className="text-sm font-medium">Coming Out Support</div>
              <div className="text-xs text-gray-600 mt-1">Encouraging messages and resources</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-sm font-medium">Transition Celebration</div>
              <div className="text-xs text-gray-600 mt-1">Celebrate transition journey</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
          <Heart className="h-4 w-4 mr-2" />
          Send Care Kit
        </Button>
        <Button variant="outline">
          <Gift className="h-4 w-4 mr-2" />
          Nominate Friend
        </Button>
      </div>
    </div>
  )
}

