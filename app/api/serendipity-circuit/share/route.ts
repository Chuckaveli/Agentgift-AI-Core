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

    // Update session as shared
    const { error: updateError } = await supabase
      .from("serendipity_sessions")
      .update({
        is_shared: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id)

    if (updateError) {
      throw updateError
    }

    // Award Soul-Gifter badge if first share
    const { data: existingBadge } = await supabase
      .from("user_badges")
      .select("id")
      .eq("user_id", session.user_id)
      .eq("badge_id", "soul_gifter")
      .single()

    if (!existingBadge) {
      await supabase.from("user_badges").insert({
        user_id: session.user_id,
        badge_id: "soul_gifter",
        earned_at: new Date().toISOString(),
        context: "First Serendipity Circuit share",
      })

      // Award badge XP
      await supabase.from("xp_logs").insert({
        user_id: session.user_id,
        xp_amount: 10,
        reason: "Badge Earned: Soul-Gifter",
        feature: "badges",
      })
    }

    // Award sharing XP
    const shareXP = 5
    await supabase.from("xp_logs").insert({
      user_id: session.user_id,
      xp_amount: shareXP,
      reason: "Serendipity Circuit - Shared Reveal",
      feature: "serendipity_circuit",
    })

    // Update session XP
    await supabase
      .from("serendipity_sessions")
      .update({
        xp_earned: session.xp_earned + shareXP,
      })
      .eq("id", session_id)

    return NextResponse.json({
      success: true,
      share_xp: shareXP,
      badge_earned: !existingBadge ? "soul_gifter" : null,
      message: "Shared successfully!",
    })
  } catch (error) {
    console.error("Error sharing reveal:", error)
    return NextResponse.json({ error: "Failed to share reveal" }, { status: 500 })
  }
}
