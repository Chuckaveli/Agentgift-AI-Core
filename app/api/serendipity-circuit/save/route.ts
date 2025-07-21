import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id } = body

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from("serendipity_sessions")
      .select("*")
      .eq("id", session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Update session as saved
    const { error: updateError } = await supabase
      .from("serendipity_sessions")
      .update({
        is_saved: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id)

    if (updateError) {
      throw updateError
    }

    // Add to user's vault
    const { error: vaultError } = await supabase.from("user_vault").insert({
      user_id: session.user_id,
      item_type: "serendipity_reveal",
      item_data: {
        gift_suggestion: session.gift_suggestion,
        occasion_type: session.occasion_type,
        emotional_state: session.emotional_state,
        revealed_at: session.created_at,
      },
      title: `Serendipity: ${session.gift_suggestion?.name}`,
      description: session.gift_suggestion?.why_fits,
    })

    if (vaultError) {
      console.error("Error saving to vault:", vaultError)
      // Don't fail the request if vault save fails
    }

    // Award bonus XP for saving
    const bonusXP = 5
    await supabase.from("xp_logs").insert({
      user_id: session.user_id,
      xp_amount: bonusXP,
      reason: "Serendipity Circuit - Saved to Vault",
      feature: "serendipity_circuit",
    })

    // Update session XP
    await supabase
      .from("serendipity_sessions")
      .update({
        xp_earned: session.xp_earned + bonusXP,
      })
      .eq("id", session_id)

    return NextResponse.json({
      success: true,
      bonus_xp: bonusXP,
      message: "Saved to vault successfully!",
    })
  } catch (error) {
    console.error("Error saving to vault:", error)
    return NextResponse.json({ error: "Failed to save to vault" }, { status: 500 })
  }
}
