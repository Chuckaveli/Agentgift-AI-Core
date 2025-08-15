"use client"

import { createClient } from "@/lib/supabase-client"

// Supabase client
const supabase = createClient()

// Tier hierarchy and definitions
export const TIERS = {
  FREE_AGENT: "free_agent",
  PREMIUM_SPY: "premium_spy",
  PRO_AGENT: "pro_agent",
  AGENT_00G: "agent_00g",
  SMALL_BIZ: "small_biz",
  ENTERPRISE: "enterprise",
} as const

export type UserTier = (typeof TIERS)[keyof typeof TIERS]

// Tier hierarchy levels (higher number = higher tier)
export const TIER_LEVELS: Record<UserTier, number> = {
  [TIERS.FREE_AGENT]: 0,
  [TIERS.PREMIUM_SPY]: 1,
  [TIERS.PRO_AGENT]: 2,
  [TIERS.AGENT_00G]: 3,
  [TIERS.SMALL_BIZ]: 4,
  [TIERS.ENTERPRISE]: 5,
}

// Tier display names
export const TIER_NAMES: Record<UserTier, string> = {
  [TIERS.FREE_AGENT]: "Free Agent",
  [TIERS.PREMIUM_SPY]: "Premium Spy",
  [TIERS.PRO_AGENT]: "Pro Agent",
  [TIERS.AGENT_00G]: "Agent 00G",
  [TIERS.SMALL_BIZ]: "Small Business",
  [TIERS.ENTERPRISE]: "Enterprise",
}

// Feature definitions with required tiers
export const FEATURES = {
  // Core features
  AI_RECOMMENDATIONS: "ai_recommendations",
  GIFT_HISTORY: "gift_history",
  BASIC_PERSONALITY: "basic_personality",

  // Premium features
  ADVANCED_PERSONALITY: "advanced_personality",
  OCCASION_TRACKER: "occasion_tracker",
  WISHLIST_CREATOR: "wishlist_creator",

  // Pro features
  UNLIMITED_RECOMMENDATIONS: "unlimited_recommendations",
  BUDGET_OPTIMIZER: "budget_optimizer",
  SENTIMENT_ANALYSIS: "sentiment_analysis",
  CUSTOM_CATEGORIES: "custom_categories",
  PHOTO_ANALYSIS: "photo_analysis",

  // Agent 00G features
  GIFT_CONCIERGE: "gift_concierge",
  CUSTOM_AI_TRAINING: "custom_ai_training",
  DELIVERY_COORDINATION: "delivery_coordination",
  VOICE_ASSISTANT: "voice_assistant",

  // Business features
  TEAM_COLLABORATION: "team_collaboration",
  ANALYTICS_DASHBOARD: "analytics_dashboard",
  API_ACCESS: "api_access",
  CUSTOM_BRANDING: "custom_branding",
  SSO_INTEGRATION: "sso_integration",

  // Enterprise features
  UNLIMITED_USERS: "unlimited_users",
  CUSTOM_INTEGRATIONS: "custom_integrations",
  DEDICATED_SUPPORT: "dedicated_support",
  CUSTOM_SLA: "custom_sla",
  ADVANCED_SECURITY: "advanced_security",
} as const

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES]

// Feature access requirements
export const FEATURE_ACCESS: Record<
  FeatureKey,
  {
    requiredTier: UserTier
    trialAllowed: boolean
    usageLimit?: number
    description: string
  }
