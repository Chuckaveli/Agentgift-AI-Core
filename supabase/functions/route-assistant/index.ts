import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declaring Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface AssistantRequest {
  assistant_id: string
  user_id: string
  tier: string
  xp_level: number
  input: string
}

interface AssistantResponse {
  success: boolean
  response?: string
  error?: string
  usage?: {
    tokens_used: number
    cost: number
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    // Get the authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("No authorization header")
    }

    // Verify the JWT token
    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error("Invalid authentication")
    }

    // Parse request body
    const requestData: AssistantRequest = await req.json()

    // Validate required fields
    if (!requestData.assistant_id || !requestData.user_id || !requestData.input) {
      throw new Error("Missing required fields")
    }

    // Verify user access to assistant
    const { data: assistant } = await supabaseClient
      .from("assistant_registry")
      .select("*")
      .eq("assistant_id", requestData.assistant_id)
      .eq("is_active", true)
      .single()

    if (!assistant) {
      throw new Error("Assistant not found or inactive")
    }

    // Check user tier access
    const hasAccess = checkUserAccess(assistant.tier, requestData.tier, requestData.xp_level)
    if (!hasAccess) {
      throw new Error("Insufficient access level")
    }

    // Log the interaction
    await supabaseClient.from("assistant_interactions").insert({
      user_id: requestData.user_id,
      assistant_id: requestData.assistant_id,
      input_message: requestData.input,
      user_tier: requestData.tier,
      user_xp_level: requestData.xp_level,
      created_at: new Date().toISOString(),
    })

    // For now, simulate OpenAI Assistant response
    // In production, this would call the actual OpenAI Assistants API
    const simulatedResponse = await simulateAssistantResponse(assistant, requestData.input)

    // Update interaction with response
    await supabaseClient
      .from("assistant_interactions")
      .update({
        response_message: simulatedResponse.response,
        tokens_used: simulatedResponse.usage?.tokens_used || 0,
        cost: simulatedResponse.usage?.cost || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", requestData.user_id)
      .eq("assistant_id", requestData.assistant_id)
      .order("created_at", { ascending: false })
      .limit(1)

    // Award XP for interaction
    await awardXP(supabaseClient, requestData.user_id, 5)

    const response: AssistantResponse = {
      success: true,
      response: simulatedResponse.response,
      usage: simulatedResponse.usage,
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Error in route-assistant function:", error)

    const errorResponse: AssistantResponse = {
      success: false,
      error: error.message,
    }

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})

function checkUserAccess(assistantTier: string, userTier: string, userXpLevel: number): boolean {
  switch (assistantTier) {
    case "Free":
      return true
    case "Pro":
      return ["Pro", "Pro+", "Enterprise"].includes(userTier)
    case "Pro+":
      return ["Pro+", "Enterprise"].includes(userTier)
    case "Enterprise":
      return userTier === "Enterprise"
    case "XP_Level":
      return userXpLevel >= 50
    case "Loyalty_NFT":
      // This would need additional NFT verification logic
      return userTier === "Enterprise" // Simplified for now
    default:
      return false
  }
}

async function simulateAssistantResponse(assistant: any, input: string) {
  // Simulate different response styles based on assistant type
  const responses = {
    asst_mVzUCLJMf8w34wEzuXGKuHLF: `📊 **Knowledge Upload Bot**: I've analyzed your input "${input}". This data can be structured into our core knowledge base with the following categories: Personal Preferences, Relationship Context, and Gift History. Would you like me to process this information for better gift recommendations?`,

    asst_xSuf7lto2ooTwl6ANpfSHNbQ: `🎭 **Agent Identity Optimizer**: Based on your query "${input}", I'm detecting personality traits that align with a thoughtful, detail-oriented gifting style. I recommend activating the "Considerate Curator" persona for your gift searches. This will emphasize meaningful, personalized options.`,

    asst_AhdxKJOkBwuKEgrvqpbZJFH1: `📅 **Occasion Mapper**: Analyzing "${input}" for gift-worthy opportunities... I've identified 3 potential occasions: 1) Upcoming anniversary (high priority), 2) Achievement celebration (medium priority), 3) Just-because moment (low priority). Which would you like to explore first?`,

    asst_nG0Wk33h0SJYiwGrs1DCVDme: `🎁 **Gift Engine Mastermind**: Processing your request "${input}" through our advanced recommendation algorithms... I've found 12 highly compatible gift options across 4 categories. Top recommendation: A personalized experience gift that combines their love for [hobby] with your shared memories. Confidence score: 94%.`,

    asst_OFoqYv80ueCqggzWEQywmYtg: `💰 **Tokenomics XP Controller**: Your query "${input}" has been processed. Current XP balance: +5 for interaction. Recommended actions: 1) Complete gift purchase (+50 XP), 2) Share gift story (+25 XP), 3) Refer friend (+100 XP). Your next tier unlock is 75 XP away!`,

    asst_lCOoCbKoCEaZ6fcL1VZznURq: `💝 **Love Language Listener**: I sense from "${input}" that this person's primary love language is likely "Acts of Service" with secondary "Quality Time". Gift recommendation: Focus on experiences you can share together or items that make their daily life easier. Avoid purely material gifts.`,

    asst_nWRcJT1Oce8zw8nbOYSkaw1E: `🇮🇳 **Agent Arya**: Namaste! आपका संदेश "${input}" बहुत अच्छा है। In Indian culture, we believe gifts should honor relationships and traditions. I suggest considering items that reflect respect for elders, celebration of festivals, or support for their spiritual journey. Shall I recommend some culturally appropriate options?`,

    asst_ZcWT3DmUVB9qRUk4yWNgP86: `🇨🇳 **Agent Mei**: 你好! Your message "${input}" shows thoughtfulness. In Chinese tradition, gifts should bring good fortune and strengthen relationships. Consider items in pairs (for harmony), avoid clocks or white flowers, and focus on red or gold colors for prosperity. Would you like specific recommendations?`,

    asst_P6t69u4XrYa15UjkFENMLsf4: `🇪🇸 **Agent Lola**: ¡Hola! Tu mensaje "${input}" es muy considerado. In Spanish culture, we value warmth, family, and celebration. I recommend gifts that bring people together - perhaps something for sharing meals, celebrating life, or expressing passion. ¿Te gustaría algunas sugerencias específicas?`,

    asst_6wU3S0voUEQluQOpRg9lpdvm: `🌪️ **Agent Zola**: CHAOS ACTIVATED! Your boring request "${input}" needs MORE SPARKLE! 🎭✨ Forget predictable gifts - let's find something that makes them question reality! How about: 1) A mystery box that arrives monthly, 2) An experience they'd never choose themselves, 3) Something completely random but oddly perfect? EMBRACE THE CHAOS! 🎪`,

    asst_mDwC9xbBkSKPVoVpBYs4fbTw: `🤖 **Concierge Core**: Central intelligence processing "${input}"... Cross-referencing with all available data sources... Analysis complete. I'm coordinating with our specialist assistants to provide you with the most comprehensive gift solution. Shall I activate the full concierge protocol for this request?`,
  }

  const response =
    responses[assistant.assistant_id] ||
    `Hello! I'm ${assistant.name}. I received your message "${input}" and I'm here to help with your gifting needs. This is a simulated response - in production, I would provide personalized assistance based on my specialized capabilities.`

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

  return {
    response,
    usage: {
      tokens_used: Math.floor(Math.random() * 100) + 50,
      cost: Math.random() * 0.05 + 0.01,
    },
  }
}

async function awardXP(supabaseClient: any, userId: string, xpAmount: number) {
  try {
    // Get current XP
    const { data: profile } = await supabaseClient.from("user_profiles").select("xp_level").eq("id", userId).single()

    if (profile) {
      // Award XP
      await supabaseClient
        .from("user_profiles")
        .update({
          xp_level: profile.xp_level + xpAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
    }
  } catch (error) {
    console.error("Error awarding XP:", error)
  }
}
