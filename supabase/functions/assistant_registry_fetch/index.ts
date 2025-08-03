import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/io/mod.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Feature Connection Mapping
const FEATURE_CONNECTIONS = {
  asst_mDwC9xbBkSKPVoVpBYs4fbTw: {
    // Concierge Core
    connected_features: ["agent-gifty", "lumience-dev", "gift-concierge", "smart-search"],
    edge_functions: ["gift_suggestion_engine", "user_query_handler"],
    category_tag: "Gifting Logic",
  },
  asst_nG0Wk33h0SJYiwGrs1DCVDme: {
    // Gift Engine Mastermind
    connected_features: ["gut-check", "gift-dna", "reveal", "smart-search"],
    edge_functions: ["gift_suggestion_engine", "gift_matching_engine"],
    category_tag: "Gifting Logic",
  },
  asst_lCOoCbKoCEaZ6fcL1VZznURq: {
    // Love Language Listener
    connected_features: ["lumience-dev", "emotion-tags", "no-one-knows", "pride-alliance"],
    edge_functions: ["emotion_signature_injector", "emotional_filter_engine"],
    category_tag: "Emotional Engine",
  },
  asst_OFoqYv80ueCqggzWEQywmYtg: {
    // Tokenomics XP Controller
    connected_features: ["tokenomics", "badges", "agentvault", "emotitokens", "daily-spin"],
    edge_functions: ["xp_unlock_status", "tier_management", "reward_distribution"],
    category_tag: "XP Controller",
  },
  asst_nWRcJT1Oce8zw8nbOYSkaw1E: {
    // Agent Arya
    connected_features: ["cultural-respect", "culture/IN", "voice-rooms"],
    edge_functions: ["voice_persona_handler", "cultural_adaptation"],
    category_tag: "Multilingual Voice",
  },
  asst_ZcWT3DmUVB9qRUk4yWNgP86: {
    // Agent Mei
    connected_features: ["cultural-respect", "culture/CN", "voice-rooms"],
    edge_functions: ["voice_persona_handler", "cultural_adaptation"],
    category_tag: "Multilingual Voice",
  },
  asst_P6t69u4XrYa15UjkFENMLsf4: {
    // Agent Lola
    connected_features: ["cultural-respect", "culture/ES", "voice-rooms"],
    edge_functions: ["voice_persona_handler", "cultural_adaptation"],
    category_tag: "Multilingual Voice",
  },
  asst_6wU3S0voUEQluQOpRg9lpdvm: {
    // Agent Zola
    connected_features: ["ghost-hunt", "thought-heist", "serendipity", "seasonal-drops"],
    edge_functions: ["chaos_advisor", "seasonal_unlock_handler"],
    category_tag: "Seasonal Drop",
  },
  asst_AhdxKJOkBwuKEgrvqpbZJFH1: {
    // Occasion Mapper
    connected_features: ["business/custom-holidays", "cultural-respect", "group-gifting"],
    edge_functions: ["occasion_detection", "cultural_calendar"],
    category_tag: "Gifting Logic",
  },
  asst_xSuf7lto2ooTwl6ANpfSHNbQ: {
    // Agent Identity Optimizer
    connected_features: ["characters", "persona-selector", "gift-dna"],
    edge_functions: ["persona_matching", "identity_optimization"],
    category_tag: "Internal Bot",
  },
  asst_mVzUCLJMf8w34wEzuXGKuHLF: {
    // Knowledge Upload Bot
    connected_features: ["admin/feature-builder", "memory-vault", "analytics"],
    edge_functions: ["data_structuring", "knowledge_processing"],
    category_tag: "Internal Bot",
  },
}