> = {
  // Free tier features
  [FEATURES.AI_RECOMMENDATIONS]: {
    requiredTier: TIERS.FREE_AGENT,
    trialAllowed: false,
    usageLimit: 5,
    description: "AI-powered gift recommendations",
  },
  [FEATURES.GIFT_HISTORY]: {
    requiredTier: TIERS.FREE_AGENT,
    trialAllowed: false,
    description: "Track your gift-giving history",
  },
  [FEATURES.BASIC_PERSONALITY]: {
    requiredTier: TIERS.FREE_AGENT,
    trialAllowed: false,
    description: "Basic personality analysis",
  },

  // Premium tier features
  [FEATURES.ADVANCED_PERSONALITY]: {
    requiredTier: TIERS.PREMIUM_SPY,
    trialAllowed: true,
    description: "Advanced personality insights",
  },
  [FEATURES.OCCASION_TRACKER]: {
    requiredTier: TIERS.PREMIUM_SPY,
    trialAllowed: true,
    description: "Never miss important occasions",
  },
  [FEATURES.WISHLIST_CREATOR]: {
    requiredTier: TIERS.PREMIUM_SPY,
    trialAllowed: false,
    description: "Create and manage wishlists",
  },

  // Pro tier features
  [FEATURES.UNLIMITED_RECOMMENDATIONS]: {
    requiredTier: TIERS.PRO_AGENT,
    trialAllowed: false,
    description: "Unlimited AI recommendations",
  },
  [FEATURES.BUDGET_OPTIMIZER]: {
    requiredTier: TIERS.PRO_AGENT,
    trialAllowed: true,
    description: "Smart budget allocation",
  },
  [FEATURES.SENTIMENT_ANALYSIS]: {
    requiredTier: TIERS.PRO_AGENT,
    trialAllowed: true,
    description: "Analyze recipient emotions",
  },
  [FEATURES.CUSTOM_CATEGORIES]: {
    requiredTier: TIERS.PRO_AGENT,
    trialAllowed: false,
    description: "Create custom gift categories",
  },
  [FEATURES.PHOTO_ANALYSIS]: {
    requiredTier: TIERS.PRO_AGENT,
    trialAllowed: true,
    description: "Analyze photos for preferences",
  },

  // Agent 00G features
  [FEATURES.GIFT_CONCIERGE]: {
    requiredTier: TIERS.AGENT_00G,
    trialAllowed: true,
    description: "Personal gift concierge service",
  },
  [FEATURES.CUSTOM_AI_TRAINING]: {
    requiredTier: TIERS.AGENT_00G,
    trialAllowed: false,
    description: "Train AI on your preferences",
  },
  [FEATURES.DELIVERY_COORDINATION]: {
    requiredTier: TIERS.AGENT_00G,
    trialAllowed: false,
    description: "Coordinate gift deliveries",
  },
  [FEATURES.VOICE_ASSISTANT]: {
    requiredTier: TIERS.AGENT_00G,
    trialAllowed: true,
    description: "Voice-powered recommendations",
  },

  // Business features
  [FEATURES.TEAM_COLLABORATION]: {
    requiredTier: TIERS.SMALL_BIZ,
    trialAllowed: true,
    description: "Collaborate with team members",
  },
  [FEATURES.ANALYTICS_DASHBOARD]: {
    requiredTier: TIERS.SMALL_BIZ,
    trialAllowed: false,
    description: "Advanced analytics and insights",
  },
  [FEATURES.API_ACCESS]: {
    requiredTier: TIERS.SMALL_BIZ,
    trialAllowed: false,
    description: "API access for integrations",
  },
  [FEATURES.CUSTOM_BRANDING]: {
    requiredTier: TIERS.SMALL_BIZ,
    trialAllowed: false,
    description: "Custom branding options",
  },
  [FEATURES.SSO_INTEGRATION]: {
    requiredTier: TIERS.SMALL_BIZ,
    trialAllowed: false,
    description: "Single sign-on integration",
  },

  // Enterprise features
  [FEATURES.UNLIMITED_USERS]: {
    requiredTier: TIERS.ENTERPRISE,
    trialAllowed: false,
    description: "Unlimited team members",
  },
  [FEATURES.CUSTOM_INTEGRATIONS]: {
    requiredTier: TIERS.ENTERPRISE,
    trialAllowed: false,
    description: "Custom system integrations",
  },
  [FEATURES.DEDICATED_SUPPORT]: {
    requiredTier: TIERS.ENTERPRISE,
    trialAllowed: false,
    description: "Dedicated support team",
  },
  [FEATURES.CUSTOM_SLA]: {
    requiredTier: TIERS.ENTERPRISE,
    trialAllowed: false,
    description: "Custom service level agreement",
  },
  [FEATURES.ADVANCED_SECURITY]: {
    requiredTier: TIERS.ENTERPRISE,
    trialAllowed: false,
    description: "Advanced security features",
  },
}

