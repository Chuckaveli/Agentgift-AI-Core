import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let query = supabase
      .from("ghost_hunt_leaderboard")
      .select(`
        *,
        user_profiles:user_id (
          name,
          avatar_url
        )
      `)
      .order("xp_earned", { ascending: false })
      .order("completion_time", { ascending: true })
      .limit(limit)

    if (season) {
      query = query.eq("season", season)
    }

    const { data: leaderboard, error } = await query

    if (error) throw error

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
      },
      { status: 500 },
    )
  }
}
