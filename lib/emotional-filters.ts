"use client"

import { TIERS, type UserTier } from "./feature-access"

export interface EmotionalFilter {
  id: string
  name: string
  description: string
  category: "emotion" | "love_vibe" | "intent" | "hidden"
  icon: string
  color: string
  requiredTier: UserTier
  trending?: boolean
  weeklyTrend?: boolean
  searchTerms: string[]
  giftTypes: string[]
  priceRange?: "budget" | "mid" | "luxury"
  occasions: string[]
}

export const EMOTIONAL_FILTERS: EmotionalFilter[] = [
  // Basic Emotion Tags (Free/Premium)
  {
    id: "apology",
    name: "Apology",
    description: "Say sorry without saying sorry",
    category: "emotion",
    icon: "🙏",
    color: "from-blue-500 to-cyan-500",
    requiredTier: TIERS.FREE_AGENT,
    trending: true,
    searchTerms: ["sorry", "forgive", "mistake", "apologize", "make up"],
    giftTypes: ["flowers", "chocolate", "jewelry", "experience"],
    occasions: ["apology", "relationship repair", "friendship"],
  },
  {
    id: "pride",
    name: "Pride",
    description: "Celebrate their achievements",
    category: "emotion",
    icon: "🏆",
    color: "from-yellow-500 to-orange-500",
    requiredTier: TIERS.FREE_AGENT,
    searchTerms: ["achievement", "success", "proud", "congratulations", "milestone"],
    giftTypes: ["trophy", "certificate", "luxury item", "experience"],
    occasions: ["graduation", "promotion", "achievement"],
  },
  {
    id: "missing_you",
    name: "Missing You",
    description: "Bridge the distance with love",
    category: "emotion",
    icon: "💌",
    color: "from-pink-500 to-rose-500",
    requiredTier: TIERS.PREMIUM_SPY,
    weeklyTrend: true,
    searchTerms: ["miss", "distance", "long distance", "thinking of you", "absence"],
    giftTypes: ["care package", "photo gift", "letter", "subscription"],
    occasions: ["long distance", "travel", "missing someone"],
  },
  {
    id: "crushed_it",
    name: "Crushed It",
    description: "They absolutely nailed it",
    category: "emotion",
    icon: "🚀",
    color: "from-green-500 to-emerald-500",
    requiredTier: TIERS.PREMIUM_SPY,
    searchTerms: ["success", "nailed it", "amazing", "outstanding", "excellence"],
    giftTypes: ["celebration", "luxury", "experience", "trophy"],
    occasions: ["success", "achievement", "milestone"],
  },
  {
    id: "just_because",
    name: "Just Because",
    description: "No reason needed for love",
    category: "emotion",
    icon: "✨",
    color: "from-purple-500 to-pink-500",
    requiredTier: TIERS.FREE_AGENT,
    trending: true,
    searchTerms: ["spontaneous", "random", "surprise", "no reason", "love"],
    giftTypes: ["flowers", "treats", "small gift", "note"],
    occasions: ["random", "spontaneous", "everyday"],
  },

  // Love Vibes (Premium+)
  {
    id: "gentle_love",
    name: "Gentle",
    description: "Soft, tender expressions of love",
    category: "love_vibe",
    icon: "🌸",
    color: "from-pink-300 to-rose-300",
    requiredTier: TIERS.PREMIUM_SPY,
    searchTerms: ["gentle", "soft", "tender", "sweet", "delicate"],
    giftTypes: ["flowers", "soft items", "handwritten note", "tea"],
    occasions: ["romance", "comfort", "care"],
  },
  {
    id: "playful_love",
    name: "Playful",
    description: "Fun, lighthearted romantic gestures",
    category: "love_vibe",
    icon: "🎈",
    color: "from-yellow-400 to-orange-400",
    requiredTier: TIERS.PREMIUM_SPY,
    searchTerms: ["playful", "fun", "silly", "lighthearted", "games"],
    giftTypes: ["games", "funny gift", "experience", "surprise"],
    occasions: ["date night", "anniversary", "fun"],
  },
  {
    id: "sensual_love",
    name: "Sensual",
    description: "Intimate, passionate expressions",
    category: "love_vibe",
    icon: "🌹",
    color: "from-red-500 to-pink-600",
    requiredTier: TIERS.PRO_AGENT,
    searchTerms: ["sensual", "intimate", "passionate", "romantic", "seductive"],
    giftTypes: ["lingerie", "massage", "wine", "luxury"],
    occasions: ["anniversary", "valentine", "intimate"],
  },
  {
    id: "deep_love",
    name: "Deep",
    description: "Profound, soul-connecting love",
    category: "love_vibe",
    icon: "💎",
    color: "from-indigo-600 to-purple-600",
    requiredTier: TIERS.PRO_AGENT,
    searchTerms: ["deep", "profound", "soul", "connection", "meaningful"],
    giftTypes: ["jewelry", "art", "custom", "experience"],
    occasions: ["engagement", "anniversary", "milestone"],
  },

  // Intents (Pro)
  {
    id: "repair",
    name: "Repair",
    description: "Mend what's been broken",
    category: "intent",
    icon: "🔧",
    color: "from-blue-600 to-cyan-600",
    requiredTier: TIERS.PRO_AGENT,
    searchTerms: ["repair", "fix", "mend", "heal", "restore"],
    giftTypes: ["thoughtful", "meaningful", "experience", "therapy"],
    occasions: ["relationship repair", "apology", "healing"],
  },
  {
    id: "surprise",
    name: "Surprise",
    description: "Unexpected moments of joy",
    category: "intent",
    icon: "🎁",
    color: "from-purple-500 to-pink-500",
    requiredTier: TIERS.PRO_AGENT,
    trending: true,
    searchTerms: ["surprise", "unexpected", "shock", "wow", "amazing"],
    giftTypes: ["surprise box", "experience", "travel", "luxury"],
    occasions: ["birthday", "anniversary", "random"],
  },
  {
    id: "celebrate",
    name: "Celebrate",
    description: "Mark special moments",
    category: "intent",
    icon: "🎉",
    color: "from-yellow-500 to-red-500",
    requiredTier: TIERS.PRO_AGENT,
    searchTerms: ["celebrate", "party", "milestone", "achievement", "success"],
    giftTypes: ["party supplies", "champagne", "experience", "trophy"],
    occasions: ["birthday", "graduation", "promotion", "achievement"],
  },
  {
    id: "reflect",
    name: "Reflect",
    description: "Thoughtful, contemplative gifts",
    category: "intent",
    icon: "🪞",
    color: "from-gray-500 to-slate-600",
    requiredTier: TIERS.PRO_AGENT,
    searchTerms: ["reflect", "think", "contemplate", "mindful", "peaceful"],
    giftTypes: ["journal", "book", "meditation", "art"],
    occasions: ["birthday", "new year", "life change"],
  },

  // Hidden Filters (Agent 00G+)
  {
    id: "hard_conversations",
    name: "Hard Conversations",
    description: "Gifts that open difficult dialogues",
    category: "hidden",
    icon: "💬",
    color: "from-gray-700 to-slate-800",
    requiredTier: TIERS.AGENT_00G,
    searchTerms: ["difficult", "conversation", "talk", "discuss", "serious"],
    giftTypes: ["book", "experience", "therapy", "retreat"],
    occasions: ["relationship", "family", "serious talk"],
  },
  {
    id: "bittersweet_goodbye",
    name: "Bittersweet Goodbye",
    description: "Farewell gifts with love and sadness",
    category: "hidden",
    icon: "🍂",
    color: "from-amber-600 to-orange-700",
    requiredTier: TIERS.AGENT_00G,
    searchTerms: ["goodbye", "farewell", "leaving", "departure", "bittersweet"],
    giftTypes: ["memory book", "keepsake", "photo", "letter"],
    occasions: ["moving", "job change", "breakup", "death"],
  },
  {
    id: "i_see_you",
    name: "I See You",
    description: "Gifts that show deep understanding",
    category: "hidden",
    icon: "👁️",
    color: "from-indigo-700 to-purple-800",
    requiredTier: TIERS.AGENT_00G,
    searchTerms: ["understand", "see", "know", "recognize", "appreciate"],
    giftTypes: ["custom", "personal", "meaningful", "unique"],
    occasions: ["support", "recognition", "understanding"],
  },
  {
    id: "grief",
    name: "Grief",
    description: "Comfort in times of loss",
    category: "hidden",
    icon: "🕊️",
    color: "from-gray-600 to-slate-700",
    requiredTier: TIERS.AGENT_00G,
    searchTerms: ["grief", "loss", "comfort", "sympathy", "condolence"],
    giftTypes: ["comfort", "memorial", "support", "care"],
    occasions: ["death", "loss", "sympathy", "grief"],
  },
]

