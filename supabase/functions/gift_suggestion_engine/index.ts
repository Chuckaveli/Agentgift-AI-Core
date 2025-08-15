import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts" // Declare Deno variable

// Comma-separated list of origins allowed to access this function
const allowedOrigins =
  Deno.env.get("ALLOWED_ORIGINS")?.split(",").map((o) => o.trim()) ?? []

interface GiftSuggestionRequest {
  recipient_profile?: {
    age?: number
    gender?: string
    interests?: string[]
    relationship?: string
    personality_traits?: string[]
    cultural_background?: string
  }
  occasion?: string
  budget_range?: {
    min: number
    max: number
  }
  emotional_context?: {
    current_mood?: string
    desired_outcome?: string
    emotional_tags?: string[]
  }
  user_preferences?: {
    gift_categories?: string[]
    avoid_categories?: string[]
    personalization_level?: "low" | "medium" | "high"
  }
  context?: {
    urgency?: "low" | "medium" | "high"
    delivery_method?: "physical" | "digital" | "experience"
    group_gift?: boolean
  }
}

interface GiftSuggestion {
  id: string
  title: string
  description: string
  category: string
  price_range: {
    min: number
    max: number
  }
  emotional_impact_score: number
  personalization_score: number
  confidence_score: number
  reasoning: string
  tags: string[]
  purchase_links?: {
    platform: string
    url: string
    price: number
  }[]
  customization_options?: string[]
  delivery_info?: {
    estimated_time: string
    shipping_options: string[]
  }
}

serve(async (req) => {
  const origin = req.headers.get("origin") ?? ""
  if (allowedOrigins.length && !allowedOrigins.includes(origin)) {
    return new Response("Origin not allowed", { status: 403 })
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Authenticate user
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("No authorization header")
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error("Invalid authentication")
    }

    // Get user profile for tier checking
    const { data: userProfile } = await supabaseClient.from("user_profiles").select("*").eq("id", user.id).single()

    if (!userProfile) {
      throw new Error("User profile not found")
    }

    const requestData: GiftSuggestionRequest = await req.json()

    // Generate gift suggestions using AI
    const suggestions = await generateGiftSuggestions(requestData, userProfile, supabaseClient)

    // Log the interaction for analytics
    await supabaseClient.from("gift_suggestion_logs").insert({
      user_id: user.id,
      request_data: requestData,
      suggestions_count: suggestions.length,
      user_tier: userProfile.tier,
      created_at: new Date().toISOString(),
    })

    // Award XP for using the gift engine
    await awardXPForGiftSuggestion(user.id, suggestions.length, supabaseClient)

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        user_tier: userProfile.tier,
        suggestions_remaining: calculateRemainingUsage(userProfile),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Gift suggestion engine error:", error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    )
  }
})

