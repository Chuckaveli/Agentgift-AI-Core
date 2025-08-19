import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("agentvault_rewards").select("*")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const tier = searchParams.get("tier")

    let filteredRewards = data
    if (tier && tier !== "all") {
      filteredRewards = data.filter((reward) => reward.tier === tier)
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
  } catch (e: any) {
    console.error("Server error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