// Filter access control
export function getAvailableFilters(userTier: UserTier): EmotionalFilter[] {
  const tierHierarchy = {
    [TIERS.FREE_AGENT]: 0,
    [TIERS.PREMIUM_SPY]: 1,
    [TIERS.PRO_AGENT]: 2,
    [TIERS.AGENT_00G]: 3,
    [TIERS.SMALL_BIZ]: 4,
    [TIERS.ENTERPRISE]: 5,
  }

  const userTierLevel = tierHierarchy[userTier]

  return EMOTIONAL_FILTERS.filter((filter) => {
    const requiredTierLevel = tierHierarchy[filter.requiredTier]
    return userTierLevel >= requiredTierLevel
  })
}

export function getMaxActiveFilters(userTier: UserTier): number {
  switch (userTier) {
    case TIERS.FREE_AGENT:
    case TIERS.PREMIUM_SPY:
      return 2
    case TIERS.PRO_AGENT:
      return 5
    case TIERS.AGENT_00G:
    case TIERS.SMALL_BIZ:
    case TIERS.ENTERPRISE:
      return 10
    default:
      return 1
  }
}

export function getTrendingFilters(): EmotionalFilter[] {
  return EMOTIONAL_FILTERS.filter((filter) => filter.trending || filter.weeklyTrend)
}

