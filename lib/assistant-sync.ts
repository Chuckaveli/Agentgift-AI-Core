"use client"

import { createClient } from "@/lib/supabase-client"

interface AssistantSyncData {
  id: string // OpenAI assistant ID
  name: string
  description?: string
  type: "internal" | "user-facing" | "hybrid"
  tier_required: "Free" | "Pro" | "Pro+" | "Enterprise" | "NFT" | "XP_Unlock"
  voice_persona: boolean
  api_required: string[]
  connected_features: string[]
  category_tag:
    | "Emotional Engine"
    | "Gifting Logic"
    | "Multilingual Voice"
    | "Seasonal Drop"
    | "Internal Bot"
    | "Game Engine"
    | "XP Controller"
  status: "active" | "seasonal" | "beta" | "maintenance"
  linked_to: {
    prompt_slug?: string
    xp_unlock?: number
    emoji?: string
    feature_slugs?: string[]
    edge_functions?: string[]
  }
  performance_score?: number
  user_satisfaction?: number
  is_active: boolean
  unlock_type?: "tier" | "xp_level" | "loyalty_nft" | "seasonal" | "beta"
  unlock_requirement?: number
  xp_reward?: number
  persona_hint?: string
  voice_enabled?: boolean
}

// Pre-configured AgentGift.ai Assistant Registry Data
export const AGENTGIFT_ASSISTANTS: AssistantSyncData[] = [
  {
    id: "asst_mDwC9xbBkSKPVoVpBYs4fbTw",
    name: "Concierge Core",
    description: "Your personal gift concierge that understands your needs and helps find the perfect gifts",
    type: "hybrid",
    tier_required: "Free",
    voice_persona: false,
    api_required: ["GPT"],
    connected_features: ["Gift Engine Mastermind", "Emotion Tag Gifting", "Smart Search", "Agent Gifty"],
    category_tag: "Gifting Logic",
    status: "active",
    linked_to: {
      prompt_slug: "concierge-core",
      xp_unlock: 0,
      emoji: "🎁",
      feature_slugs: ["agent-gifty", "lumience-dev", "gift-concierge", "smart-search"],
      edge_functions: ["gift_suggestion_engine", "user_query_handler"],
    },
    performance_score: 88.5,
    user_satisfaction: 4.9,
    is_active: true,
    unlock_type: "tier",
    xp_reward: 10,
    persona_hint: "Warm, helpful, and intuitive gift advisor",
  },
  {
    id: "asst_nG0Wk33h0SJYiwGrs1DCVDme",
    name: "Gift Engine Mastermind",
    description: "Advanced AI that generates personalized gift recommendations using deep psychological analysis",
    type: "hybrid",
    tier_required: "Pro",
    voice_persona: false,
    api_required: ["GPT", "DeepInfra"],
    connected_features: ["Gut Check", "Gift DNA", "Reveal Engine", "Smart Search"],
    category_tag: "Gifting Logic",
    status: "active",
    linked_to: {
      prompt_slug: "gift-engine-mastermind",
      xp_unlock: 5,
      emoji: "🧠",
      feature_slugs: ["gut-check", "gift-dna", "reveal", "smart-search"],
      edge_functions: ["gift_suggestion_engine", "gift_matching_engine"],
    },
    performance_score: 92.3,
    user_satisfaction: 4.8,
    is_active: true,
    unlock_type: "tier",
    xp_reward: 15,
    persona_hint: "Analytical, insightful, and precise gift strategist",
  },
  {
    id: "asst_lCOoCbKoCEaZ6fcL1VZznURq",
    name: "Love Language Listener",
    description: "Emotional intelligence AI that analyzes communication patterns and emotional needs",
    type: "hybrid",
    tier_required: "Pro",
    voice_persona: false,
    api_required: ["GPT", "DeepInfra"],
    connected_features: ["Lumience Dev", "Emotion Tags", "No One Knows", "Pride Alliance"],
    category_tag: "Emotional Engine",
    status: "active",
    linked_to: {
      prompt_slug: "love-language-listener",
      xp_unlock: 8,
      emoji: "💝",
      feature_slugs: ["lumience-dev", "emotion-tags", "no-one-knows", "pride-alliance"],
      edge_functions: ["emotion_signature_injector", "emotional_filter_engine"],
    },
    performance_score: 89.7,
    user_satisfaction: 4.7,
    is_active: true,
    unlock_type: "tier",
    xp_reward: 12,
    persona_hint: "Empathetic, understanding, and emotionally intelligent",
  },
  {
    id: "asst_OFoqYv80ueCqggzWEQywmYtg",
    name: "Tokenomics XP Controller",
    description: "Manages XP rewards, tier progression, and gamification elements across the platform",
    type: "internal",
    tier_required: "Free",
    voice_persona: false,
    api_required: ["GPT"],
    connected_features: ["Tokenomics", "Badges", "AgentVault", "EmotiTokens", "Daily Spin"],
    category_tag: "XP Controller",
    status: "active",
    linked_to: {
      prompt_slug: "tokenomics-xp-controller",
      xp_unlock: 0,
      emoji: "⭐",
      feature_slugs: ["tokenomics", "badges", "agentvault", "emotitokens", "daily-spin"],
      edge_functions: ["xp_unlock_status", "tier_management", "reward_distribution"],
    },
    performance_score: 95.1,
    user_satisfaction: 4.9,
    is_active: true,
    unlock_type: "tier",
    xp_reward: 8,
    persona_hint: "Systematic, fair, and motivating progression manager",
  },
  {
    id: "asst_nWRcJT1Oce8zw8nbOYSkaw1E",
    name: "Agent Arya",
    description: "Multilingual voice persona specializing in Indian culture and Hindi/English communication",
    type: "user-facing",
    tier_required: "Pro+",
    voice_persona: true,
    api_required: ["GPT", "ElevenLabs", "Whisper"],
    connected_features: ["Cultural Respect", "Culture India", "Voice Rooms"],
    category_tag: "Multilingual Voice",
    status: "active",
    linked_to: {
      prompt_slug: "agent-arya",
      xp_unlock: 15,
      emoji: "🇮🇳",
      feature_slugs: ["cultural-respect", "culture/IN", "voice-rooms"],
      edge_functions: ["voice_persona_handler", "cultural_adaptation"],
    },
    performance_score: 91.2,
    user_satisfaction: 4.8,
    is_active: true,
    unlock_type: "tier",
    xp_reward: 20,
    persona_hint: "Warm, culturally aware, speaks Hindi and English fluently",
    voice_enabled: true,
  },
  {
    id: "asst_ZcWT3DmUVB9qRUk4yWNgP86",
    name: "Agent Mei",
    description: "Multilingual voice persona specializing in Chinese culture and Mandarin/English communication",
    type: "user-facing",
    tier_required: "Pro+",
    voice_persona: true,
    api_required: ["GPT", "ElevenLabs", "Whisper"],
    connected_features: ["Cultural Respect", "Culture China", "Voice Rooms"],
    category_tag: "Multilingual Voice",
    status: "active",
    linked_to: {
      prompt_slug: "agent-mei",
      xp_unlock: 15,
      emoji: "🇨🇳",
      feature_slugs: ["cultural-respect", "culture/CN", "voice-rooms"],
      edge_functions: ["voice_persona_handler", "cultural_adaptation"],
    },
    performance_score: 90.8,
    user_satisfaction: 4.7,
    is_active: true,
    unlock_type: "tier",
    xp_reward: 20,
    persona_hint: "Gentle, respectful, speaks Mandarin and English fluently",
    voice_enabled: true,
  },
  {
    id: "asst_P6t69u4XrYa15UjkFENMLsf4",
    name: "Agent Lola",
    description: "Multilingual voice persona specializing in Spanish culture and Spanish/English communication",
    type: "user-facing",
    tier_required: "Pro+",
    voice_persona: true,
    api_required: ["GPT", "ElevenLabs", "Whisper"],
    connected_features: ["Cultural Respect", "Culture Spain", "Voice Rooms"],
    category_tag: "Multilingual Voice",
    status: "active",
    linked_to: {
      prompt_slug: "agent-lola",
      xp_unlock: 15,
      emoji: "🇪🇸",
      feature_slugs: ["cultural-respect", "culture/ES", "voice-rooms"],
      edge_functions: ["voice_persona_handler", "cultural_adaptation"],
    },
    performance_score: 92.1,
    user_satisfaction: 4.9,
    is_active: true,
    unlock_type: "tier",
    xp_reward: 20,
    persona_hint: "Vibrant, expressive, speaks Spanish and English fluently",
    voice_enabled: true,
  },
  {
    id: "asst_6wU3S0voUEQluQOpRg9lpdvm",
    name: "Agent Zola",
    description: "Chaos-style seasonal advisor with witty personality and unpredictable gift suggestions",
    type: "user-facing",
    tier_required: "Enterprise",
    voice_persona: true,
    api_required: ["GPT", "ElevenLabs"],
    connected_features: ["Ghost Hunt", "Thought Heist", "Serendipity", "Seasonal Drops"],
    category_tag: "Seasonal Drop",
    status: "seasonal",
    linked_to: {
      prompt_slug: "agent-zola",
      xp_unlock: 25,
      emoji: "⚡",
      feature_slugs: ["ghost-hunt", "thought-heist", "serendipity", "seasonal-drops"],
      edge_functions: ["chaos_advisor", "seasonal_unlock_handler"],
    },
    performance_score: 94.5,
    user_satisfaction: 4.8,
    is_active: true,
    unlock_type: "seasonal",
    xp_reward: 25,
    persona_hint: "Witty, unpredictable, chaotic but brilliant gift advisor",
    voice_enabled: true,
  },
  {
    id: "asst_AhdxKJOkBwuKEgrvqpbZJFH1",
    name: "Occasion Mapper",
    description: "Specialized AI for mapping cultural occasions, holidays, and special events for gift timing",
    type: "hybrid",
    tier_required: "Pro",
    voice_persona: false,
    api_required: ["GPT"],
    connected_features: ["Custom Holidays", "Cultural Respect", "Group Gifting"],
    category_tag: "Gifting Logic",
    status: "active",
    linked_to: {
      prompt_slug: "occasion-mapper",
      xp_unlock: 10,
      emoji: "📅",
      feature_slugs: ["business/custom-holidays", "cultural-respect", "group-gifting"],
      edge_functions: ["occasion_detection", "cultural_calendar"],
    },
    performance_score: 87.3,
    user_satisfaction: 4.6,
    is_active: true,
    unlock_type: "tier",
    xp_reward: 10,
    persona_hint: "Knowledgeable about global cultures and celebrations",
  },
  {
    id: "asst_xSuf7lto2ooTwl6ANpfSHNbQ",
    name: "Agent Identity Optimizer",
    description: "Internal AI that optimizes user personas and identity matching for better gift recommendations",
    type: "internal",
    tier_required: "Free",
    voice_persona: false,
    api_required: ["GPT"],
    connected_features: ["Characters", "Persona Selector", "Gift DNA"],
    category_tag: "Internal Bot",
    status: "active",
    linked_to: {
      prompt_slug: "agent-identity-optimizer",
      xp_unlock: 0,
      emoji: "⚙️",
      feature_slugs: ["characters", "persona-selector", "gift-dna"],
      edge_functions: ["persona_matching", "identity_optimization"],
    },
    performance_score: 93.7,
    user_satisfaction: 4.5,
    is_active: true,
    unlock_type: "tier",
    xp_reward: 5,
    persona_hint: "Analytical, optimization-focused, user experience enhancer",
  },
  {
    id: "asst_mVzUCLJMf8w34wEzuXGKuHLF",
    name: "Knowledge Upload Bot",
    description: "Internal system for processing and structuring knowledge uploads and data management",
    type: "internal",
    tier_required: "Free",
    voice_persona: false,
    api_required: ["GPT"],
    connected_features: ["Feature Builder", "Memory Vault", "Analytics"],
    category_tag: "Internal Bot",
    status: "active",
    linked_to: {
      prompt_slug: "knowledge-upload-bot",
      xp_unlock: 0,
      emoji: "🗄️",
      feature_slugs: ["admin/feature-builder", "memory-vault", "analytics"],
      edge_functions: ["data_structuring", "knowledge_processing"],
    },
    performance_score: 96.2,
    user_satisfaction: 4.3,
    is_active: true,
    unlock_type: "tier",
    xp_reward: 3,
    persona_hint: "Systematic, thorough, data processing specialist",
  },
]

