// Giftverse Constants - Tier rules, XP rewards, rate limits

export const TIERS = {
  FREE: {
    name: "FREE",
    features: ["smart-search", "basic-recommendations"],
    limits: {
      demo_sessions: 1,
      monthly_searches: 10,
      saved_recipients: 3,
      gift_suggestions: 5,
    },
    xp_multiplier: 1,
  },
  PRO: {
    name: "PRO",
    features: ["smart-search", "agent-gifty", "gut-check", "basic-recommendations", "save-gifts"],
    limits: {
      demo_sessions: 1,
      monthly_searches: 100,
      saved_recipients: 25,
      gift_suggestions: 50,
      voice_interactions: 20,
    },
    xp_multiplier: 1.5,
  },
  PRO_PLUS: {
    name: "PRO+",
    features: [
      "smart-search",
      "agent-gifty",
      "gut-check",
      "emotion-tags",
      "group-gifting",
      "advanced-recommendations",
      "priority-support",
    ],
    limits: {
      demo_sessions: 1,
      monthly_searches: 500,
      saved_recipients: 100,
      gift_suggestions: 200,
      voice_interactions: 100,
      group_campaigns: 10,
    },
    xp_multiplier: 2,
  },
  ENTERPRISE: {
    name: "ENTERPRISE",
    features: [
      "smart-search",
      "agent-gifty",
      "gut-check",
      "emotion-tags",
      "group-gifting",
      "cultural-respect",
      "white-label",
      "api-access",
      "custom-integrations",
      "dedicated-support",
    ],
    limits: {
      demo_sessions: 1,
      monthly_searches: -1, // unlimited
      saved_recipients: -1,
      gift_suggestions: -1,
      voice_interactions: -1,
      group_campaigns: -1,
      api_calls: -1,
    },
    xp_multiplier: 3,
  },
} as const

export const XP_REWARDS = {
  SIGNUP_BONUS: 50,
  DEMO_COMPLETION: 25,
  FIRST_GIFT_FOUND: 10,
  DAILY_LOGIN: 5,
  FEATURE_USAGE: 3,
  GIFT_SHARED: 8,
  RECIPIENT_ADDED: 5,
  VOICE_INTERACTION: 2,
  CULTURAL_AWARENESS: 15,
  REFERRAL_SIGNUP: 100,
  LEVEL_UP_BONUS: 50,
} as const

export const RATE_LIMITS = {
  DEMO_FINISH: {
    window: 60 * 1000, // 1 minute
    max: 3, // 3 attempts per minute
  },
  ONBOARD: {
    window: 5 * 60 * 1000, // 5 minutes
    max: 5, // 5 attempts per 5 minutes
  },
  FEATURE_ACCESS: {
    window: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
  },
} as const

export const FEATURE_PERMISSIONS = {
  "smart-search": ["FREE", "PRO", "PRO+", "ENTERPRISE"],
  "agent-gifty": ["PRO", "PRO+", "ENTERPRISE"],
  "gut-check": ["PRO", "PRO+", "ENTERPRISE"],
  "emotion-tags": ["PRO+", "ENTERPRISE"],
  "group-gifting": ["PRO+", "ENTERPRISE"],
  "cultural-respect": ["ENTERPRISE"],
  "voice-interactions": ["PRO", "PRO+", "ENTERPRISE"],
  "api-access": ["ENTERPRISE"],
  "white-label": ["ENTERPRISE"],
} as const

export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  1000, // Level 5
  2000, // Level 6
  4000, // Level 7
  8000, // Level 8
  15000, // Level 9
  25000, // Level 10
] as const

export function getUserLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  }
  return LEVEL_THRESHOLDS[currentLevel] || 100
}

export function hasFeatureAccess(userTier: string, feature: string): boolean {
  const allowedTiers = FEATURE_PERMISSIONS[feature as keyof typeof FEATURE_PERMISSIONS]
  return allowedTiers ? allowedTiers.includes(userTier as any) : false
}

export function canUseFeature(userTier: string, feature: string, usageCount: number): boolean {
  if (!hasFeatureAccess(userTier, feature)) {
    return false
  }

  const tierConfig = TIERS[userTier as keyof typeof TIERS]
  if (!tierConfig) return false

  // Check specific limits based on feature
  switch (feature) {
    case "smart-search":
      return tierConfig.limits.monthly_searches === -1 || usageCount < tierConfig.limits.monthly_searches
    case "voice-interactions":
      const voiceLimit = tierConfig.limits.voice_interactions
      return typeof voiceLimit === "number" && (voiceLimit === -1 || usageCount < voiceLimit)
    case "group-gifting":
      const groupLimit = tierConfig.limits.group_campaigns
      return typeof groupLimit === "number" && (groupLimit === -1 || usageCount < groupLimit)
    default:
      return true
  }
}
