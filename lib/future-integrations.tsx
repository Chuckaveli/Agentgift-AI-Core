"use client"

// Future API Key Management
export interface APIKeyConfig {
  serviceName: string
  keyName: string
  isRequired: boolean
  description: string
  setupUrl?: string
}

export const FUTURE_API_INTEGRATIONS: APIKeyConfig[] = [
  {
    serviceName: "Amazon",
    keyName: "AMAZON_API_KEY",
    isRequired: false,
    description: "Connect to Amazon for product recommendations and purchasing",
    setupUrl: "https://developer.amazon.com",
  },
  {
    serviceName: "Expedia",
    keyName: "EXPEDIA_API_KEY",
    isRequired: false,
    description: "Travel and experience gift recommendations",
    setupUrl: "https://developers.expediagroup.com",
  },
  {
    serviceName: "DoorDash",
    keyName: "DOORDASH_API_KEY",
    isRequired: false,
    description: "Food delivery and restaurant gift experiences",
    setupUrl: "https://developer.doordash.com",
  },
  {
    serviceName: "TikTok Shop",
    keyName: "TIKTOK_SHOP_API_KEY",
    isRequired: false,
    description: "Social commerce and trending product integration",
    setupUrl: "https://developers.tiktok.com",
  },
]

// Voice Agent System (Future)
export interface VoiceAgent {
  id: string
  name: string
  personality: string
  specialties: string[]
  voiceModel: string
  isActive: boolean
}

export const VOICE_AGENTS: VoiceAgent[] = [
  {
    id: "avelyn",
    name: "Avelyn",
    personality: "Warm, empathetic, and intuitive",
    specialties: ["romantic gifts", "emotional intelligence", "relationship advice"],
    voiceModel: "female-warm",
    isActive: false, // Future feature
  },
  {
    id: "galen",
    name: "Galen",
    personality: "Analytical, precise, and thoughtful",
    specialties: ["tech gifts", "practical solutions", "budget optimization"],
    voiceModel: "male-professional",
    isActive: false,
  },
  {
    id: "zola",
    name: "Zola",
    personality: "Creative, artistic, and inspiring",
    specialties: ["creative gifts", "artistic experiences", "unique finds"],
    voiceModel: "female-creative",
    isActive: false,
  },
]

// Campaign System (Future)
export interface GiftCampaign {
  id: string
  name: string
  description: string
  type: "love_language" | "gifting_chain" | "surprise_drops"
  duration: number // days
  triggers: string[]
  isActive: boolean
}

export const GIFT_CAMPAIGNS: GiftCampaign[] = [
  {
    id: "love_language_campaign",
    name: "Love Language Campaign",
    description: "Personalized gifts based on the 5 love languages",
    type: "love_language",
    duration: 30,
    triggers: ["valentine", "anniversary", "relationship_milestone"],
    isActive: false,
  },
  {
    id: "gifting_chain_campaign",
    name: "Gifting Chain Campaign",
    description: "Community-driven gift exchanges and chains",
    type: "gifting_chain",
    duration: 14,
    triggers: ["holiday", "community_event", "group_celebration"],
    isActive: false,
  },
  {
    id: "surprise_drops_campaign",
    name: "Emotional Surprise Drops",
    description: "AI-triggered surprise gifts based on emotional state",
    type: "surprise_drops",
    duration: 7,
    triggers: ["stress_detected", "achievement", "mood_low"],
    isActive: false,
  },
]

// Social Media Integration (Future)
export interface SocialPlatform {
  id: string
  name: string
  apiEndpoint: string
  features: string[]
  isConnected: boolean
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: "instagram",
    name: "Instagram",
    apiEndpoint: "https://graph.instagram.com",
    features: ["auto_posting", "story_sharing", "gift_reveals"],
    isConnected: false,
  },
  {
    id: "tiktok",
    name: "TikTok",
    apiEndpoint: "https://open-api.tiktok.com",
    features: ["video_creation", "trend_analysis", "product_showcase"],
    isConnected: false,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    apiEndpoint: "https://api.linkedin.com",
    features: ["professional_gifts", "corporate_sharing", "team_recognition"],
    isConnected: false,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    apiEndpoint: "https://api.pinterest.com",
    features: ["gift_boards", "inspiration_sharing", "trend_discovery"],
    isConnected: false,
  },
]

