import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamName, seasonTheme, teamSize, avgXpLevel, tone, userTier, userId } = body

    // Create heist session
    const { data: session, error } = await supabase
      .from("thought_heist_sessions")
      .insert({
        team_name: teamName,
        season_theme: seasonTheme,
        team_size: teamSize,
        avg_xp_level: avgXpLevel,
        tone,
        user_tier: userTier,
        user_id: userId,
        current_phase: 0,
        time_remaining: 1800,
        score: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error creating heist session:", error)
    return NextResponse.json({ error: "Failed to create heist session" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get user's active sessions
    const { data: sessions, error } = await supabase
      .from("thought_heist_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching heist sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}
