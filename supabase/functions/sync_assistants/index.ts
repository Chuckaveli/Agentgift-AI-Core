import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const token = authHeader.replace("Bearer ", "")

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

    if (token !== supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Invalid service role key" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (req.method === "POST") {
      const assistants: AssistantSyncData[] = await req.json()

      if (!Array.isArray(assistants)) {
        return new Response(JSON.stringify({ error: "Request body must be an array of assistants" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const results = []
      const errors = []

      for (const assistant of assistants) {
        try {
          // Validate required fields
          if (!assistant.id || !assistant.name || !assistant.type) {
            errors.push({
              assistant_id: assistant.id || "unknown",
              error: "Missing required fields: id, name, or type",
            })
            continue
          }

          // Prepare data for upsert
          const assistantData = {
            assistant_id: assistant.id,
            name: assistant.name,
            description: assistant.description || "",
            category: assistant.category_tag.toLowerCase().replace(/\s+/g, "_"),
            tier: assistant.tier_required === "XP_Unlock" ? "Free" : assistant.tier_required,
            unlock_type: assistant.unlock_type || (assistant.tier_required === "XP_Unlock" ? "xp_level" : "tier"),
            unlock_requirement: assistant.unlock_requirement || assistant.linked_to.xp_unlock || null,
            icon: assistant.linked_to.emoji || "bot",
            persona_hint: assistant.persona_hint || "",
            voice_enabled: assistant.voice_enabled || assistant.voice_persona,
            is_active: assistant.is_active,
            xp_reward: assistant.xp_reward || 5,

            // Universal Plugin Loader Tags
            type: assistant.type,
            tier_required: assistant.tier_required,
            voice_persona: assistant.voice_persona,
            api_required: assistant.api_required,
            connected_features: assistant.connected_features,
            category_tag: assistant.category_tag,
            status: assistant.status,
            linked_to: assistant.linked_to,

            // Performance Metrics
            performance_score: assistant.performance_score || 0.0,
            user_satisfaction: assistant.user_satisfaction || 0.0,
            interaction_count: 0, // Will be updated by actual usage
            last_used: null,

            updated_at: new Date().toISOString(),
          }

          // Upsert assistant record
          const { data, error } = await supabase
            .from("assistant_registry")
            .upsert(assistantData, {
              onConflict: "assistant_id",
              ignoreDuplicates: false,
            })
            .select()
            .single()

          if (error) {
            errors.push({
              assistant_id: assistant.id,
              error: error.message,
            })
            continue
          }

          // Update connected features if they exist
          if (assistant.connected_features.length > 0) {
            for (const featureName of assistant.connected_features) {
              // Try to find and update the feature
              const { error: featureError } = await supabase
                .from("agentgift_features")
                .update({
                  connected_assistants: supabase.rpc("array_append", {
                    arr: "connected_assistants",
                    elem: assistant.id,
                  }),
                  updated_at: new Date().toISOString(),
                })
                .ilike("feature_name", `%${featureName}%`)

              if (featureError) {
                console.warn(`Failed to update feature ${featureName}:`, featureError.message)
              }
            }
          }

          // Log the sync operation
          await supabase.from("system_health_logs").insert({
            component: "assistant_sync",
            status: "healthy",
            metrics: {
              assistant_id: assistant.id,
              assistant_name: assistant.name,
              sync_type: "upsert",
              connected_features_count: assistant.connected_features.length,
              api_requirements: assistant.api_required,
            },
          })

          results.push({
            assistant_id: assistant.id,
            name: assistant.name,
            status: "synced",
            database_id: data.id,
          })
        } catch (err) {
          errors.push({
            assistant_id: assistant.id || "unknown",
            error: err.message,
          })
        }
      }

      // Update ecosystem health snapshot
      try {
        await supabase.rpc("update_ecosystem_health_snapshot")
      } catch (healthError) {
        console.warn("Failed to update ecosystem health:", healthError.message)
      }

      const response = {
        success: true,
        synced_count: results.length,
        error_count: errors.length,
        results,
        errors,
        timestamp: new Date().toISOString(),
      }

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // GET method - fetch current assistant registry
    if (req.method === "GET") {
      const { data: assistants, error } = await supabase
        .from("assistant_registry")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      return new Response(
        JSON.stringify({
          success: true,
          assistants,
          count: assistants.length,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Sync assistants error:", error)

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
})
