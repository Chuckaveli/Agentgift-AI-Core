import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Mock leaderboard data
    const mockLeaderboard = [
      {
        id: "1",
        user_id: "user-1",
        total_sent: 45,
        total_received: 32,
        net_impact: 77,
        rank: 1,
        user_profiles: { name: "Token Master", avatar_url: null },
      },
      {
        id: "2",
        user_id: "user-2",
        total_sent: 38,
        total_received: 28,
        net_impact: 66,
        rank: 2,
        user_profiles: { name: "Kindness King", avatar_url: null },
      },
      {
        id: "3",
        user_id: "user-3",
        total_sent: 35,
        total_received: 25,
        net_impact: 60,
        rank: 3,
        user_profiles: { name: "Generous Guru", avatar_url: null },
      },
    ]

    return NextResponse.json({ leaderboard: mockLeaderboard })
  } catch (error) {
    console.error("Error in EmotiTokens leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
