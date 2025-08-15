import { type NextRequest, NextResponse } from "next/server"
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const body = await request.json()

    const { userId, huntName, season, userTier, participationType, deliveryMedium, toneStyle } = body

    // Check if user has existing active session
    const { data: existingSession } = await supabase
      .from("ghost_hunt_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (existingSession) {
      return NextResponse.json(
        {
          error: "You already have an active hunt session",
        },
        { status: 400 },
      )
    }

    // Check free tier limits
    if (userTier === "Free") {
      const today = new Date().toISOString().split("T")[0]
      const { data: todaysSessions } = await supabase
        .from("ghost_hunt_sessions")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`)

      if (todaysSessions && todaysSessions.length >= 1) {
        return NextResponse.json(
          {
            error: "Free tier users can only play one hunt per day",
          },
          { status: 400 },
        )
      }
    }

    // Create new session
    const { data: session, error } = await supabase
      .from("ghost_hunt_sessions")
      .insert({
        user_id: userId,
        hunt_name: huntName,
        season,
        user_tier: userTier,
        participation_type: participationType,
        delivery_medium: deliveryMedium,
        tone_style: toneStyle,
        current_clue: 0,
        total_xp: 0,
        is_active: true,
        time_remaining: 1200, // 20 minutes
        start_time: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error("Error creating ghost hunt session:", error)
    return NextResponse.json(
      {
        error: "Failed to create hunt session",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: session, error } = await supabase
      .from("ghost_hunt_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (error && error.code !== "PGRST116") throw error

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Error fetching ghost hunt session:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch session",
      },
      { status: 500 },
    )
  }
}
