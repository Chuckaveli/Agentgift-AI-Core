"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Star, Trophy, Zap } from "lucide-react"
import { XPEngine, type PrestigeLevel } from "@/lib/global-logic"

interface XPTrackerProps {
  xp: number
  level: number
  prestigeLevel?: PrestigeLevel
  showDetails?: boolean
  compact?: boolean
}

export function XPTracker({ xp, level, prestigeLevel, showDetails = true, compact = false }: XPTrackerProps) {
  const progressPercentage = XPEngine.getProgressToNextLevel(xp)
  const xpForNext = XPEngine.getXPForNextLevel(xp)
  const xpInCurrentLevel = xp - (level - 1) * 150

  const getPrestigeColor = (prestige: PrestigeLevel) => {
    switch (prestige) {
      case "silver":
        return "bg-gray-400 text-gray-900"
      case "gold":
        return "bg-yellow-400 text-yellow-900"
      case "diamond":
        return "bg-blue-400 text-blue-900"
      default:
        return "bg-purple-400 text-purple-900"
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-medium">Level {level}</span>
          {prestigeLevel && (
            <Badge className={`text-xs ${getPrestigeColor(prestigeLevel)}`}>
              <Trophy className="w-3 h-3 mr-1" />
              {prestigeLevel}
            </Badge>
          )}
        </div>
        <div className="flex-1 max-w-32">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">{xp} XP</span>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold">Level {level}</span>
              {prestigeLevel && (
                <Badge className={`${getPrestigeColor(prestigeLevel)}`}>
                  <Trophy className="w-4 h-4 mr-1" />
                  {prestigeLevel.charAt(0).toUpperCase() + prestigeLevel.slice(1)}
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{xp}</div>
              <div className="text-xs text-gray-500">Total XP</div>
            </div>
          </div>

          {showDetails && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progress to Level {level + 1}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {xpInCurrentLevel}/{150} XP
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold text-green-600">{Math.floor(progressPercentage)}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold text-blue-600">{150 - xpInCurrentLevel}</div>
                  <div className="text-xs text-gray-500">XP Needed</div>
                </div>
              </div>

              {level >= 100 && !prestigeLevel && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Prestige Available!</span>
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    You can now prestige to unlock exclusive benefits and start over with bonuses.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