serve(async (req) => {
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

    const { data: userProfile } = await supabaseClient.from("user_profiles").select("*").eq("id", user.id).single()

    const isAdmin = userProfile?.role === "admin" || userProfile?.email === "admin@agentgift.ai"

    const { action, data } = await req.json()

    switch (action) {
      case "fetch_universal": {
        // Fetch all assistants with universal tagging
        let query = supabaseClient.from("assistant_registry").select(`
            *,
            assistant_interactions(count)
          `)

        if (!isAdmin) {
          query = query.eq("is_active", true)
        }

        const { data: assistants, error } = await query.order("category_tag", { ascending: true })

        if (error) throw error

        // Enhance with universal tags
        const enhancedAssistants =
          assistants?.map((assistant) => {
            const connections = FEATURE_CONNECTIONS[assistant.assistant_id as keyof typeof FEATURE_CONNECTIONS]

            // Determine type
            let type = "user-facing"
            if (connections?.connected_features.some((f) => f.includes("admin"))) {
              type = "internal"
            } else if (connections?.connected_features.length > 2) {
              type = "hybrid"
            }

            // Determine API requirements
            const apiRequired = ["GPT"]
            if (assistant.voice_enabled) apiRequired.push("ElevenLabs")
            if (assistant.persona_hint) apiRequired.push("Whisper")

            // Determine status
            let status = "active"
            if (assistant.name.includes("Zola")) status = "seasonal"
            if (assistant.name.includes("Beta")) status = "beta"
            if (!assistant.is_active) status = "maintenance"

            return {
              ...assistant,
              type,
              tier_required:
                assistant.unlock_type === "loyalty_nft"
                  ? "NFT"
                  : assistant.unlock_type === "xp_level"
                    ? "XP_Unlock"
                    : assistant.tier,
              voice_persona: assistant.voice_enabled,
              api_required: apiRequired,
              connected_features: connections?.connected_features || [],
              category_tag: connections?.category_tag || "Internal Bot",
              status,
              linked_to: {
                feature_slugs: connections?.connected_features || [],
                edge_functions: connections?.edge_functions || [],
                xp_level: assistant.unlock_requirement,
              },
              interaction_count: assistant.assistant_interactions?.length || 0,
              performance_score: Math.random() * 100,
              user_satisfaction: Math.random() * 5,
            }
          }) || []

        return new Response(
          JSON.stringify({
            success: true,
            assistants: enhancedAssistants,
            user_tier: userProfile?.tier || "Free",
            user_level: userProfile?.level || 1,
            is_admin: isAdmin,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        )
      }

      case "sync_feature_connections": {
        if (!isAdmin) {
          throw new Error("Admin access required")
        }

        // Update all assistants with feature connections
        for (const [assistantId, connections] of Object.entries(FEATURE_CONNECTIONS)) {
          await supabaseClient
            .from("assistant_registry")
            .update({
              connected_features: connections.connected_features,
              category_tag: connections.category_tag,
              linked_to: {
                feature_slugs: connections.connected_features,
                edge_functions: connections.edge_functions,
              },
              updated_at: new Date().toISOString(),
            })
            .eq("assistant_id", assistantId)
        }

        return new Response(JSON.stringify({ success: true, message: "Feature connections synced" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }

      case "update_universal_tags": {
        if (!isAdmin) {
          throw new Error("Admin access required")
        }

        const { assistant_id, tags } = data

        const { error } = await supabaseClient
          .from("assistant_registry")
          .update({
            ...tags,
            updated_at: new Date().toISOString(),
          })
          .eq("assistant_id", assistant_id)

        if (error) throw error

        return new Response(JSON.stringify({ success: true, message: "Universal tags updated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }

      case "force_unlock": {
        if (!isAdmin) {
          throw new Error("Admin access required")
        }

        const { assistant_id, user_id } = data

        // Create temporary override
        const { error } = await supabaseClient.from("assistant_overrides").upsert({
          assistant_id,
          user_id,
          override_type: "force_unlock",
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_by: user.id,
        })

        if (error) throw error

        return new Response(JSON.stringify({ success: true, message: "Assistant temporarily unlocked" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }

      case "get_ecosystem_status": {
        // Get overall ecosystem health
        const { data: assistants } = await supabaseClient
          .from("assistant_registry")
          .select("is_active, status, category_tag")

        const { data: features } = await supabaseClient.from("agentgift_features").select("is_active, tier_access")

        const { data: interactions } = await supabaseClient
          .from("assistant_interactions")
          .select("created_at")
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        const ecosystemStatus = {
          total_assistants: assistants?.length || 0,
          active_assistants: assistants?.filter((a) => a.is_active).length || 0,
          total_features: features?.length || 0,
          active_features: features?.filter((f) => f.is_active).length || 0,
          daily_interactions: interactions?.length || 0,
          categories:
            assistants?.reduce(
              (acc, a) => {
                acc[a.category_tag] = (acc[a.category_tag] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            ) || {},
        }

        return new Response(JSON.stringify({ success: true, ecosystem_status: ecosystemStatus }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }

      default:
        throw new Error("Invalid action")
    }
  } catch (error) {
    console.error("Universal AI Plugin Loader error:", error)

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
