import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get("sortBy") || "total_game_actions"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const filterTier = searchParams.get("filterTier")
    const search = searchParams.get("search")

    // Mock participants data since tables may not exist
    const mockParticipants = [
      {
        id: "1",
        username: "GiftMaster2024",
        total_game_actions: 156,
        xp_earned: 2340,
        award_tier: "Platinum",
        lunch_drop_qualified: true,
        last_activity: new Date().toISOString(),
      },
      {
        id: "2",
        username: "KindnessKing",
        total_game_actions: 142,
        xp_earned: 2130,
        award_tier: "Gold",
        lunch_drop_qualified: true,
        last_activity: new Date(Date.now() - 60000).toISOString(),
      },
      {
        id: "3",
        username: "GenerousGuru",
        total_game_actions: 98,
        xp_earned: 1470,
        award_tier: "Silver",
        lunch_drop_qualified: false,
        last_activity: new Date(Date.now() - 120000).toISOString(),
      },
      {
        id: "4",
        username: "CareCompanion",
        total_game_actions: 76,
        xp_earned: 1140,
        award_tier: "Bronze",
        lunch_drop_qualified: false,
        last_activity: new Date(Date.now() - 180000).toISOString(),
      },
      {
        id: "5",
        username: "NewHelper",
        total_game_actions: 34,
        xp_earned: 510,
        award_tier: "Novice",
        lunch_drop_qualified: false,
        last_activity: new Date(Date.now() - 240000).toISOString(),
      },
    ]

    let filteredParticipants = mockParticipants

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
      total_participants: mockParticipants.length,
      lunch_qualified: mockParticipants.filter((p) => p.lunch_drop_qualified).length,
      tier_breakdown: {
        Platinum: mockParticipants.filter((p) => p.award_tier === "Platinum").length,
        Gold: mockParticipants.filter((p) => p.award_tier === "Gold").length,
        Silver: mockParticipants.filter((p) => p.award_tier === "Silver").length,
        Bronze: mockParticipants.filter((p) => p.award_tier === "Bronze").length,
        Novice: mockParticipants.filter((p) => p.award_tier === "Novice").length,
      },
    }

    return NextResponse.json({
      participants: filteredParticipants,
      summary,
    })
  } catch (error) {
    console.error("Error in great-samaritan participants API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
