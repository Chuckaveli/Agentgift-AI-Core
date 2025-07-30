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

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    // Initialize tokens for user if not exists
    await supabase.rpc("initialize_monthly_tokens", {
      user_uuid: session.user.id,
      target_month: currentMonth,
    })

    // Get user's current token balances
    const { data: balances, error: balancesError } = await supabase
      .from("emoti_token_balances")
      .select(`
        *,
        emoti_token_types (
          token_name,
          display_name,
          emoji,
          description,
          color_hex,
          xp_value
        )
      `)
      .eq("user_id", session.user.id)
      .eq("month_year", currentMonth)

    if (balancesError) {
      console.error("Error fetching balances:", balancesError)
      return NextResponse.json({ error: "Failed to fetch token balances" }, { status: 500 })
    }

    // Get user's transaction history for current month
    const { data: sentTokens, error: sentError } = await supabase
      .from("emoti_token_transactions")
      .select(`
        *,
        emoti_token_types (display_name, emoji),
        receiver:user_profiles!emoti_token_transactions_receiver_id_fkey (email)
      `)
      .eq("sender_id", session.user.id)
      .eq("month_year", currentMonth)
      .order("created_at", { ascending: false })

    const { data: receivedTokens, error: receivedError } = await supabase
      .from("emoti_token_transactions")
      .select(`
        *,
        emoti_token_types (display_name, emoji),
        sender:user_profiles!emoti_token_transactions_sender_id_fkey (email)
      `)
      .eq("receiver_id", session.user.id)
      .eq("month_year", currentMonth)
      .order("created_at", { ascending: false })

    if (sentError || receivedError) {
      console.error("Error fetching transactions:", sentError || receivedError)
      return NextResponse.json({ error: "Failed to fetch transaction history" }, { status: 500 })
    }

    // Calculate days until reset
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      balances: balances || [],
      sent_tokens: sentTokens || [],
      received_tokens: receivedTokens || [],
      current_month: currentMonth,
      days_until_reset: daysUntilReset,
    })
  } catch (error) {
    console.error("Error in EmotiTokens balance API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
