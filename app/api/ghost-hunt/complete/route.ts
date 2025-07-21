import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const { sessionId, userId, completed, finalXP, badges, completionTime, successScore } = body

    // Update session as completed
    const { data: session, error: sessionError } = await supabase
      .from("ghost_hunt_sessions")
      .update({
        is_active: false,
        completed,
        total_xp: finalXP,
        completion_time: completionTime,
        success_score: successScore,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single()

    if (sessionError) throw sessionError

    // Award badges
    if (badges && badges.length > 0) {
      const badgeInserts = badges.map((badge: string) => ({
        user_id: userId,
        badge_name: badge,
        hunt_session_id: sessionId,
        earned_at: new Date().toISOString(),
      }))

      const { error: badgeError } = await supabase.from("ghost_hunt_badges").insert(badgeInserts)

      if (badgeError) throw badgeError
    }

    // Update user XP in profile
    const { error: profileError } = await supabase.rpc("add_user_xp", {
      user_id: userId,
      xp_amount: finalXP,
    })

    if (profileError) throw profileError

    // Create leaderboard entry
    const { error: leaderboardError } = await supabase.from("ghost_hunt_leaderboard").insert({
      user_id: userId,
      session_id: sessionId,
      hunt_name: session.hunt_name,
      season: session.season,
      xp_earned: finalXP,
      success_score: successScore,
      completion_time: completionTime,
      badges_earned: badges?.length || 0,
    })

    if (leaderboardError) throw leaderboardError

    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error("Error completing ghost hunt:", error)
    return NextResponse.json(
      {
        error: "Failed to complete hunt",
      },
      { status: 500 },
    )
  }
}
