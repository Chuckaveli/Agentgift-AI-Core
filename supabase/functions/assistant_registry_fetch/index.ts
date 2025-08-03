import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Create Supabase client
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

    // Get the authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("No authorization header")
    }

    // Verify JWT token
    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error("Invalid authentication")
    }

    // Get user profile to check permissions
    const { data: userProfile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)
    }

    const isAdmin = userProfile?.role === "admin" || userProfile?.email === "admin@agentgift.ai"

    // Parse request body
    const { action, data } = await req.json()

    switch (action) {
      case "fetch_all": {
        // Fetch all assistants (filter inactive for non-admins)
        let query = supabaseClient.from("assistant_registry").select(`
            *,
            assistant_interactions!inner(count)
          `)

        if (!isAdmin) {
          query = query.eq("is_active", true)
        }

        const { data: assistants, error } = await query.order("category", { ascending: true })

        if (error) {
          throw error
        }

        // Add interaction counts
        const assistantsWithStats =
          assistants?.map((assistant) => ({
            ...assistant,
            interaction_count: assistant.assistant_interactions?.length || 0,
          })) || []

        return new Response(
          JSON.stringify({
            success: true,
            assistants: assistantsWithStats,
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

      case "seed": {
        if (!isAdmin) {
          throw new Error("Admin access required for seeding")
        }

        // Insert seed data
        const seedData = data.map((assistant: any) => ({
          ...assistant,
          is_active: true,
          interaction_count: 0,
          last_used: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        const { error } = await supabaseClient.from("assistant_registry").upsert(seedData, {
          onConflict: "assistant_id",
          ignoreDuplicates: false,
        })

        if (error) {
          throw error
        }

        return new Response(JSON.stringify({ success: true, message: "Assistants seeded successfully" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }

      case "toggle_active": {
        if (!isAdmin) {
          throw new Error("Admin access required")
        }

        const { assistant_id, is_active } = data

        const { error } = await supabaseClient
          .from("assistant_registry")
          .update({
            is_active: !is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", assistant_id)

        if (error) {
          throw error
        }

        return new Response(JSON.stringify({ success: true, message: "Assistant status updated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }

      case "get_stats": {
        // Get assistant usage statistics
        const { data: interactions, error } = await supabaseClient
          .from("assistant_interactions")
          .select("assistant_id, tokens_used, cost, created_at")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

        if (error) {
          throw error
        }

        // Aggregate stats by assistant
        const stats: Record<string, any> = {}
        interactions?.forEach((interaction) => {
          if (!stats[interaction.assistant_id]) {
            stats[interaction.assistant_id] = {
              total_interactions: 0,
              tokens_used: 0,
              total_cost: 0,
            }
          }

          stats[interaction.assistant_id].total_interactions++
          stats[interaction.assistant_id].tokens_used += interaction.tokens_used || 0
          stats[interaction.assistant_id].total_cost += Number.parseFloat(interaction.cost?.toString() || "0")
        })

        return new Response(JSON.stringify({ success: true, stats }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }

      case "log_interaction": {
        // Log assistant interaction
        const { assistant_id, input_message, response_message, tokens_used, cost } = data

        const { error } = await supabaseClient.from("assistant_interactions").insert([
          {
            user_id: user.id,
            assistant_id,
            input_message,
            response_message,
            user_tier: userProfile?.tier || "Free",
            user_xp_level: userProfile?.level || 1,
            tokens_used: tokens_used || 0,
            cost: cost || 0,
          },
        ])

        if (error) {
          throw error
        }

        // Award XP to user
        const { data: assistant } = await supabaseClient
          .from("assistant_registry")
          .select("xp_reward")
          .eq("assistant_id", assistant_id)
          .single()

        if (assistant?.xp_reward) {
          const { error: xpError } = await supabaseClient.rpc("add_user_xp", {
            user_id: user.id,
            xp_amount: assistant.xp_reward,
            reason: `Used assistant: ${assistant_id}`,
          })

          if (xpError) {
            console.error("XP award error:", xpError)
          }
        }

        return new Response(JSON.stringify({ success: true, message: "Interaction logged" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }

      default:
        throw new Error("Invalid action")
    }
  } catch (error) {
    console.error("Function error:", error)

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
