import { type NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/clients"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get("tier")

    // Mock data since tables may not exist
    const mockItems = [
      {
        id: "1",
        title: "VIP Experience Package",
        description: "Exclusive access to premium features for 6 months",
        tier: "platinum",
        starting_bid: 500,
        current_bid: 750,
        position_in_rotation: 1,
        is_active: true,
        bids: [
          {
            id: "1",
            team_name: "Team Alpha",
            bid_amount: 750,
            is_current_winner: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            team_name: "Team Beta",
            bid_amount: 650,
            is_current_winner: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: "2",
        title: "Custom AI Assistant",
        description: "Personalized AI assistant trained on your preferences",
        tier: "gold",
        starting_bid: 300,
        current_bid: 425,
        position_in_rotation: 2,
        is_active: true,
        bids: [
          {
            id: "3",
            team_name: "Team Gamma",
            bid_amount: 425,
            is_current_winner: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      },
    ]

    let filteredItems = mockItems
    if (tier && tier !== "all") {
      filteredItems = mockItems.filter((item) => item.tier === tier)
    }

    // Process items to add calculated fields
    const processedItems = filteredItems.map((item) => {
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
