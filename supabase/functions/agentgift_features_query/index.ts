import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"

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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    // Get request body and auth header
    const { category, tier_access, route_path } = await req.json()
    const authHeader = req.headers.get("Authorization")

    // Determine user tier and admin status
    let userTier = "Free"
    let isAdmin = false

    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "")
        const {
          data: { user },
          error: userError,
        } = await supabaseClient.auth.getUser(token)

        if (user && !userError) {
          // Get user profile
          const { data: profile } = await supabaseClient
            .from("user_profiles")
            .select("tier, email, role")
            .eq("id", user.id)
            .single()

          if (profile) {
            userTier = profile.tier || "Free"
            isAdmin = profile.email === "admin@agentgift.ai" || profile.role === "admin"
          }
        }
      } catch (error) {
        console.log("Auth error, defaulting to Free tier:", error)
      }
    }

    // Build query based on user tier and admin status
    let query = supabaseClient.from("agentgift_features").select(`
        id,
        feature_name,
        description,
        tier_access,
        category,
        route_path,
        is_active,
        created_at,
        updated_at,
        xp_value,
        persona_hint,
        lottie_url,
        is_gamified,
        unlock_xp_required
      `)

    // Apply tier-based filtering (admins see all)
    if (!isAdmin) {
      query = query.eq("is_active", true)

      // Filter by accessible tiers
      const allowedTiers = getTiersForUser(userTier)
      query = query.in("tier_access", allowedTiers)
    }

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

    // Order by category and feature name
    query = query.order("category").order("feature_name")

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return new Response(JSON.stringify({ error: "Failed to fetch features" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(data || []), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Function error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
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
