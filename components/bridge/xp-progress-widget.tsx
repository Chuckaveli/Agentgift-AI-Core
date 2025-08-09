"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Zap, Star, TrendingUp, Gift, Users, Heart } from "lucide-react"
import { useState, useEffect } from "react"

interface XPTransaction {
  id: string
  reason: string
  amount: number
  created_at: string
  icon?: string
}

interface XPProgressProps {
  currentXP: number
  level: number
  lifetimeXP: number
  transactions?: XPTransaction[]
}

export function XPProgressWidget({ currentXP, level, lifetimeXP, transactions = [] }: XPProgressProps) {
  const [animatedXP, setAnimatedXP] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const nextLevelXP = level * 100 // Simple calculation
  const progressPercentage = currentXP % 100
  const xpToNextLevel = 100 - (currentXP % 100)

  useEffect(() => {
    // Animate XP counter
    const timer = setTimeout(() => {
      setAnimatedXP(currentXP)
    }, 300)

    return () => clearTimeout(timer)
  }, [currentXP])

  const getTransactionIcon = (reason: string) => {
    if (reason.includes("signup") || reason.includes("Welcome")) return Gift
    if (reason.includes("level") || reason.includes("Level")) return Star
    if (reason.includes("feature") || reason.includes("usage")) return Zap
    if (reason.includes("social") || reason.includes("share")) return Users
    if (reason.includes("gift") || reason.includes("recommendation")) return Heart
    return TrendingUp
  }

  const getLevelBadgeColor = (level: number) => {
    if (level >= 10) return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
    if (level >= 7) return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
    if (level >= 4) return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
    return "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
  }

  const getXPColor = (amount: number) => {
    if (amount >= 50) return "text-purple-600"
    if (amount >= 25) return "text-blue-600"
    if (amount >= 10) return "text-green-600"
    return "text-gray-600"
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Level up animation overlay */}
      {showLevelUp && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center z-10 animate-pulse">
          <div className="text-center">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-2 animate-bounce" />
            <p className="text-lg font-bold text-purple-700">Level Up!</p>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>XP Progress</span>
          </div>
          <Badge className={`${getLevelBadgeColor(level)} border-0`}>
            <Star className="w-3 h-3 mr-1" />
            Level {level}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* XP Display */}
        <div className="text-center space-y-2">
          <div className="relative">
            <p className="text-3xl font-bold text-gray-900 transition-all duration-500">
              {animatedXP.toLocaleString()} XP
            </p>
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-sm text-gray-600">Lifetime: {lifetimeXP.toLocaleString()} XP</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress to Level {level + 1}</span>
            <span className="text-gray-600">{xpToNextLevel} XP to go</span>
          </div>

          <div className="relative">
            <Progress value={progressPercentage} className="w-full h-3 bg-gray-200" />
            {/* Glow effect */}
            <div
              className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-50 blur-sm transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">{progressPercentage.toFixed(1)}% complete</p>
          </div>
        </div>

        {/* Recent XP Activity */}
        {transactions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              Recent Activity
            </h4>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {transactions.slice(0, 5).map((transaction) => {
                const IconComponent = getTransactionIcon(transaction.reason)
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 truncate max-w-32">{transaction.reason}</span>
                    </div>
                    <span className={`font-medium ${getXPColor(transaction.amount)}`}>+{transaction.amount} XP</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* XP Tips */}
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <h5 className="text-sm font-medium text-purple-800 mb-2">💡 Earn More XP</h5>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>• Use features daily (+3 XP each)</li>
            <li>• Share gift recommendations (+8 XP)</li>
            <li>• Add new recipients (+5 XP)</li>
            <li>• Complete cultural awareness tasks (+15 XP)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
