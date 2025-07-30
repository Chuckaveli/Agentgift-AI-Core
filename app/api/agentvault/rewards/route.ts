import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get("tier")

    let query = supabase
      .from("agentvault_rewards")
      .select(`
        *,
        current_bids:agentvault_bids(
          id,
          bid_amount,
          anonymized_name,
          created_at,
          is_winning
        )
      `)
      .eq("is_active", true)
      .order("tier", { ascending: true })
      .order("current_bid", { ascending: false })

    if (tier) {
      query = query.eq("tier", tier)
    }

    const { data: rewards, error } = await query

    if (error) throw error

    // Process rewards to add bid counts and hot status
    const processedRewards = rewards?.map((reward) => ({
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
