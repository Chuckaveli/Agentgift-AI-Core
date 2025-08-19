import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("great_samaritan_participants").select("*")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get("sortBy") || "total_game_actions"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const filterTier = searchParams.get("filterTier")
    const search = searchParams.get("search")

    let filteredParticipants = data

    // Apply filters
    if (filterTier && filterTier !== "all") {
      filteredParticipants = filteredParticipants.filter((p) => p.award_tier === filterTier)
    }

    if (search) {
      filteredParticipants = filteredParticipants.filter((p) => p.username.toLowerCase().includes(search.toLowerCase()))
    }

    // Apply sorting
    filteredParticipants.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] as number
      const bVal = b[sortBy as keyof typeof b] as number
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal
    })

    const summary = {
      total_participants: data.length,
      lunch_qualified: data.filter((p) => p.lunch_drop_qualified).length,
      tier_breakdown: {
        Platinum: data.filter((p) => p.award_tier === "Platinum").length,
        Gold: data.filter((p) => p.award_tier === "Gold").length,
        Silver: data.filter((p) => p.award_tier === "Silver").length,
        Bronze: data.filter((p) => p.award_tier === "Bronze").length,
        Novice: data.filter((p) => p.award_tier === "Novice").length,
      },
    }

    return NextResponse.json({
      participants: filteredParticipants,
      summary,
    })
  } catch (e: any) {
    console.error("Server error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
