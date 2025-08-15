import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

interface SignupData {
  email: string
  password: string
  name: string
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, sessionId }: SignupData = await request.json()

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        display_name: name,
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Failed to create account" }, { status: 400 })
    }

    const userId = authData.user.id

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: userId,
      email,
      name,
      tier: "free",
      xp: 100, // Welcome bonus
      level: 1,
      credits: 5, // Starting credits
      created_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Continue even if profile creation fails
    }

    // Link questionnaire session to user if provided
    if (sessionId) {
      await supabase.from("gift_questionnaire_sessions").update({ user_id: userId }).eq("session_id", sessionId)
    }

    // Log welcome XP
    await supabase.from("xp_logs").insert({
      user_id: userId,
      action: "welcome_bonus",
      xp_earned: 100,
      description: "Welcome to AgentGift.ai!",
      created_at: new Date().toISOString(),
    })

    // Generate magic link for immediate login
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    })

    return NextResponse.json({
      success: true,
      userId,
      message: "Account created successfully!",
      magicLink: linkData?.properties?.action_link,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
