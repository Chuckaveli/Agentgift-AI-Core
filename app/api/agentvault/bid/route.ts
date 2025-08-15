import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { itemId, teamId, teamName, bidAmount, message, userId, userName } = await request.json()

    if (!itemId || !teamId || !bidAmount || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call the place_team_bid function
    const { data, error } = await supabase.rpc("place_team_bid", {
      p_item_id: itemId,
      p_team_id: teamId,
      p_team_name: teamName,
      p_bid_amount: bidAmount,
      p_user_id: userId,
      p_user_name: userName,
      p_bid_message: message || null,
    })

    if (error) throw error

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    // Generate excitement messages based on bid activity
    const excitementMessages = [
      "🔥 The competition heats up! Another team enters the fray!",
      "⚡ Bold move! The leaderboard is shifting!",
      "🎯 Direct hit! This item is getting serious attention!",
      "🚀 The bidding war intensifies! Who will claim victory?",
      "💎 A worthy challenger appears! The stakes are rising!",
    ]

    const randomMessage = excitementMessages[Math.floor(Math.random() * excitementMessages.length)]

    return NextResponse.json({
      success: true,
      isEdit: data.is_edit,
      newTopBid: data.new_top_bid,
      bidCount: data.bid_count,
      excitementMessage: randomMessage,
      actionType: data.is_edit ? "edited" : "placed",
    })
  } catch (error) {
    console.error("AgentVault bid error:", error)
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 })
  }
}
