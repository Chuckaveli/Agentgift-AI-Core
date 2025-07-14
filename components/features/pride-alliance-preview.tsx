"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Heart, Rainbow, Users, Star, Trophy, Sparkles, MessageCircle, Flag, Target, Award } from "lucide-react"
import Link from "next/link"

interface PrideAlliancePreviewProps {
  userLevel?: number
  userXP?: number
  completedQuests?: number
}

export function PrideAlliancePreview({ userLevel = 1, userXP = 0, completedQuests = 0 }: PrideAlliancePreviewProps) {
  const nextLevelXP = userLevel * 1000
  const progressToNextLevel = ((userXP % 1000) / 1000) * 100

  return (
    <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 border-pink-200 dark:border-pink-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rainbow className="h-6 w-6 text-pink-600" />
            <div>
              <CardTitle className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                GiftVerse Pride Alliance™
              </CardTitle>
              <CardDescription>Inclusive Emotional Gifting Engine</CardDescription>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">Premium Feature</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-pink-600" />
            <span>Identity-Aware Filters</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-purple-600" />
            <span>Care Kit Generator</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Ally Squad Missions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-pink-600" />
            <span>Seasonal Quests</span>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Pride Quest Progress</span>
            <span className="font-semibold">{completedQuests}/4 Completed</span>
          </div>
          <Progress value={(completedQuests / 4) * 100} className="h-2" />
        </div>

        {/* XP Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Level {userLevel} Progress</span>
            <span className="font-semibold">{userXP % 1000}/1000 XP</span>
          </div>
          <Progress value={progressToNextLevel} className="h-2" />
        </div>

        {/* Seasonal Event Banner */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200 dark:border-pink-800">
          <div className="flex items-center gap-2 mb-1">
            <Flag className="h-4 w-4 text-pink-600" />
            <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">Pride Month Active</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            1.5x XP multiplier • Special badges available • Enhanced care kits
          </div>
        </div>

        {/* Available Rewards */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Available XP Rewards:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Complete Pride Quest</span>
              <Badge variant="secondary" className="text-xs">
                +50 XP
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Send Care Kit</span>
              <Badge variant="secondary" className="text-xs">
                +40 XP
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Nominate Friend</span>
              <Badge variant="secondary" className="text-xs">
                +30 XP
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Join Ally Squad</span>
              <Badge variant="secondary" className="text-xs">
                +25 XP
              </Badge>
            </div>
          </div>
        </div>

        {/* Unlockable Badges */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Exclusive Badges:</div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 text-xs">
              <Award className="w-3 h-3 mr-1" />
              Pride Ally
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
              <Star className="w-3 h-3 mr-1" />
              Rainbow Warrior
            </Badge>
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs">
              <Trophy className="w-3 h-3 mr-1" />
              Love is a Gift
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href="/features/pride-alliance" className="flex-1">
            <Button
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              size="sm"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Pride Quests
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Care Kit
          </Button>
        </div>

        {/* Future Add-ons Preview */}
        <div className="pt-2 border-t border-pink-200 dark:border-pink-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Coming Soon:</div>
          <div className="flex flex-wrap gap-1 text-xs">
            <Badge variant="outline" className="text-xs">
              Sponsored Pride Packs
            </Badge>
            <Badge variant="outline" className="text-xs">
              Real-Time Affirmations
            </Badge>
            <Badge variant="outline" className="text-xs">
              Story Archive
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
