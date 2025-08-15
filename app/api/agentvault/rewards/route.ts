import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export const dynamic = "force-dynamic"

const supabase = createAdminClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get("tier")

    // Mock data since tables may not exist
    const mockRewards = [
      {
        id: "1",
        title: "Premium Gift Consultation",
        description: "1-hour personalized gift consultation with our experts",
        tier: "gold",
        starting_bid: 100,
        current_bid: 150,
        ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        current_bids: [
          {
            id: "1",
            bid_amount: 150,
            anonymized_name: "Agent007",
            created_at: new Date().toISOString(),
            is_winning: true,
          },
          {
            id: "2",
            bid_amount: 125,
            anonymized_name: "GiftMaster",
            created_at: new Date().toISOString(),
            is_winning: false,
          },
        ],
      },
      {
        id: "2",
        title: "Exclusive Gift Box",
        description: "Curated luxury gift box worth $500",
        tier: "platinum",
        starting_bid: 200,
        current_bid: 275,
        ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        current_bids: [
          {
            id: "3",
            bid_amount: 275,
            anonymized_name: "LuxuryLover",
            created_at: new Date().toISOString(),
            is_winning: true,
          },
        ],
      },
    ]

    let filteredRewards = mockRewards
    if (tier && tier !== "all") {
      filteredRewards = mockRewards.filter((reward) => reward.tier === tier)
    }

    // Process rewards to add bid counts and hot status
    const processedRewards = filteredRewards.map((reward) => ({
      ...reward,
      bidCount: reward.current_bids?.length || 0,
      isHot: (reward.current_bids?.length || 0) >= 3,
      highestBid: reward.current_bid || reward.starting_bid,
      timeLeft: reward.ends_at ? Math.max(0, new Date(reward.ends_at).getTime() - new Date().getTime()) : null,
    }))

    return NextResponse.json({
      rewards: processedRewards || [],
      total: processedRewards?.length || 0,
    })
  } catch (error) {
    console.error("AgentVault rewards error:", error)
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
  }
}
