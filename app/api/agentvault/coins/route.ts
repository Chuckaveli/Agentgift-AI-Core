import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const companyId = searchParams.get("companyId")

    if (!userId || !companyId) {
      return NextResponse.json({ error: "Missing userId or companyId" }, { status: 400 })
    }

    // Get user's VaultCoin balance
    const { data: balance, error: balanceError } = await supabase
      .from("agentvault_coins")
      .select("*")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .single()

    if (balanceError && balanceError.code !== "PGRST116") {
      throw balanceError
    }

    // Get recent transactions
    const { data: transactions, error: transError } = await supabase
      .from("agentvault_coin_transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (transError) throw transError

    return NextResponse.json({
      balance: balance || {
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        last_earned_at: null,
      },
      transactions: transactions || [],
    })
  } catch (error) {
    console.error("AgentVault coins error:", error)
    return NextResponse.json({ error: "Failed to fetch VaultCoins" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, companyId, amount, source, sourceId, description } = await request.json()

    if (!userId || !companyId || !amount || !source) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Award VaultCoins using the database function
    const { data, error } = await supabase.rpc("award_vault_coins", {
      p_company_id: companyId,
      p_user_id: userId,
      p_amount: amount,
      p_source: source,
      p_source_id: sourceId || null,
      p_description: description || null,
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      awarded: amount,
      source,
    })
  } catch (error) {
    console.error("AgentVault award coins error:", error)
    return NextResponse.json({ error: "Failed to award VaultCoins" }, { status: 500 })
  }
}