// Unlockable Filters (Future)
export interface UnlockableFilter {
  id: string
  name: string
  description: string
  unlockRequirement: {
    type: "xp" | "level" | "badge" | "subscription"
    value: string | number
  }
  isUnlocked: boolean
}

export const UNLOCKABLE_FILTERS: UnlockableFilter[] = [
  {
    id: "emotion_ai_filter",
    name: "Emotion AI Filter",
    description: "Advanced emotional intelligence for gift matching",
    unlockRequirement: { type: "level", value: 25 },
    isUnlocked: false,
  },
  {
    id: "personality_deep_dive",
    name: "Personality Deep Dive",
    description: "Comprehensive personality analysis for perfect gifts",
    unlockRequirement: { type: "badge", value: "expert" },
    isUnlocked: false,
  },
  {
    id: "trend_predictor",
    name: "Trend Predictor",
    description: "AI-powered trend analysis for cutting-edge gifts",
    unlockRequirement: { type: "subscription", value: "pro_agent" },
    isUnlocked: false,
  },
  {
    id: "cultural_context",
    name: "Cultural Context Filter",
    description: "Culturally-aware gift recommendations",
    unlockRequirement: { type: "xp", value: 5000 },
    isUnlocked: false,
  },
]

// Future Integration Helper Functions
export class FutureIntegrations {
  static async setupAPIKey(serviceName: string, apiKey: string): Promise<boolean> {
    // Future implementation for API key setup
    console.log(`Setting up ${serviceName} with API key: ${apiKey.substring(0, 8)}...`)
    return true
  }

  static async enableVoiceAgent(agentId: string): Promise<boolean> {
    // Future implementation for voice agent activation
    console.log(`Enabling voice agent: ${agentId}`)
    return true
  }

  static async launchCampaign(campaignId: string): Promise<boolean> {
    // Future implementation for campaign launch
    console.log(`Launching campaign: ${campaignId}`)
    return true
  }

  static async connectSocialPlatform(platformId: string, credentials: any): Promise<boolean> {
    // Future implementation for social platform connection
    console.log(`Connecting to ${platformId}`)
    return true
  }

  static async unlockFilter(filterId: string, userId: string): Promise<boolean> {
    // Future implementation for filter unlocking
    console.log(`Unlocking filter ${filterId} for user ${userId}`)
    return true
  }
}
// Placeholder Components for Future Features
export const FuturePlaceholders = {
  VoiceAgentInterface: () => (
    <div
      className={
        "p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 " +
        "dark:border-gray-600"
      }
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Voice Agent System</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Coming Soon: AI voice assistants for personalized gifting guidance
      </p>
      <div className="text-sm text-gray-500">Features: Avelyn, Galen, Zola voice agents</div>
    </div>
  ),

  CampaignManager: () => (
    <div
      className={
        "p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 " +
        "dark:border-gray-600"
      }
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gift Campaigns</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Coming Soon: Automated gift campaigns and emotional triggers
      </p>
      <div className="text-sm text-gray-500">Features: Love Language, Gifting Chains, Surprise Drops</div>
    </div>
  ),

  SocialIntegration: () => (
    <div
      className={
        "p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 " +
        "dark:border-gray-600"
      }
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Social Media Integration</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Coming Soon: Omni-channel social media management
      </p>
      <div className="text-sm text-gray-500">Platforms: Instagram, TikTok, LinkedIn, Pinterest</div>
    </div>
  ),

  AdvancedFilters: () => (
    <div
      className={
        "p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 " +
        "dark:border-gray-600"
      }
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Advanced Filters</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Coming Soon: Unlockable AI-powered gift filters
      </p>
      <div className="text-sm text-gray-500">Features: Emotion AI, Personality Deep Dive, Trend Predictor</div>
    </div>
  ),
}
