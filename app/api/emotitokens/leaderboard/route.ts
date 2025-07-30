import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has employee access
    const { data: profile } = await supabase.from("user_profiles").select("tier").eq("id", session.user.id).single()

    if (!profile || !["premium_spy", "pro_agent", "agent_00g", "admin", "super_admin"].includes(profile.tier)) {
      return NextResponse.json({ error: "Employee access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7)

    // Update leaderboard for current month
    await supabase.rpc("update_emoti_leaderboard", { target_month: month })

    // Get leaderboard data
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from("emoti_token_leaderboards")
      .select(`
        *,
        user_profiles (email, tier)
      `)
      .eq("month_year", month)
      .order("rank_position", { ascending: true })
      .limit(50)

    if (leaderboardError) {
      console.error("Error fetching leaderboard:", leaderboardError)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    // Get overall stats for the month
    const { data: stats, error: statsError } = await supabase
      .from("emoti_token_transactions")
      .select(`
        id,
        emoti_token_types (token_name, display_name, emoji)
      `)
      .eq("month_year", month)

    const monthlyStats = {
      total_transactions: 0,
      token_breakdown: {
        compassion: 0,
        wisdom: 0,
        energy: 0,
      },
      participation_rate: 0,
    }

    if (!statsError && stats) {
      monthlyStats.total_transactions = stats.length
      stats.forEach((transaction: any) => {
        const tokenName = transaction.emoti_token_types?.token_name
        if (
          tokenName &&
          monthlyStats.token_breakdown[tokenName as keyof typeof monthlyStats.token_breakdown] !== undefined
        ) {
          monthlyStats.token_breakdown[tokenName as keyof typeof monthlyStats.token_breakdown]++
        }
      })

      // Calculate participation rate (users who sent at least one token)
      const { count: activeUsers } = await supabase
        .from("emoti_token_transactions")
        .select("sender_id", { count: "exact", head: true })
        .eq("month_year", month)

      const { count: totalEmployees } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true })
        .in("tier", ["premium_spy", "pro_agent", "agent_00g", "admin", "super_admin"])

      if (totalEmployees && totalEmployees > 0) {
        monthlyStats.participation_rate = Math.round(((activeUsers || 0) / totalEmployees) * 100)
      }
    }

    return NextResponse.json({
      leaderboard: leaderboard || [],
      stats: monthlyStats,
      month,
    })
  } catch (error) {
    console.error("Error in EmotiTokens leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