export function getWeeklyTrendingFilter(): EmotionalFilter | null {
  const weeklyTrending = EMOTIONAL_FILTERS.filter((filter) => filter.weeklyTrend)
  return weeklyTrending[0] || null
}

export function getFiltersByCategory(category: EmotionalFilter["category"]): EmotionalFilter[] {
  return EMOTIONAL_FILTERS.filter((filter) => filter.category === category)
}

export function searchGiftsByFilters(
  activeFilters: string[],
  searchQuery?: string,
): {
  searchTerms: string[]
  giftTypes: string[]
  occasions: string[]
  priceRanges: string[]
} {
  const filters = EMOTIONAL_FILTERS.filter((filter) => activeFilters.includes(filter.id))

  const searchTerms = [...new Set(filters.flatMap((filter) => filter.searchTerms))]
  const giftTypes = [...new Set(filters.flatMap((filter) => filter.giftTypes || []))]
  const occasions = [...new Set(filters.flatMap((filter) => filter.occasions))]
  const priceRanges = [...new Set(filters.map((filter) => filter.priceRange).filter(Boolean))]

  // Add search query terms if provided
  if (searchQuery) {
    searchTerms.push(...searchQuery.toLowerCase().split(" "))
  }

  return {
    searchTerms,
    giftTypes,
    occasions,
    priceRanges,
  }
}

// Filter bundles for monetization
export interface FilterBundle {
  id: string
  name: string
  description: string
  filters: string[]
  price: number
  icon: string
  color: string
}

export const FILTER_BUNDLES: FilterBundle[] = [
  {
    id: "apology_pack",
    name: "Apology Pack",
    description: "Master the art of meaningful apologies",
    filters: ["apology", "repair", "gentle_love", "i_see_you"],
    price: 4.99,
    icon: "🙏",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "deep_love_pack",
    name: "Deep Love Pack",
    description: "Express profound, soul-connecting love",
    filters: ["deep_love", "sensual_love", "i_see_you", "bittersweet_goodbye"],
    price: 7.99,
    icon: "💎",
    color: "from-indigo-600 to-purple-600",
  },
  {
    id: "difficult_moments_pack",
    name: "Difficult Moments Pack",
    description: "Navigate life's challenging conversations",
    filters: ["hard_conversations", "grief", "bittersweet_goodbye", "repair"],
    price: 9.99,
    icon: "💬",
    color: "from-gray-700 to-slate-800",
  },
]
