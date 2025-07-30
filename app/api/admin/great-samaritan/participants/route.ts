import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get("sortBy") || "total_game_actions"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const filterTier = searchParams.get("filterTier")
    const search = searchParams.get("search")

    // Build query
    let query = supabase.from("great_samaritan_participant_view").select("*")

    // Apply filters
    if (filterTier && filterTier !== "all") {
      query = query.eq("award_tier", filterTier)
    }

    if (search) {
      query = query.ilike("username", `%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data: participants, error } = await query

    if (error) {
      console.error("Error fetching participants:", error)
      return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
    }

    // Get summary stats
    const { data: stats, error: statsError } = await supabase
      .from("great_samaritan_participant_view")
      .select("award_tier, lunch_drop_qualified")

    if (statsError) {
      console.error("Error fetching stats:", statsError)
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }

    const summary = {
      total_participants: stats?.length || 0,
      lunch_qualified: stats?.filter((s) => s.lunch_drop_qualified).length || 0,
      tier_breakdown: {
        Platinum: stats?.filter((s) => s.award_tier === "Platinum").length || 0,
        Gold: stats?.filter((s) => s.award_tier === "Gold").length || 0,
        Silver: stats?.filter((s) => s.award_tier === "Silver").length || 0,
        Bronze: stats?.filter((s) => s.award_tier === "Bronze").length || 0,
        Novice: stats?.filter((s) => s.award_tier === "Novice").length || 0,
      },
    }

    return NextResponse.json({
      participants: participants || [],
      summary,
    })
  } catch (error) {
    console.error("Error in great-samaritan participants API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
