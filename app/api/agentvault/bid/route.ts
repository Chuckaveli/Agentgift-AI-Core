import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { rewardId, bidAmount, message, companyId, userId } = await request.json()

    if (!rewardId || !bidAmount || !companyId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call the place_vault_bid function
    const { data, error } = await supabase.rpc("place_vault_bid", {
      p_reward_id: rewardId,
      p_company_id: companyId,
      p_user_id: userId,
      p_bid_amount: bidAmount,
      p_bid_message: message || null,
    })

    if (error) throw error

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    // Generate Orion narration based on bid intensity
    const orionNarrations = [
      "A bold move from the shadows! The vault trembles with anticipation...",
      "The bidding war intensifies! Who will claim this treasure?",
      "Fascinating... another contender enters the fray!",
      "The vault's energy surges! This item calls to many souls...",
      "Impressive dedication! The legacy grows stronger with each bid...",
    ]

    const narration = orionNarrations[Math.floor(Math.random() * orionNarrations.length)]

    // Update the auction log with Orion's narration
    await supabase.from("agentvault_auction_logs").update({ orion_narration: narration }).eq("id", data.bid_id)

    return NextResponse.json({
      success: true,
      bidId: data.bid_id,
      anonymizedName: data.anonymized_name,
      newCurrentBid: data.new_current_bid,
      orionNarration: narration,
    })
  } catch (error) {
    console.error("AgentVault bid error:", error)
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 })
  }
}
