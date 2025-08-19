import { type NextRequest, NextResponse } from "next/server"
<<<<<<< HEAD
import { createServerClient } from "@/lib/supabase/clients"
import { verify } from "jsonwebtoken"
=======
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
>>>>>>> origin/main

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
<<<<<<< HEAD

    // Get authenticated user
    const supabase = getServerClient() => cookieStore })
=======
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
>>>>>>> origin/main
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

<<<<<<< HEAD
    // Use server client for admin operations
    const serverSupabase = getServerClient()

    // Start transaction-like operations
    let isNewUser = false
    let demoData = null

    // 1. Check/Create user profile
    const { data: existingProfile } = await serverSupabase
=======
    // Check if user already exists in our system
    const { data: existingUser, error: fetchError } = await supabase
>>>>>>> origin/main
      .from("user_profiles")
      .select("id, onboarded")
      .eq("id", user.id)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching user profile:", fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // If user doesn't exist, create profile
    if (!existingUser) {
      const { error: insertError } = await supabase.from("user_profiles").insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        onboarded: true,
        xp: 100, // Welcome bonus
        tier: "free",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating user profile:", insertError)
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
      }

      // Award welcome bonus XP
      const { error: xpError } = await supabase.from("user_xp").insert({
        user_id: user.id,
        amount: 100,
        source: "welcome_bonus",
        description: "Welcome to AgentGift.ai!",
        created_at: new Date().toISOString(),
      })

      if (xpError) {
        console.error("Error awarding welcome XP:", xpError)
        // Don't fail onboarding if XP fails
      }
    } else if (!existingUser.onboarded) {
      // Update existing user to mark as onboarded
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          onboarded: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("Error updating user profile:", updateError)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
      }
    }

    // Trigger Make.com webhook for new user onboarding
    if (process.env.MAKE_WEBHOOK_URL) {
      try {
        await fetch(process.env.MAKE_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: "user_onboarded",
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (webhookError) {
        console.error("Webhook error:", webhookError)
        // Don't fail onboarding if webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "User onboarded successfully",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
      },
    })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
