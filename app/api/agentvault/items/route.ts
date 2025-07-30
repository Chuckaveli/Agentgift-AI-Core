import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get("tier")

    let query = supabase
      .from("vault_auction_items")
      .select(`
        *,
        bids:vault_auction_bids(
          id,
          team_name,
          bid_amount,
          is_current_winner,
          created_at,
          updated_at
        )
      `)
      .eq("is_active", true)
      .order("position_in_rotation", { ascending: true })

    if (tier && tier !== "all") {
      query = query.eq("tier", tier)
    }

    const { data: items, error } = await query

    if (error) throw error

    // Process items to add calculated fields
    const processedItems = items?.map((item) => {
      const sortedBids = item.bids?.sort((a: any, b: any) => b.bid_amount - a.bid_amount) || []
      const currentWinner = sortedBids.find((bid: any) => bid.is_current_winner)

      return {
        ...item,
        bidCount: item.bids?.length || 0,
        topBids: sortedBids.slice(0, 5), // Top 5 bids for leaderboard
        currentWinner: currentWinner || null,
        isHotItem: (item.bids?.length || 0) >= 3,
        lastBidTime: sortedBids[0]?.updated_at || sortedBids[0]?.created_at,
      }
    })

    return NextResponse.json({
      items: processedItems || [],
      total: processedItems?.length || 0,
    })
  } catch (error) {
    console.error("AgentVault items error:", error)
    return NextResponse.json({ error: "Failed to fetch auction items" }, { status: 500 })
  }
}
