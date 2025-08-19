import { type NextRequest, NextResponse } from "next/server"
<<<<<<< HEAD
import { checkFeatureAccess, recordFeatureUsage, type FeatureKey } from "@/lib/feature-access"

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { feature, action, isTrial = false } = await request.json()

    if (!feature) {
      return NextResponse.json({ error: "Feature is required" }, { status: 400 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const user = {
      id: profile.id,
      email: profile.email,
      tier: profile.tier || "free_agent",
      trial_features_used: profile.trial_features_used || [],
      feature_usage: profile.feature_usage || {},
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }

    switch (action) {
      case "check":
        const accessResult = checkFeatureAccess(
          user.tier,
          feature as FeatureKey,
          user.trial_features_used,
          user.feature_usage,
        )
        return NextResponse.json({ accessResult, user })

      case "use":
        const canUse = checkFeatureAccess(
          user.tier,
          feature as FeatureKey,
          user.trial_features_used,
          user.feature_usage,
        )

        if (!canUse.hasAccess && !isTrial) {
          return NextResponse.json({ error: "Access denied", accessResult: canUse }, { status: 403 })
        }

        if (isTrial && !canUse.canTrial) {
          return NextResponse.json({ error: "Trial not available", accessResult: canUse }, { status: 403 })
        }

        await recordFeatureUsage(user.id, feature as FeatureKey, isTrial)

        return NextResponse.json({
          success: true,
          message: isTrial ? "Trial activated" : "Feature used successfully",
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Feature access API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
=======
import { getServerClient } from "@/lib/supabase/clients"

export const dynamic = "force-dynamic"
>>>>>>> origin/main

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feature = searchParams.get("feature")

    // Mock user profile with tier
    const mockProfile = {
      id: session.user.id,
      tier: "free", // free, pro, premium, enterprise
      xp_balance: 150,
      features_unlocked: ["basic_search", "gift_suggestions"],
      daily_usage: {
        gift_suggestions: 2,
        smart_search: 1,
        cultural_insights: 0,
      },
      limits: {
        gift_suggestions: 3,
        smart_search: 5,
        cultural_insights: 1,
      },
    }

    // Feature access rules
    const featureAccess = {
      basic_search: { tiers: ["free", "pro", "premium", "enterprise"], daily_limit: null },
      gift_suggestions: { tiers: ["free", "pro", "premium", "enterprise"], daily_limit: 3 },
      smart_search: { tiers: ["pro", "premium", "enterprise"], daily_limit: 10 },
      cultural_insights: { tiers: ["premium", "enterprise"], daily_limit: null },
      ai_concierge: { tiers: ["premium", "enterprise"], daily_limit: null },
      group_gifting: { tiers: ["enterprise"], daily_limit: null },
    }

    if (feature) {
      const access = featureAccess[feature as keyof typeof featureAccess]
      const hasAccess = access?.tiers.includes(mockProfile.tier) || false
      const dailyUsage = mockProfile.daily_usage[feature as keyof typeof mockProfile.daily_usage] || 0
      const dailyLimit = mockProfile.limits[feature as keyof typeof mockProfile.limits]
      const canUse = hasAccess && (dailyLimit === null || dailyUsage < dailyLimit)

      return NextResponse.json({
        feature,
        has_access: hasAccess,
        can_use: canUse,
        daily_usage: dailyUsage,
        daily_limit: dailyLimit,
        tier: mockProfile.tier,
      })
    }

    // Return all feature access
    const allAccess = Object.entries(featureAccess).map(([featureName, access]) => {
      const hasAccess = access.tiers.includes(mockProfile.tier)
      const dailyUsage = mockProfile.daily_usage[featureName as keyof typeof mockProfile.daily_usage] || 0
      const dailyLimit = mockProfile.limits[featureName as keyof typeof mockProfile.limits]
      const canUse = hasAccess && (dailyLimit === null || dailyUsage < dailyLimit)

      return {
        feature: featureName,
        has_access: hasAccess,
        can_use: canUse,
        daily_usage: dailyUsage,
        daily_limit: dailyLimit,
      }
    })

    return NextResponse.json({
      user_tier: mockProfile.tier,
      xp_balance: mockProfile.xp_balance,
      features: allAccess,
    })
  } catch (error) {
    console.error("Feature access API error:", error)
    return NextResponse.json({ error: "Failed to check feature access" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { feature, action = "use" } = body

    if (!feature) {
      return NextResponse.json({ error: "Feature is required" }, { status: 400 })
    }

    // Mock usage tracking
    const usageLog = {
      id: Date.now().toString(),
      user_id: session.user.id,
      feature,
      action,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      usage_log: usageLog,
    })
  } catch (error) {
    console.error("Feature access API error:", error)
    return NextResponse.json({ error: "Failed to log feature usage" }, { status: 500 })
  }
}
