import { type NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/clients"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    if (itemId) {
      // Mock item-specific leaderboard
      const mockItemBids = [
        { id: "1", item_id: itemId, team_name: "Team Alpha", bid_amount: 750, created_at: new Date().toISOString() },
        { id: "2", item_id: itemId, team_name: "Team Beta", bid_amount: 650, created_at: new Date().toISOString() },
        { id: "3", item_id: itemId, team_name: "Team Gamma", bid_amount: 600, created_at: new Date().toISOString() },
      ]

      return NextResponse.json({
        itemLeaderboard: mockItemBids,
        itemId,
      })
    }

    // Mock overall leaderboard data
    const mockTopTeams = [
      { id: "1", team_name: "Team Alpha", total_earned: 2500, is_qualified: true, rank: 1 },
      { id: "2", team_name: "Team Beta", total_earned: 2200, is_qualified: true, rank: 2 },
      { id: "3", team_name: "Team Gamma", total_earned: 1800, is_qualified: true, rank: 3 },
      { id: "4", team_name: "Team Delta", total_earned: 1500, is_qualified: true, rank: 4 },
      { id: "5", team_name: "Team Echo", total_earned: 1200, is_qualified: true, rank: 5 },
    ]

    const mockCurrentWinners = [
      {
        id: "1",
        team_name: "Team Alpha",
        bid_amount: 750,
        is_current_winner: true,
        item: { title: "VIP Experience Package", tier: "platinum", tier_emoji: "💎" },
      },
      {
        id: "2",
        team_name: "Team Gamma",
        bid_amount: 425,
        is_current_winner: true,
        item: { title: "Custom AI Assistant", tier: "gold", tier_emoji: "🥇" },
      },
    ]

    const mockActivityStats = [
      { participation_type: "bid_placed", created_at: new Date().toISOString() },
      { participation_type: "item_viewed", created_at: new Date(Date.now() - 60000).toISOString() },
      { participation_type: "bid_placed", created_at: new Date(Date.now() - 120000).toISOString() },
    ]

    return NextResponse.json({
      topTeams: mockTopTeams,
      currentWinners: mockCurrentWinners,
      activityStats: mockActivityStats,
      totalQualifiedTeams: mockTopTeams.length,
    })
  } catch (error) {
    console.error("AgentVault leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
