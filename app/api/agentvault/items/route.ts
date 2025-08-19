import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("agentvault_items").select("*")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch auction items" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const tier = searchParams.get("tier")

    let filteredItems = data
    if (tier && tier !== "all") {
      filteredItems = data.filter((item: any) => item.tier === tier)
    }

    // Process items to add calculated fields
    const processedItems = filteredItems.map((item: any) => {
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
  } catch (e: any) {
    console.error("Server error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
