import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Get current auction status using the database function
    const { data: status, error: statusError } = await supabase.rpc("get_auction_status")

    if (statusError) {
      console.error("Status error:", statusError)
      throw statusError
    }

    const auctionStatus = status?.[0] || {
      is_live: false,
      phase: "cooldown",
      season: "Winter 2025",
      time_remaining: null,
      next_auction: null,
    }

    // Get participating teams count
    const { data: teamsData, error: teamsError } = await supabase
      .from("vault_coin_logs")
      .select("team_id")
      .eq("is_qualified", true)

    if (teamsError) {
      console.error("Teams error:", teamsError)
    }

    // Get active items count
    const { data: itemsData, error: itemsError } = await supabase
      .from("vault_auction_items")
      .select("id")
      .eq("is_active", true)

    if (itemsError) {
      console.error("Items error:", itemsError)
    }

    // Calculate time remaining in milliseconds
    let timeRemainingMs = null
    if (auctionStatus.time_remaining) {
      // Convert PostgreSQL interval to milliseconds
      const intervalMatch = auctionStatus.time_remaining.match(/(\d+):(\d+):(\d+)/)
      if (intervalMatch) {
        const [, hours, minutes, seconds] = intervalMatch
        timeRemainingMs =
          (Number.parseInt(hours) * 3600 + Number.parseInt(minutes) * 60 + Number.parseInt(seconds)) * 1000
      }
    }

    return NextResponse.json({
      isAuctionLive: auctionStatus.is_live,
      phase: auctionStatus.phase,
      currentSeason: auctionStatus.season,
      timeRemaining: timeRemainingMs,
      nextAuctionDate: auctionStatus.next_auction,
      stats: {
        qualifiedTeams: teamsData?.length || 0,
        activeItems: itemsData?.length || 0,
        totalBids: 0, // Will be calculated from bids table
      },
    })
  } catch (error) {
    console.error("AgentVault status error:", error)
    return NextResponse.json({ error: "Failed to get auction status" }, { status: 500 })
  }
}
