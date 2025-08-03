import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

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

    const { recipient_info, occasion, budget_range, emotional_context, cultural_context, assistant_id } =
      await req.json()

    // Log the interaction
    await supabaseClient.from("assistant_interactions").insert({
      user_id: user.id,
      assistant_id: assistant_id || "gift_suggestion_engine",
      input_message: JSON.stringify({ recipient_info, occasion, budget_range }),
      user_tier: "Pro", // Will be fetched from user profile
      user_xp_level: 1,
    })

    // Generate gift suggestions based on input
    const suggestions = await generateGiftSuggestions({
      recipient_info,
      occasion,
      budget_range,
      emotional_context,
      cultural_context,
    })

    // Award XP for using the engine
    await supabaseClient.rpc("add_user_xp", {
      user_id: user.id,
      xp_amount: 15,
      reason: "Used Gift Suggestion Engine",
    })

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        generated_at: new Date().toISOString(),
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

async function generateGiftSuggestions(params: any) {
  // Mock gift suggestion logic - replace with actual AI/ML logic
  const { recipient_info, occasion, budget_range, emotional_context, cultural_context } = params

  const baseSuggestions = [
    {
      id: "gift_1",
      name: "Personalized Photo Album",
      description: "A custom photo album with memories and personal touches",
      price_range: "$25-50",
      emotional_match: 95,
      cultural_appropriateness: 100,
      occasion_relevance: 90,
      tags: ["personal", "memories", "heartfelt"],
    },
    {
      id: "gift_2",
      name: "Artisan Coffee Subscription",
      description: "Monthly delivery of premium coffee from around the world",
      price_range: "$30-60",
      emotional_match: 80,
      cultural_appropriateness: 95,
      occasion_relevance: 85,
      tags: ["subscription", "gourmet", "experience"],
    },
    {
      id: "gift_3",
      name: "Custom Star Map",
      description: "A map of the stars from a meaningful date and location",
      price_range: "$40-80",
      emotional_match: 100,
      cultural_appropriateness: 100,
      occasion_relevance: 95,
      tags: ["romantic", "personalized", "unique"],
    },
  ]

  // Filter and score based on input parameters
  return baseSuggestions
    .filter((suggestion) => {
      // Budget filtering logic
      const [minPrice, maxPrice] = suggestion.price_range
        .replace("$", "")
        .split("-")
        .map((p) => Number.parseInt(p))
      const [userMin, userMax] = budget_range
        ? budget_range.split("-").map((p: string) => Number.parseInt(p.replace("$", "")))
        : [0, 1000]

      return maxPrice >= userMin && minPrice <= userMax
    })
    .map((suggestion) => ({
      ...suggestion,
      overall_score: Math.round(
        (suggestion.emotional_match + suggestion.cultural_appropriateness + suggestion.occasion_relevance) / 3,
      ),
      reasoning: generateReasoning(suggestion, params),
    }))
    .sort((a, b) => b.overall_score - a.overall_score)
}

function generateReasoning(suggestion: any, params: any) {
  const reasons = []

  if (suggestion.emotional_match > 90) {
    reasons.push("Perfect emotional resonance with recipient")
  }

  if (suggestion.cultural_appropriateness > 95) {
    reasons.push("Culturally sensitive and appropriate")
  }

  if (suggestion.occasion_relevance > 90) {
    reasons.push(`Ideal for ${params.occasion || "this occasion"}`)
  }

  return reasons.join(". ")
}
