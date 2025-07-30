import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    if (itemId) {
      // Get leaderboard for specific item
      const { data: itemBids, error: itemError } = await supabase
        .from("vault_auction_bids")
        .select("*")
        .eq("item_id", itemId)
        .order("bid_amount", { ascending: false })

      if (itemError) throw itemError

      return NextResponse.json({
        itemLeaderboard: itemBids || [],
        itemId,
      })
    }

    // Get overall leaderboard
    const { data: topTeams, error: teamsError } = await supabase
      .from("vault_coin_logs")
      .select("*")
      .eq("is_qualified", true)
      .order("total_earned", { ascending: false })
      .limit(20)

    if (teamsError) throw teamsError

    // Get current auction winners
    const { data: currentWinners, error: winnersError } = await supabase
      .from("vault_auction_bids")
      .select(`
        *,
        item:vault_auction_items(title, tier, tier_emoji)
      `)
      .eq("is_current_winner", true)
      .order("bid_amount", { ascending: false })

    if (winnersError) throw winnersError

    // Get auction activity stats
    const { data: activityStats, error: statsError } = await supabase
      .from("auction_participation_logs")
      .select("participation_type, created_at")
      .order("created_at", { ascending: false })
      .limit(100)

    if (statsError) throw statsError

    return NextResponse.json({
      topTeams: topTeams || [],
      currentWinners: currentWinners || [],
      activityStats: activityStats || [],
      totalQualifiedTeams: topTeams?.length || 0,
    })
  } catch (error) {
    console.error("AgentVault leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
