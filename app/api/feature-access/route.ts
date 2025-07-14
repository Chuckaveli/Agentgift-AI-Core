import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { checkFeatureAccess, recordFeatureUsage, type FeatureKey } from "@/lib/feature-access"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
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

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feature = searchParams.get("feature")

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

    if (feature) {
      const accessResult = checkFeatureAccess(
        user.tier,
        feature as FeatureKey,
        user.trial_features_used,
        user.feature_usage,
      )
      return NextResponse.json({ accessResult, user })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Feature access API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
