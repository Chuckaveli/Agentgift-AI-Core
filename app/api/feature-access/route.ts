import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase/clients"

export const dynamic = "force-dynamic"

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
