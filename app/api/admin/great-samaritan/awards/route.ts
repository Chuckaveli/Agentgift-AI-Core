import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/clients"

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { award_type, user_ids, award_period, admin_id, bonus_rewards = [] } = body

    // Validate required fields
    if (!award_type || !user_ids || !Array.isArray(user_ids) || !award_period || !admin_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user data for awards
    const { data: users, error: usersError } = await supabase
      .from("great_samaritan_participant_view")
      .select("*")
      .in("user_id", user_ids)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
    }

    // Create award records
    const awards =
      users?.map((user) => ({
        user_id: user.user_id,
        award_type,
        award_period,
        xp_at_award: user.xp_total,
        total_actions: user.total_game_actions,
        qualifying_features: ["EmotionCraft", "Sentiment Sync", "Culture Cam", "Spin the Wheel"], // Default features
        awarded_by: admin_id,
        status: "active",
      })) || []

    const { data: createdAwards, error: awardsError } = await supabase
      .from("great_samaritan_awards")
      .insert(awards)
      .select()

    if (awardsError) {
      console.error("Error creating awards:", awardsError)
      return NextResponse.json({ error: "Failed to create awards" }, { status: 500 })
    }

    // Handle bonus rewards if specified
    if (bonus_rewards.length > 0) {
      const bonusRecords = user_ids.flatMap((user_id: string) =>
        bonus_rewards.map((reward: string) => ({
          user_id,
          reward_type: reward,
          awarded_by: admin_id,
          status: "pending",
        })),
      )

      const { error: bonusError } = await supabase.from("bonus_rewards_log").insert(bonusRecords)

      if (bonusError) {
        console.error("Error creating bonus rewards:", bonusError)
        // Don't fail the whole request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      awards: createdAwards,
      message: `Successfully created ${createdAwards?.length || 0} awards`,
    })
  } catch (error) {
    console.error("Error in great-samaritan awards API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { searchParams } = new URL(request.url)
    const award_period = searchParams.get("award_period")
    const award_type = searchParams.get("award_type")

    let query = supabase
      .from("great_samaritan_awards")
      .select(`
        *,
        user_profiles!great_samaritan_awards_user_id_fkey(email),
        awarded_by_profile:user_profiles!great_samaritan_awards_awarded_by_fkey(email)
      `)
      .order("awarded_at", { ascending: false })

    if (award_period) {
      query = query.eq("award_period", award_period)
    }

    if (award_type) {
      query = query.eq("award_type", award_type)
    }

    const { data: awards, error } = await query

    if (error) {
      console.error("Error fetching awards:", error)
      return NextResponse.json({ error: "Failed to fetch awards" }, { status: 500 })
    }

    return NextResponse.json({ awards: awards || [] })
  } catch (error) {
    console.error("Error in great-samaritan awards GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
