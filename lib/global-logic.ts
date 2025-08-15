"use client"

import { createClient } from "@/lib/supabase-client"

const supabase = createClient()

// Global Constants
export const XP_CONSTANTS = {
  CREDITS_TO_XP_RATIO: 2, // 2 credits = 1 XP
  XP_PER_LEVEL: 150,
  PRESTIGE_LEVEL: 100,
} as const

export const PRESTIGE_BENEFITS = {
  SILVER: { discount: 0.1, name: "Silver", level: 1 },
  GOLD: { discount: 0.2, name: "Gold", level: 2 },
  DIAMOND: { discount: 0.5, name: "Diamond", level: 3 },
} as const

export const TIERS = {
  FREE_AGENT: "free_agent",
  PREMIUM_SPY: "premium_spy",
  PRO_AGENT: "pro_agent",
  AGENT_00G: "agent_00g",
  SMALL_BIZ: "small_biz",
  ENTERPRISE: "enterprise",
} as const

export type UserTier = (typeof TIERS)[keyof typeof TIERS]
export type PrestigeLevel = "silver" | "gold" | "diamond" | null

// Global User Interface
export interface GlobalUser {
  id: string
  email: string
  name: string
  tier: UserTier
  xp: number
  level: number
  credits: number
  prestige_level: PrestigeLevel
  badges: string[]
  created_at: string
  updated_at: string
}

// Global Company Interface
export interface GlobalCompany {
  id: string
  name: string
  tier: UserTier
  xp: number
  level: number
  credits: number
  prestige_level: PrestigeLevel
  badges: string[]
  created_at: string
  updated_at: string
}

// XP Engine
export class XPEngine {
  static calculateLevel(xp: number): number {
    return Math.floor(xp / XP_CONSTANTS.XP_PER_LEVEL) + 1
  }

  static calculateXPFromCredits(credits: number): number {
    return Math.floor(credits / XP_CONSTANTS.CREDITS_TO_XP_RATIO)
  }

  static getXPForNextLevel(currentXP: number): number {
    const currentLevel = this.calculateLevel(currentXP)
    return currentLevel * XP_CONSTANTS.XP_PER_LEVEL
  }

  static getProgressToNextLevel(currentXP: number): number {
    const currentLevel = this.calculateLevel(currentXP)
    const xpInCurrentLevel = currentXP - (currentLevel - 1) * XP_CONSTANTS.XP_PER_LEVEL
    return (xpInCurrentLevel / XP_CONSTANTS.XP_PER_LEVEL) * 100
  }

  static shouldTriggerPrestige(level: number): boolean {
    return level >= XP_CONSTANTS.PRESTIGE_LEVEL
  }