// User interface
export interface User {
  id: string
  email: string
  tier: UserTier
  trial_features_used: string[]
  feature_usage: Record<string, number>
  created_at: string
  updated_at: string
}

// Feature access result
export interface FeatureAccessResult {
  hasAccess: boolean
  reason?: "tier_insufficient" | "usage_limit_exceeded" | "trial_used"
  requiredTier?: UserTier
  canTrial?: boolean
  usageRemaining?: number
}

// Core feature access functions
export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

    if (!profile) return null

    return {
      id: profile.id,
      email: profile.email,
      tier: profile.tier || TIERS.FREE_AGENT,
      trial_features_used: profile.trial_features_used || [],
      feature_usage: profile.feature_usage || {},
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export function checkFeatureAccess(
  userTier: UserTier,
  feature: FeatureKey,
  trialFeaturesUsed: string[] = [],
  featureUsage: Record<string, number> = {},
): FeatureAccessResult {
  const featureConfig = FEATURE_ACCESS[feature]
  const userTierLevel = TIER_LEVELS[userTier]
  const requiredTierLevel = TIER_LEVELS[featureConfig.requiredTier]

  // Check if user's tier is sufficient
  if (userTierLevel >= requiredTierLevel) {
    // Check usage limits for free tier
    if (featureConfig.usageLimit) {
      const currentUsage = featureUsage[feature] || 0
      if (currentUsage >= featureConfig.usageLimit) {
        return {
          hasAccess: false,
          reason: "usage_limit_exceeded",
          requiredTier: featureConfig.requiredTier,
          usageRemaining: 0,
        }
      }
      return {
        hasAccess: true,
        usageRemaining: featureConfig.usageLimit - currentUsage,
      }
    }

    return { hasAccess: true }
  }

  // Check if trial is available
  const canTrial = featureConfig.trialAllowed && !trialFeaturesUsed.includes(feature)

  return {
    hasAccess: false,
    reason: "tier_insufficient",
    requiredTier: featureConfig.requiredTier,
    canTrial,
  }
}

export function canTryFeatureOnce(feature: FeatureKey, trialFeaturesUsed: string[] = []): boolean {
  const featureConfig = FEATURE_ACCESS[feature]
  return featureConfig.trialAllowed && !trialFeaturesUsed.includes(feature)
}

export async function recordFeatureUsage(userId: string, feature: FeatureKey, isTrial = false): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("feature_usage, trial_features_used")
      .eq("id", userId)
      .single()

    if (!profile) return

    const featureUsage = profile.feature_usage || {}
    const trialFeaturesUsed = profile.trial_features_used || []

    // Update usage count
    featureUsage[feature] = (featureUsage[feature] || 0) + 1

    // Mark trial as used if applicable
    if (isTrial && !trialFeaturesUsed.includes(feature)) {
      trialFeaturesUsed.push(feature)
    }

    await supabase
      .from("user_profiles")
      .update({
        feature_usage: featureUsage,
        trial_features_used: trialFeaturesUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  } catch (error) {
    console.error("Error recording feature usage:", error)
  }
}

export function getUpgradeUrl(targetTier?: UserTier): string {
  const baseUrl = "/pricing"
  if (targetTier) {
    return `${baseUrl}?tier=${targetTier}`
  }
  return baseUrl
}
