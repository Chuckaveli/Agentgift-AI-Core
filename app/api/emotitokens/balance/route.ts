import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"

export const dynamic = "force-dynamic"

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data: balance, error } = await supabase
      .from("emotitokens_balances")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error fetching balance:", error)
      return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
    }

    // If no balance exists, create one with 0 tokens
    if (!balance) {
      const { data: newBalance, error: createError } = await supabase
        .from("emotitokens_balances")
        .insert([
          {
            user_id: userId,
            total_tokens: 0,
            available_tokens: 0,
            locked_tokens: 0,
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Error creating balance:", createError)
        return NextResponse.json({ error: "Failed to create balance" }, { status: 500 })
      }

      return NextResponse.json({ balance: newBalance })
    }

    return NextResponse.json({ balance })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, amount, transaction_type, description } = body

    if (!user_id || amount === undefined || !transaction_type) {
      return NextResponse.json({ error: "User ID, amount, and transaction type are required" }, { status: 400 })
    }

    // Get current balance
    const { data: currentBalance, error: balanceError } = await supabase
      .from("emotitokens_balances")
      .select("*")
      .eq("user_id", user_id)
      .single()

    if (balanceError && balanceError.code !== "PGRST116") {
      console.error("Error fetching current balance:", balanceError)
      return NextResponse.json({ error: "Failed to fetch current balance" }, { status: 500 })
    }

    let newBalance
    if (!currentBalance) {
      // Create new balance
      const initialAmount = transaction_type === "credit" ? amount : 0
      const { data: createdBalance, error: createError } = await supabase
        .from("emotitokens_balances")
        .insert([
          {
            user_id,
            total_tokens: initialAmount,
            available_tokens: initialAmount,
            locked_tokens: 0,
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Error creating balance:", createError)
        return NextResponse.json({ error: "Failed to create balance" }, { status: 500 })
      }

      newBalance = createdBalance
    } else {
      // Update existing balance
      const totalChange = transaction_type === "credit" ? amount : -amount
      const newTotal = currentBalance.total_tokens + totalChange
      const newAvailable = currentBalance.available_tokens + totalChange

      if (newAvailable < 0) {
        return NextResponse.json({ error: "Insufficient tokens" }, { status: 400 })
      }

      const { data: updatedBalance, error: updateError } = await supabase
        .from("emotitokens_balances")
        .update({
          total_tokens: newTotal,
          available_tokens: newAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating balance:", updateError)
        return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
      }

      newBalance = updatedBalance
    }

    // Log the transaction
    const { error: logError } = await supabase.from("emotitokens_transactions").insert([
      {
        user_id,
        amount,
        transaction_type,
        description,
        balance_after: newBalance.available_tokens,
      },
    ])

    if (logError) {
      console.error("Error logging transaction:", logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ balance: newBalance }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
