import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"

export const dynamic = "force-dynamic"

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const timeframe = searchParams.get("timeframe") || "all_time" // all_time, monthly, weekly

    let query = supabase
      .from("agentvault_leaderboard")
      .select(
        `
        *,
        user_profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      `,
      )
      .order("total_coins", { ascending: false })
      .limit(limit)

    // Apply timeframe filter if needed
    if (timeframe === "monthly") {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      query = query.gte("last_updated", startOfMonth.toISOString())
    } else if (timeframe === "weekly") {
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      query = query.gte("last_updated", startOfWeek.toISOString())
    }

    const { data: leaderboard, error } = await query

    if (error) {
      console.error("Error fetching leaderboard:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    // Add ranking
    const rankedLeaderboard = leaderboard?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

    return NextResponse.json({ leaderboard: rankedLeaderboard })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, coins_earned, activity_type, metadata } = body

    if (!user_id || coins_earned === undefined) {
      return NextResponse.json({ error: "User ID and coins earned are required" }, { status: 400 })
    }

    // Update or create leaderboard entry
    const { data: existingEntry } = await supabase
      .from("agentvault_leaderboard")
      .select("*")
      .eq("user_id", user_id)
      .single()

    let result
    if (existingEntry) {
      // Update existing entry
      const { data: updatedEntry, error } = await supabase
        .from("agentvault_leaderboard")
        .update({
          total_coins: existingEntry.total_coins + coins_earned,
          total_activities: existingEntry.total_activities + 1,
          last_activity_type: activity_type,
          last_updated: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .select()
        .single()

      if (error) {
        console.error("Error updating leaderboard entry:", error)
        return NextResponse.json({ error: "Failed to update leaderboard" }, { status: 500 })
      }

      result = updatedEntry
    } else {
      // Create new entry
      const { data: newEntry, error } = await supabase
        .from("agentvault_leaderboard")
        .insert([
          {
            user_id,
            total_coins: coins_earned,
            total_activities: 1,
            last_activity_type: activity_type,
            metadata,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating leaderboard entry:", error)
        return NextResponse.json({ error: "Failed to create leaderboard entry" }, { status: 500 })
      }

      result = newEntry
    }

    return NextResponse.json({ entry: result }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
