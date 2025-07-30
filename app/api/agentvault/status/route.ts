import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Get current active season
    const { data: activeSeason, error: seasonError } = await supabase
      .from("agentvault_seasons")
      .select("*")
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString())
      .single()

    if (seasonError && seasonError.code !== "PGRST116") {
      throw seasonError
    }

    // Get auction statistics
    const { data: stats, error: statsError } = await supabase.rpc("get_vault_auction_stats")

    if (statsError) {
      console.error("Stats error:", statsError)
    }

    // Calculate time remaining
    let timeRemaining = null
    if (activeSeason) {
      const endTime = new Date(activeSeason.end_date).getTime()
      const now = new Date().getTime()
      timeRemaining = Math.max(0, endTime - now)
    }

    return NextResponse.json({
      isActive: !!activeSeason,
      season: activeSeason,
      timeRemaining,
      stats: stats || {
        totalBids: 0,
        activeRewards: 0,
        eligibleCompanies: 0,
        vaultCoinsCirculating: 0,
      },
    })
  } catch (error) {
    console.error("AgentVault status error:", error)
    return NextResponse.json({ error: "Failed to get vault status" }, { status: 500 })
  }
}
