"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import { Trophy, Star, Zap, Gift, Heart } from "lucide-react"
import { getAllActiveMultipliers, getSeasonalGreeting } from "@/lib/seasonal-triggers"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  rarity: "common" | "rare" | "epic" | "legendary"
  xpReward: number
}

interface GamificationContextType {
  xp: number
  level: number
  credits: number
  badges: string[]
  addXP: (amount: number, reason?: string) => void
  addCredits: (amount: number, reason?: string) => void
  unlockAchievement: (achievementId: string) => void
  showXPGain: (amount: number, reason?: string) => void
  showBadgeUnlock: (badge: string) => void
  getSeasonalWelcome: () => string | undefined
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

const achievements: Achievement[] = [
  {
    id: "first-gift",
    title: "First Gift",
    description: "Found your first perfect gift!",
    icon: Gift,
    rarity: "common",
    xpReward: 100,
  },
  {
    id: "gift-master",
    title: "Gift Master",
    description: "Found 10 perfect gifts",
    icon: Trophy,
    rarity: "rare",
    xpReward: 500,
  },
  {
    id: "budget-hero",
    title: "Budget Hero",
    description: "Found amazing gifts under $25",
    icon: Star,
    rarity: "epic",
    xpReward: 250,
  },
  {
    id: "eco-warrior",
    title: "Eco Warrior",
    description: "Chose sustainable gifts 5 times",
    icon: Heart,
    rarity: "legendary",
    xpReward: 1000,
  },
]

interface GamificationProviderProps {
  children: ReactNode
  initialXP?: number
  initialLevel?: number
  initialCredits?: number
  initialBadges?: string[]
}

export function GamificationProvider({
  children,
  initialXP = 0,
  initialLevel = 1,
  initialCredits = 100,
  initialBadges = [],
}: GamificationProviderProps) {
  const [xp, setXP] = useState(initialXP)
  const [level, setLevel] = useState(initialLevel)
  const [credits, setCredits] = useState(initialCredits)
  const [badges, setBadges] = useState<string[]>(initialBadges)

  // Calculate level based on XP
  useEffect(() => {
    const newLevel = Math.floor(xp / 1000) + 1
    if (newLevel > level) {
      setLevel(newLevel)
      showLevelUp(newLevel)
    }
  }, [xp, level])

  const addXP = (amount: number, reason?: string) => {
    const multipliers = getAllActiveMultipliers()
    const seasonalAmount = Math.floor(amount * multipliers.xp)

    setXP((prev) => prev + seasonalAmount)

    // Show seasonal bonus if applicable
    if (multipliers.xp > 1.0) {
      const bonus = seasonalAmount - amount
      showXPGain(seasonalAmount, reason)
      if (bonus > 0) {
        setTimeout(() => {
          toast.success(`🎉 Seasonal Bonus: +${bonus} XP!`, {
            description: "Active season multiplier applied",
            duration: 3000,
          })
        }, 500)
      }
    } else {
      showXPGain(seasonalAmount, reason)
    }
  }

  const addCredits = (amount: number, reason?: string) => {
    const multipliers = getAllActiveMultipliers()
    const seasonalAmount = Math.floor(amount * multipliers.credits)

    setCredits((prev) => prev + seasonalAmount)

    // Show seasonal bonus if applicable
    if (multipliers.credits > 1.0) {
      const bonus = seasonalAmount - amount
      toast.success(`+${seasonalAmount} credits earned!`, {
        description: reason,
        duration: 3000,
      })
      if (bonus > 0) {
        setTimeout(() => {
          toast.success(`🎊 Seasonal Bonus: +${bonus} credits!`, {
            description: "Active season multiplier applied",
            duration: 3000,
          })
        }, 500)
      }
    } else {
      toast.success(`+${seasonalAmount} credits earned!`, {
        description: reason,
        duration: 3000,
      })
    }
  }

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find((a) => a.id === achievementId)
    if (achievement && !badges.includes(achievement.title)) {
      setBadges((prev) => [...prev, achievement.title])
      addXP(achievement.xpReward, `Achievement: ${achievement.title}`)
      showBadgeUnlock(achievement.title)
    }
  }

  const showXPGain = (amount: number, reason?: string) => {
    toast.success(`+${amount} XP`, {
      description: reason,
      duration: 2000,
      icon: <Zap className="h-4 w-4 text-yellow-500" />,
    })
  }

  const showBadgeUnlock = (badge: string) => {
    toast.success("Achievement Unlocked!", {
      description: (
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span>{badge}</span>
        </div>
      ),
      duration: 4000,
    })
  }

  const showLevelUp = (newLevel: number) => {
    toast.success(`Level Up! You're now level ${newLevel}`, {
      description: "Keep up the great gifting!",
      duration: 4000,
      icon: <Star className="h-4 w-4 text-purple-500" />,
    })
  }

  const getSeasonalWelcome = () => {
    return getSeasonalGreeting()
  }

  const value = {
    xp,
    level,
    credits,
    badges,
    addXP,
    addCredits,
    unlockAchievement,
    showXPGain,
    showBadgeUnlock,
    getSeasonalWelcome,
  }

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider")
  }
  return context
}

// Achievement trigger hooks
export function useAchievementTriggers() {
  const { unlockAchievement } = useGamification()

  const triggerFirstGift = () => unlockAchievement("first-gift")
  const triggerGiftMaster = () => unlockAchievement("gift-master")
  const triggerBudgetHero = () => unlockAchievement("budget-hero")
  const triggerEcoWarrior = () => unlockAchievement("eco-warrior")

  return {
    triggerFirstGift,
    triggerGiftMaster,
    triggerBudgetHero,
    triggerEcoWarrior,
  }
}
