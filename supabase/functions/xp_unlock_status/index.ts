import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/process.ts"

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

    const { data: userProfile } = await supabaseClient.from("user_profiles").select("*").eq("id", user.id).single()

    if (!userProfile) {
      throw new Error("User profile not found")
    }

    const { assistant_id, feature_slug } = await req.json()

    // Get unlock status for assistant or feature
    let unlockStatus = {}

    if (assistant_id) {
      const { data: assistant } = await supabaseClient
        .from("assistant_registry")
        .select("*")
        .eq("assistant_id", assistant_id)
        .single()

      if (assistant) {
        unlockStatus = calculateUnlockStatus(assistant, userProfile)
      }
    }

    if (feature_slug) {
      const { data: feature } = await supabaseClient
        .from("agentgift_features")
        .select("*")
        .eq("route_path", `/${feature_slug}`)
        .single()

      if (feature) {
        unlockStatus = calculateFeatureUnlockStatus(feature, userProfile)
      }
    }

    // Check for admin overrides
    const { data: override } = await supabaseClient
      .from("assistant_overrides")
      .select("*")
      .eq("user_id", user.id)
      .eq("assistant_id", assistant_id)
      .eq("override_type", "force_unlock")
      .gt("expires_at", new Date().toISOString())
      .single()

    if (override) {
      unlockStatus = {
        ...unlockStatus,
        has_access: true,
        override_active: true,
        override_expires: override.expires_at,
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        unlock_status: unlockStatus,
        user_profile: {
          tier: userProfile.tier,
          level: userProfile.level,
          xp_points: userProfile.xp_points,
          has_loyalty_nft: userProfile.has_loyalty_nft,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("XP unlock status error:", error)

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

function calculateUnlockStatus(assistant: any, userProfile: any) {
  const tierHierarchy = { Free: 0, Pro: 1, "Pro+": 2, Enterprise: 3 }

  switch (assistant.unlock_type) {
    case "tier":
      const userTierLevel = tierHierarchy[userProfile.tier as keyof typeof tierHierarchy] || 0
      const requiredTierLevel = tierHierarchy[assistant.tier as keyof typeof tierHierarchy] || 0

      return {
        has_access: userTierLevel >= requiredTierLevel,
        unlock_type: "tier",
        required_tier: assistant.tier,
        user_tier: userProfile.tier,
        progress_percentage: userTierLevel >= requiredTierLevel ? 100 : (userTierLevel / requiredTierLevel) * 100,
      }

    case "xp_level":
      const hasAccess = userProfile.level >= (assistant.unlock_requirement || 0)

      return {
        has_access: hasAccess,
        unlock_type: "xp_level",
        required_level: assistant.unlock_requirement,
        user_level: userProfile.level,
        progress_percentage: hasAccess ? 100 : Math.min(100, (userProfile.level / assistant.unlock_requirement) * 100),
      }

    case "loyalty_nft":
      const hasNFT = userProfile.has_loyalty_nft || (userProfile.loyalty_nfts && userProfile.loyalty_nfts.length > 0)

      return {
        has_access: hasNFT,
        unlock_type: "loyalty_nft",
        has_nft: hasNFT,
        nft_count: userProfile.loyalty_nfts?.length || 0,
        progress_percentage: hasNFT ? 100 : 0,
      }

    default:
      return {
        has_access: false,
        unlock_type: "unknown",
        progress_percentage: 0,
      }
  }
}

function calculateFeatureUnlockStatus(feature: any, userProfile: any) {
  const tierHierarchy = { Free: 0, Pro: 1, "Pro+": 2, Enterprise: 3 }
  const userTierLevel = tierHierarchy[userProfile.tier as keyof typeof tierHierarchy] || 0
  const requiredTierLevel = tierHierarchy[feature.tier_access as keyof typeof tierHierarchy] || 0

  return {
    has_access: userTierLevel >= requiredTierLevel,
    unlock_type: "tier",
    required_tier: feature.tier_access,
    user_tier: userProfile.tier,
    progress_percentage: userTierLevel >= requiredTierLevel ? 100 : (userTierLevel / requiredTierLevel) * 100,
    feature_name: feature.feature_name,
  }
}
