import { type NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/clients"
import { analytics } from "@/lib/analytics"

export async function POST(request: NextRequest) {
  try {
    const { userId, email, metadata } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        email,
        xp: 100, // Welcome bonus
        tier: "free",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
    }

    // Award welcome badge
    const { error: badgeError } = await supabase.from("user_badges").insert({
      user_id: userId,
      badge_id: "welcome-explorer",
      earned_at: new Date().toISOString(),
    })

    if (badgeError) {
      console.error("Badge award error:", badgeError)
    }

    // Track successful onboarding
    await analytics.track("user_onboarded", {
      user_id: userId,
      email,
      welcome_xp: 100,
      metadata,
    })

    return NextResponse.json({
      success: true,
      profile,
      welcomeBonus: 100,
    })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      {
        error: "Failed to complete onboarding",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
