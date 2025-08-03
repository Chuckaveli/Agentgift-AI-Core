import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"

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
    let userTier = "Free"

    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "")
        const {
          data: { user },
        } = await supabaseClient.auth.getUser(token)

        if (user) {
          const { data: profile } = await supabaseClient.from("user_profiles").select("tier").eq("id", user.id).single()

          if (profile) {
            userTier = profile.tier
          }
        }
      } catch (error) {
        console.log("Auth error, defaulting to Free tier:", error)
      }
    }

    const { category, tier_access, route_path, connected_to_assistant } = await req.json()

    // Build query based on user tier
    let query = supabaseClient.from("agentgift_features").select("*").eq("is_active", true)

    // Apply tier-based filtering
    const allowedTiers = getTiersForUser(userTier)
    query = query.in("tier_access", allowedTiers)

    // Apply additional filters
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (tier_access && tier_access !== "all") {
      query = query.eq("tier_access", tier_access)
    }

    if (route_path) {
      query = query.ilike("route_path", `%${route_path}%`)
    }

    // Filter by assistant connections
    if (connected_to_assistant) {
      query = query.contains("connected_assistants", [connected_to_assistant])
    }

    query = query.order("category").order("feature_name")

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return new Response(JSON.stringify({ error: "Failed to fetch features" }), { status: 500 })
    }

    return new Response(JSON.stringify(data || []), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
  }
})

function getTiersForUser(userTier: string): string[] {
  switch (userTier) {
    case "Enterprise":
      return ["Free", "Pro", "Pro+", "Enterprise"]
    case "Pro+":
      return ["Free", "Pro", "Pro+"]
    case "Pro":
      return ["Free", "Pro"]
    default:
      return ["Free"]
  }
}
