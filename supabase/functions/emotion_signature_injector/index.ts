import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/io/mod.ts" // Declare Deno variable

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

    const { text_input, context_type, recipient_id, assistant_id } = await req.json()

    // Analyze emotional content
    const emotionalSignature = await analyzeEmotionalContent(text_input, context_type)

    // Store emotional signature
    const { error: insertError } = await supabaseClient.from("emotional_signatures").insert({
      user_id: user.id,
      recipient_id,
      text_input,
      context_type,
      emotional_tags: emotionalSignature.tags,
      emotional_intensity: emotionalSignature.intensity,
      dominant_emotion: emotionalSignature.dominant_emotion,
      confidence_score: emotionalSignature.confidence,
      processed_by: assistant_id || "emotion_signature_injector",
    })

    if (insertError) {
      console.error("Error storing emotional signature:", insertError)
    }

    // Log interaction
    await supabaseClient.from("assistant_interactions").insert({
      user_id: user.id,
      assistant_id: assistant_id || "emotion_signature_injector",
      input_message: text_input,
      response_message: JSON.stringify(emotionalSignature),
      user_tier: "Free",
      user_xp_level: 1,
    })

    // Award XP
    await supabaseClient.rpc("add_user_xp", {
      user_id: user.id,
      xp_amount: 10,
      reason: "Used Emotion Signature Injector",
    })

    return new Response(
      JSON.stringify({
        success: true,
        emotional_signature: emotionalSignature,
        processed_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Emotion signature injector error:", error)

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

async function analyzeEmotionalContent(text: string, contextType: string) {
  // Mock emotional analysis - replace with actual AI/ML analysis
  const emotionalKeywords = {
    joy: ["happy", "excited", "thrilled", "delighted", "cheerful", "elated"],
    love: ["love", "adore", "cherish", "treasure", "devoted", "affection"],
    gratitude: ["thank", "grateful", "appreciate", "thankful", "blessed"],
    nostalgia: ["remember", "memories", "childhood", "past", "reminds", "nostalgic"],
    anticipation: ["excited", "looking forward", "can't wait", "anticipate"],
    concern: ["worried", "concerned", "anxious", "nervous", "stressed"],
    sadness: ["sad", "disappointed", "upset", "down", "blue"],
    anger: ["angry", "frustrated", "annoyed", "mad", "irritated"],
  }

  const textLower = text.toLowerCase()
  const detectedEmotions: Record<string, number> = {}

  // Analyze emotional keywords
  for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
    const matches = keywords.filter((keyword) => textLower.includes(keyword))
    if (matches.length > 0) {
      detectedEmotions[emotion] = matches.length
    }
  }

  // Determine dominant emotion
  const dominantEmotion = Object.entries(detectedEmotions).sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral"

  // Calculate intensity (0-100)
  const totalMatches = Object.values(detectedEmotions).reduce((sum, count) => sum + count, 0)
  const intensity = Math.min(100, totalMatches * 20)

  // Generate confidence score
  const confidence = Math.min(100, totalMatches * 15 + (text.length > 50 ? 20 : 0))

  return {
    tags: Object.keys(detectedEmotions),
    intensity,
    dominant_emotion: dominantEmotion,
    confidence,
    emotion_breakdown: detectedEmotions,
    context_type: contextType,
    analysis_timestamp: new Date().toISOString(),
  }
}
