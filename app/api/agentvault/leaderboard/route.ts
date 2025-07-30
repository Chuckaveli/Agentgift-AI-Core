import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get("seasonId")

    // Get auction winners and stats
    let query = supabase
      .from("agentvault_auction_history")
      .select(`
        *,
        reward:agentvault_rewards(name, tier, description),
        season:agentvault_seasons(season_name, season_type)
      `)
      .order("created_at", { ascending: false })

    if (seasonId) {
      query = query.eq("season_id", seasonId)
    }

    const { data: winners, error: winnersError } = await query.limit(50)

    if (winnersError) throw winnersError

    // Get top VaultCoin earners
    const { data: topEarners, error: earnersError } = await supabase
      .from("agentvault_coins")
      .select("*")
      .order("total_earned", { ascending: false })
      .limit(20)

    if (earnersError) throw earnersError

    // Get auction statistics
    const { data: stats, error: statsError } = await supabase
      .from("agentvault_auction_logs")
      .select("event_type, created_at")
      .order("created_at", { ascending: false })
      .limit(100)

    if (statsError) throw statsError

    // Process statistics
    const eventCounts =
      stats?.reduce((acc: any, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1
        return acc
      }, {}) || {}

    return NextResponse.json({
      winners: winners || [],
      topEarners: topEarners || [],
      stats: {
        totalBids: eventCounts.bid_placed || 0,
        totalWins: eventCounts.bid_won || 0,
        activeParticipants: topEarners?.length || 0,
        vaultCoinsCirculating: topEarners?.reduce((sum, earner) => sum + earner.balance, 0) || 0,
      },
    })
  } catch (error) {
    console.error("AgentVault leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
