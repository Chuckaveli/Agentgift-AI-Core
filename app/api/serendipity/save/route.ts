import { type NextRequest, NextResponse } from "next/server"
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { revelation_id, action } = body // action: 'save_vault', 'send_friend', 'use_ritual'

    // Get the revelation details
    const { data: revelation } = await supabase
      .from("serendipity_sessions")
      .select("*")
      .eq("id", revelation_id)
      .eq("user_id", session.user.id)
      .single()

    if (!revelation) {
      return NextResponse.json({ error: "Revelation not found" }, { status: 404 })
    }

    // Get user profile for tier checking
    const { data: profile } = await supabase.from("user_profiles").select("tier").eq("id", session.user.id).single()

    let xpAwarded = 0

    switch (action) {
      case "save_vault":
        // Save to user's gift vault
        await supabase.from("gift_vault").insert({
          user_id: session.user.id,
          gift_name: revelation.gift_name,
          gift_reasoning: revelation.gift_reasoning,
          emotional_benefit: revelation.emotional_benefit,
          source: "serendipity",
          source_id: revelation_id,
        })

        // Award XP for Pro+ users
        if (profile?.tier !== "free") {
          xpAwarded = 5
          await supabase.from("xp_logs").insert({
            user_id: session.user.id,
            xp_amount: xpAwarded,
            reason: "Saved serendipity gift to vault",
          })
        }
        break

      case "send_friend":
        // Record gift sharing
        await supabase.from("gift_shares").insert({
          user_id: session.user.id,
          gift_name: revelation.gift_name,
          share_type: "serendipity",
          source_id: revelation_id,
        })

        // Award XP and badge for Pro+ users
        if (profile?.tier !== "free") {
          xpAwarded = 5
          await supabase.from("xp_logs").insert({
            user_id: session.user.id,
            xp_amount: xpAwarded,
            reason: "Shared serendipity gift with friend",
          })

          // Award Soul-Gifter badge
          await supabase.from("user_badges").insert({
            user_id: session.user.id,
            badge_name: "Soul-Gifter",
            badge_description: "Shared emotional gifts with others",
            earned_at: new Date().toISOString(),
          })
        }
        break

      case "use_ritual":
        // Add to user's ritual calendar
        await supabase.from("gift_rituals").insert({
          user_id: session.user.id,
          gift_name: revelation.gift_name,
          ritual_type: "serendipity_followup",
          scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        })
        break
    }

    return NextResponse.json({
      success: true,
      xp_awarded: xpAwarded,
      message: `Gift ${action.replace("_", " ")} successfully!`,
    })
  } catch (error) {
    console.error("Serendipity save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
