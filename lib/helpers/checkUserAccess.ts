"use client"

import React from "react"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

export interface AccessCheckResult {
  accessGranted: boolean
  fallbackReason?:
    | "no_auth"
    | "insufficient_tier"
    | "insufficient_credits"
    | "feature_disabled"
  creditsLeft: number
  upgradeRequired: boolean
  requiredTier?: string
  currentTier?: string
  creditsNeeded?: number
}

export interface FeatureConfig {
  name: string
  requiredTier: string
  creditsNeeded: number
  enabled: boolean
}

// Feature configurations
export const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  "gift-gut-check": {
    name: "Gift Gut Check",
    requiredTier: "free_agent",
    creditsNeeded: 1,
    enabled: true,
  },
  "agent-gifty": {
    name: "Agent Gifty",
    requiredTier: "premium_spy",
    creditsNeeded: 2,
    enabled: true,
  },
  "ai-companion": {
    name: "AI Companion",
    requiredTier: "agent_00g",
    creditsNeeded: 5,
    enabled: true,
  },
  "gift-campaigns": {
    name: "Gift Campaigns",
    requiredTier: "pro_agent",
    creditsNeeded: 3,
    enabled: true,
  },
  "reminder-scheduler": {
    name: "Smart Reminders",
    requiredTier: "pro_agent",
    creditsNeeded: 1,
    enabled: true,
  },
  "social-proof-verifier": {
    name: "Social Participation",
    requiredTier: "premium_spy",
    creditsNeeded: 0,
    enabled: true,
  },
}

export async function checkUserAccess(featureName: string): Promise<AccessCheckResult> {
  const supabase = createClientComponentClient<Database>()

  try {
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        accessGranted: false,
        fallbackReason: "no_auth",
        creditsLeft: 0,
        upgradeRequired: false,
      }
    }

    // Get feature config
    const featureConfig = FEATURE_CONFIGS[featureName]

    if (!featureConfig || !featureConfig.enabled) {
      return {
        accessGranted: false,
        fallbackReason: "feature_disabled",
        creditsLeft: 0,
        upgradeRequired: false,
      }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("tier, credits, xp, level")
      .eq("id", session.user.id)
      .single()

    if (!profile) {
      return {
        accessGranted: false,
        fallbackReason: "no_auth",
        creditsLeft: 0,
        upgradeRequired: false,
      }
    }

    const tierLevels = {
      free_agent: 0,
      premium_spy: 1,
      pro_agent: 2,
      agent_00g: 3,
      small_biz: 4,
      enterprise: 5,
    }

    const userTierLevel = tierLevels[profile.tier as keyof typeof tierLevels] || 0
    const requiredTierLevel = tierLevels[featureConfig.requiredTier as keyof typeof tierLevels] || 0

    // Check tier access
    if (userTierLevel < requiredTierLevel) {
      return {
        accessGranted: false,
        fallbackReason: "insufficient_tier",
        creditsLeft: profile.credits || 0,
        upgradeRequired: true,
        requiredTier: featureConfig.requiredTier,
        currentTier: profile.tier,
      }
    }

    // Check credit availability
    if (profile.credits < featureConfig.creditsNeeded) {
      return {
        accessGranted: false,
        fallbackReason: "insufficient_credits",
        creditsLeft: profile.credits || 0,
        upgradeRequired: false,
        creditsNeeded: featureConfig.creditsNeeded,
      }
    }

    // Access granted
    return {
      accessGranted: true,
      creditsLeft: profile.credits || 0,
      upgradeRequired: false,
      currentTier: profile.tier,
    }
  } catch (error) {
    console.error("Access check error:", error)
    return {
      accessGranted: false,
      fallbackReason: "no_auth",
      creditsLeft: 0,
      upgradeRequired: false,
    }
  }
}

// Client-side hook for React components
export function useUserAccess(featureName: string) {
  const [accessResult, setAccessResult] = React.useState<AccessCheckResult | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    checkUserAccess(featureName).then((result) => {
      setAccessResult(result)
      setLoading(false)
    })
  }, [featureName])

  return { accessResult, loading, refetch: () => checkUserAccess(featureName) }
}