async function generateGiftSuggestions(
  request: GiftSuggestionRequest,
  userProfile: any,
  supabaseClient: any,
): Promise<GiftSuggestion[]> {
  // Get existing gift data from database
  const { data: giftDatabase } = await supabaseClient
    .from("gift_suggestions_database")
    .select("*")
    .eq("is_active", true)

  // Apply AI-powered filtering and ranking
  const basePrompt = `
    Generate personalized gift suggestions based on:
    
    Recipient Profile:
    - Age: ${request.recipient_profile?.age || "Unknown"}
    - Gender: ${request.recipient_profile?.gender || "Unknown"}
    - Interests: ${request.recipient_profile?.interests?.join(", ") || "Unknown"}
    - Relationship: ${request.recipient_profile?.relationship || "Unknown"}
    - Personality: ${request.recipient_profile?.personality_traits?.join(", ") || "Unknown"}
    - Cultural Background: ${request.recipient_profile?.cultural_background || "Unknown"}
    
    Occasion: ${request.occasion || "General"}
    Budget: $${request.budget_range?.min || 0} - $${request.budget_range?.max || 1000}
    
    Emotional Context:
    - Current Mood: ${request.emotional_context?.current_mood || "Unknown"}
    - Desired Outcome: ${request.emotional_context?.desired_outcome || "Unknown"}
    - Emotional Tags: ${request.emotional_context?.emotional_tags?.join(", ") || "Unknown"}
    
    User Preferences:
    - Preferred Categories: ${request.user_preferences?.gift_categories?.join(", ") || "Any"}
    - Avoid Categories: ${request.user_preferences?.avoid_categories?.join(", ") || "None"}
    - Personalization Level: ${request.user_preferences?.personalization_level || "medium"}
    
    Context:
    - Urgency: ${request.context?.urgency || "medium"}
    - Delivery Method: ${request.context?.delivery_method || "physical"}
    - Group Gift: ${request.context?.group_gift ? "Yes" : "No"}
    
    Please provide 5-10 highly personalized gift suggestions with detailed reasoning.
  `

  // Use OpenAI API for intelligent suggestions
  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are the AgentGift.ai Gift Engine Mastermind, an expert at generating highly personalized gift suggestions. 
          You understand emotional intelligence, cultural sensitivity, and the psychology of gift-giving. 
          Always provide practical, thoughtful suggestions with clear reasoning.`,
        },
        {
          role: "user",
          content: basePrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!openaiResponse.ok) {
    throw new Error("Failed to generate AI suggestions")
  }

  const aiResult = await openaiResponse.json()
  const aiSuggestions = aiResult.choices[0]?.message?.content || ""

  // Parse AI response and combine with database suggestions
  const suggestions: GiftSuggestion[] = await parseAndEnhanceSuggestions(
    aiSuggestions,
    request,
    giftDatabase || [],
    userProfile,
  )

  // Apply tier-based filtering
  return applyTierFiltering(suggestions, userProfile.tier)
}

async function parseAndEnhanceSuggestions(
  aiResponse: string,
  request: GiftSuggestionRequest,
  giftDatabase: any[],
  userProfile: any,
): Promise<GiftSuggestion[]> {
  // This would parse the AI response and enhance with database data
  // For now, returning mock enhanced suggestions
  const mockSuggestions: GiftSuggestion[] = [
    {
      id: "gift_001",
      title: "Personalized Star Map",
      description: "Custom star map showing the night sky from a meaningful date and location",
      category: "Personalized Keepsakes",
      price_range: { min: 35, max: 85 },
      emotional_impact_score: 9.2,
      personalization_score: 9.8,
      confidence_score: 8.7,
      reasoning:
        "Based on the romantic relationship and high personalization preference, this gift creates a lasting memory tied to a specific moment in time.",
      tags: ["romantic", "personalized", "meaningful", "keepsake"],
      purchase_links: [
        {
          platform: "Etsy",
          url: "https://etsy.com/star-maps",
          price: 45,
        },
      ],
      customization_options: ["Date selection", "Location input", "Custom message", "Frame options"],
      delivery_info: {
        estimated_time: "3-5 business days",
        shipping_options: ["Standard", "Express", "Digital Download"],
      },
    },
    {
      id: "gift_002",
      title: "Artisanal Coffee Subscription",
      description: "3-month subscription to small-batch, ethically sourced coffee from around the world",
      category: "Food & Beverage",
      price_range: { min: 60, max: 120 },
      emotional_impact_score: 7.8,
      personalization_score: 6.5,
      confidence_score: 8.2,
      reasoning:
        "Perfect for coffee enthusiasts who appreciate quality and discovery. The subscription aspect extends the gift experience over time.",
      tags: ["coffee", "subscription", "artisanal", "discovery"],
      purchase_links: [
        {
          platform: "Blue Bottle Coffee",
          url: "https://bluebottlecoffee.com/subscriptions",
          price: 85,
        },
      ],
      customization_options: ["Roast preference", "Grind type", "Delivery frequency"],
      delivery_info: {
        estimated_time: "Next business day for first shipment",
        shipping_options: ["Monthly delivery", "Bi-weekly delivery"],
      },
    },
  ]

  return mockSuggestions
}

function applyTierFiltering(suggestions: GiftSuggestion[], userTier: string): GiftSuggestion[] {
  const tierLimits = {
    Free: 3,
    Pro: 7,
    "Pro+": 10,
    Enterprise: -1, // Unlimited
  }

  const limit = tierLimits[userTier as keyof typeof tierLimits] || 3

  return suggestions
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, limit)
    .map((suggestion) => {
      // Add tier-specific enhancements
      if (userTier === "Pro+" || userTier === "Enterprise") {
        suggestion.purchase_links = suggestion.purchase_links || []
        suggestion.customization_options = suggestion.customization_options || []
      }

      if (userTier === "Free") {
        // Remove some premium features for free tier
        delete suggestion.purchase_links
        delete suggestion.delivery_info
      }

      return suggestion
    })
}

async function awardXPForGiftSuggestion(userId: string, suggestionsCount: number, supabaseClient: any) {
  const baseXP = 5
  const bonusXP = Math.min(suggestionsCount * 2, 20) // Max 20 bonus XP

  const totalXP = baseXP + bonusXP

  await supabaseClient.from("xp_logs").insert({
    user_id: userId,
    xp_amount: totalXP,
    reason: `Gift suggestions generated (${suggestionsCount} suggestions)`,
    feature_used: "gift_suggestion_engine",
  })

  // Update user profile XP
  const { data: currentProfile } = await supabaseClient
    .from("user_profiles")
    .select("xp, level")
    .eq("id", userId)
    .single()

  if (currentProfile) {
    const newXP = currentProfile.xp + totalXP
    const newLevel = Math.floor(newXP / 150) + 1

    await supabaseClient
      .from("user_profiles")
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  }
}

function calculateRemainingUsage(userProfile: any): number {
  const tierLimits = {
    Free: 5,
    Pro: 25,
    "Pro+": 100,
    Enterprise: -1, // Unlimited
  }

  const limit = tierLimits[userProfile.tier as keyof typeof tierLimits] || 5

  if (limit === -1) return -1 // Unlimited

  // This would check actual usage from database
  // For now, returning mock data
  const usedToday = 2 // Mock usage
  return Math.max(0, limit - usedToday)
}