  static async addXP(userId: string, xpAmount: number, reason?: string): Promise<void> {
    try {
      const { data: user } = await supabase
        .from("user_profiles")
        .select("xp, level, prestige_level")
        .eq("id", userId)
        .single()

      if (!user) return

      const newXP = user.xp + xpAmount
      const newLevel = this.calculateLevel(newXP)
      const shouldPrestige = this.shouldTriggerPrestige(newLevel) && !user.prestige_level

      await supabase
        .from("user_profiles")
        .update({
          xp: newXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      // Log XP gain
      await supabase.from("xp_logs").insert({
        user_id: userId,
        xp_amount: xpAmount,
        reason: reason || "Unknown",
        created_at: new Date().toISOString(),
      })

      // Trigger prestige if needed
      if (shouldPrestige) {
        await this.triggerPrestige(userId, "silver")
      }
    } catch (error) {
      console.error("Error adding XP:", error)
    }
  }

  static async triggerPrestige(userId: string, prestigeLevel: PrestigeLevel): Promise<void> {
    try {
      await supabase
        .from("user_profiles")
        .update({
          prestige_level: prestigeLevel,
          level: 1, // Reset level
          xp: 0, // Reset XP
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      // Log prestige achievement
      await supabase.from("prestige_logs").insert({
        user_id: userId,
        prestige_level: prestigeLevel,
        achieved_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error triggering prestige:", error)
    }
  }
}

// Badge System
export const BADGE_TYPES = {
  LEVEL: "level",
  SEASONAL: "seasonal",
  PRESTIGE: "prestige",
  ACTION: "action",
} as const

export type BadgeType = (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES]

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  type: BadgeType
  rarity: "common" | "rare" | "epic" | "legendary"
  requirements: Record<string, any>
  xp_reward: number
}

export class BadgeSystem {
  static async unlockBadge(userId: string, badgeId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.from("user_profiles").select("badges").eq("id", userId).single()

      if (!user || user.badges.includes(badgeId)) return false

      const { data: badge } = await supabase.from("badges").select("*").eq("id", badgeId).single()

      if (!badge) return false

      // Update user badges
      await supabase
        .from("user_profiles")
        .update({
          badges: [...user.badges, badgeId],
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      // Add XP reward
      await XPEngine.addXP(userId, badge.xp_reward, `Badge unlocked: ${badge.name}`)

      // Log badge unlock
      await supabase.from("badge_unlocks").insert({
        user_id: userId,
        badge_id: badgeId,
        unlocked_at: new Date().toISOString(),
      })

      return true
    } catch (error) {
      console.error("Error unlocking badge:", error)
      return false
    }
  }

  static async checkLevelBadges(userId: string, level: number): Promise<void> {
    const levelBadges = [
      { level: 5, badgeId: "first_steps" },
      { level: 10, badgeId: "getting_started" },
      { level: 25, badgeId: "experienced" },
      { level: 50, badgeId: "expert" },
      { level: 100, badgeId: "master" },
    ]

    for (const { level: requiredLevel, badgeId } of levelBadges) {
      if (level >= requiredLevel) {
        await this.unlockBadge(userId, badgeId)
      }
    }
  }
}

// Tier Enforcement
export class TierEnforcement {
  static hasAccess(userTier: UserTier, requiredTier: UserTier): boolean {
    const tierHierarchy = {
      [TIERS.FREE_AGENT]: 0,
      [TIERS.PREMIUM_SPY]: 1,
      [TIERS.PRO_AGENT]: 2,
      [TIERS.AGENT_00G]: 3,
      [TIERS.SMALL_BIZ]: 4,
      [TIERS.ENTERPRISE]: 5,
    }

    return tierHierarchy[userTier] >= tierHierarchy[requiredTier]
  }

  static getUpgradeUrl(targetTier?: UserTier): string {
    return targetTier ? `/pricing?tier=${targetTier}` : "/pricing"
  }
}

// Credit Fallback System
export class CreditSystem {
  static async deductCredits(userId: string, amount: number, reason: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.from("user_profiles").select("credits").eq("id", userId).single()

      if (!user || user.credits < amount) return false

      await supabase
        .from("user_profiles")
        .update({
          credits: user.credits - amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      // Log credit usage
      await supabase.from("credit_logs").insert({
        user_id: userId,
        amount: -amount,
        reason,
        created_at: new Date().toISOString(),
      })

      // Convert credits to XP
      const xpGained = XPEngine.calculateXPFromCredits(amount)
      if (xpGained > 0) {
        await XPEngine.addXP(userId, xpGained, `Credits spent: ${reason}`)
      }

      return true
    } catch (error) {
      console.error("Error deducting credits:", error)
      return false
    }
  }

  static async addCredits(userId: string, amount: number, reason: string): Promise<void> {
    try {
      const { data: user } = await supabase.from("user_profiles").select("credits").eq("id", userId).single()

      if (!user) return

      await supabase
        .from("user_profiles")
        .update({
          credits: user.credits + amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      // Log credit addition
      await supabase.from("credit_logs").insert({
        user_id: userId,
        amount,
        reason,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error adding credits:", error)
    }
  }
}

// Company XP System
export class CompanyXPEngine {
  static async addCompanyXP(companyId: string, xpAmount: number, reason: string): Promise<void> {
    try {
      const { data: company } = await supabase.from("companies").select("xp, level").eq("id", companyId).single()

      if (!company) return

      const newXP = company.xp + xpAmount
      const newLevel = XPEngine.calculateLevel(newXP)

      await supabase
        .from("companies")
        .update({
          xp: newXP,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyId)

      // Log company XP
      await supabase.from("company_xp_logs").insert({
        company_id: companyId,
        xp_amount: xpAmount,
        reason,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error adding company XP:", error)
    }
  }
}