/**
 * 🧠 Sync Assistant Registry – AgentGift Giftverse
 * 📍 Trigger: Manual (admin panel), onboarding, assistant creation/edit
 * 🔐 Auth: Requires server API key + admin tier token
 * 🌐 Target: Supabase Edge Function: sync_assistants
 * 🔄 Use: Auto-updates the assistant_registry table
 * 🧩 Must connect with AgentGift Giftverse universal plug-and-play system
 */
export const syncAssistantsToRegistry = async (assistants?: AssistantSyncData[]): Promise<any> => {
  try {
    const supabase = createClient()

    // Use provided assistants or default to AGENTGIFT_ASSISTANTS
    const assistantsToSync = assistants || AGENTGIFT_ASSISTANTS

    // Get the Supabase project URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured")
    }

    // Build Edge Function URL using Supabase project URL
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/sync_assistants`

    console.log("[AGAI SYNC] Starting assistant registry sync...", {
      assistants_count: assistantsToSync.length,
      edge_function_url: edgeFunctionUrl,
    })

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, // Server-only variable!
      },
      body: JSON.stringify(assistantsToSync),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("[AGAI SYNC ERROR]", result.error)
      throw new Error(`Assistant sync failed: ${result.error}`)
    }

    console.log("[AGAI SYNC SUCCESS]", {
      synced_count: result.synced_count,
      error_count: result.error_count,
      timestamp: result.timestamp,
    })

    // If there were errors, log them but don't fail the entire operation
    if (result.errors && result.errors.length > 0) {
      console.warn("[AGAI SYNC WARNINGS]", result.errors)
    }

    return result
  } catch (error) {
    console.error("[AGAI SYNC CRITICAL ERROR]", error)
    throw error
  }
}

/**
 * Fetch current assistant registry from Supabase
 */
export const fetchAssistantRegistry = async (): Promise<any> => {
  try {
    const supabase = createClient()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured")
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/sync_assistants`

    const response = await fetch(edgeFunctionUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Failed to fetch assistant registry: ${result.error}`)
    }

    return result
  } catch (error) {
    console.error("[AGAI FETCH ERROR]", error)
    throw error
  }
}

/**
 * Check if user has access to a specific assistant
 */
export const checkAssistantAccess = async (assistantId: string, userId?: string): Promise<boolean> => {
  try {
    const supabase = createClient()

    // If no userId provided, get current user
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false
      userId = user.id
    }

    // Use the check_assistant_access function
    const { data, error } = await supabase.rpc("check_assistant_access", {
      user_id: userId,
      assistant_id: assistantId,
    })

    if (error) {
      console.error("Error checking assistant access:", error)
      return false
    }

    return data === true
  } catch (error) {
    console.error("Error in checkAssistantAccess:", error)
    return false
  }
}

/**
 * Get assistants available to current user
 */
export const getUserAvailableAssistants = async (): Promise<any[]> => {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    // Get user profile for tier and level info
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("tier, level, has_loyalty_nft")
      .eq("id", user.id)
      .single()

    if (!profile) return []

    // Get all active assistants
    const { data: assistants, error } = await supabase
      .from("assistant_registry")
      .select("*")
      .eq("is_active", true)
      .order("category_tag", { ascending: true })

    if (error) {
      console.error("Error fetching assistants:", error)
      return []
    }

    // Filter assistants based on user access
    const availableAssistants = []

    for (const assistant of assistants) {
      const hasAccess = await checkAssistantAccess(assistant.assistant_id, user.id)
      if (hasAccess) {
        availableAssistants.push({
          ...assistant,
          has_access: true,
        })
      } else {
        // Include locked assistants for display purposes
        availableAssistants.push({
          ...assistant,
          has_access: false,
        })
      }
    }

    return availableAssistants
  } catch (error) {
    console.error("Error in getUserAvailableAssistants:", error)
    return []
  }
}

/**
 * Log assistant interaction
 */
export const logAssistantInteraction = async (
  assistantId: string,
  inputMessage: string,
  responseMessage: string,
  additionalData?: {
    tokens_used?: number
    cost?: number
    interaction_type?: string
    emotional_context?: any
    satisfaction_rating?: number
  },
): Promise<void> => {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Get user profile for tier and level
    const { data: profile } = await supabase.from("user_profiles").select("tier, level").eq("id", user.id).single()

    // Get assistant registry info
    const { data: assistant } = await supabase
      .from("assistant_registry")
      .select("id")
      .eq("assistant_id", assistantId)
      .single()

    const interactionData = {
      user_id: user.id,
      assistant_id: assistantId,
      assistant_registry_id: assistant?.id || null,
      input_message: inputMessage,
      response_message: responseMessage,
      user_tier: profile?.tier || "Free",
      user_xp_level: profile?.level || 1,
      tokens_used: additionalData?.tokens_used || 0,
      cost: additionalData?.cost || 0.0,
      interaction_type: additionalData?.interaction_type || "chat",
      emotional_context: additionalData?.emotional_context || null,
      satisfaction_rating: additionalData?.satisfaction_rating || null,
    }

    const { error } = await supabase.from("assistant_interactions").insert(interactionData)

    if (error) {
      console.error("Error logging assistant interaction:", error)
    }

    // Update assistant interaction count
    await supabase.rpc("increment", {
      table_name: "assistant_registry",
      column_name: "interaction_count",
      row_id: assistant?.id,
    })
  } catch (error) {
    console.error("Error in logAssistantInteraction:", error)
  }
}
