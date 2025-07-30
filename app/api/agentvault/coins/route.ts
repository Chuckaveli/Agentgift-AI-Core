import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")

    if (!teamId) {
      return NextResponse.json({ error: "Missing teamId" }, { status: 400 })
    }

    // Get team's VibeCoins balance
    const { data: balance, error: balanceError } = await supabase
      .from("vault_coin_logs")
      .select("*")
      .eq("team_id", teamId)
      .single()

    if (balanceError && balanceError.code !== "PGRST116") {
      throw balanceError
    }

    // Get recent transactions
    const { data: transactions, error: transError } = await supabase
      .from("vault_coin_transactions")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(20)

    if (transError) throw transError

    return NextResponse.json({
      balance: balance || {
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        is_qualified: false,
        min_xp_met: false,
        event_participation_count: 0,
      },
      transactions: transactions || [],
    })
  } catch (error) {
    console.error("AgentVault coins error:", error)
    return NextResponse.json({ error: "Failed to fetch VibeCoins" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { teamId, amount, source, sourceId, description, userId } = await request.json()

    if (!teamId || !amount || !source) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Award VibeCoins using the database function
    const { data, error } = await supabase.rpc("award_vibe_coins", {
      p_team_id: teamId,
      p_amount: amount,
      p_source: source,
      p_source_id: sourceId || null,
      p_description: description || null,
      p_user_id: userId || null,
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      awarded: amount,
      source,
    })
  } catch (error) {
    console.error("AgentVault award coins error:", error)
    return NextResponse.json({ error: "Failed to award VibeCoins" }, { status: 500 })
  }
}
