import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Mock leaderboard data
    const mockLeaderboard = [
      {
        id: "1",
        user_id: "user-1",
        season: season || "2024-winter",
        xp_earned: 1250,
        completion_time: 1800, // 30 minutes in seconds
        clues_found: 8,
        hints_used: 2,
        rank_position: 1,
        user_profiles: { name: "Ghost Hunter Pro", avatar_url: null },
      },
      {
        id: "2",
        user_id: "user-2",
        season: season || "2024-winter",
        xp_earned: 1100,
        completion_time: 2100, // 35 minutes
        clues_found: 7,
        hints_used: 3,
        rank_position: 2,
        user_profiles: { name: "Mystery Solver", avatar_url: null },
      },
      {
        id: "3",
        user_id: "user-3",
        season: season || "2024-winter",
        xp_earned: 950,
        completion_time: 2400, // 40 minutes
        clues_found: 6,
        hints_used: 4,
        rank_position: 3,
        user_profiles: { name: "Clue Master", avatar_url: null },
      },
    ]

    return NextResponse.json({ leaderboard: mockLeaderboard.slice(0, limit) })
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
