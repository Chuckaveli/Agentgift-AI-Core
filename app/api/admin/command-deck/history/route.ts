import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")
    const limit = Number.parseInt(searchParams.get("limit") || "5")

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 })
    }

    // Verify admin status
    const supabase = createAdminClient()
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("admin_role")
      .eq("id", adminId)
      .single()

    if (profileError || !profile?.admin_role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let history: any[] = []
    let failureAlerts: any[] = []

    try {
      // Get command history
      const { data: historyData, error: historyError } = await supabase
        .from("assistant_interaction_logs")
        .select("*")
        .eq("user_id", adminId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (!historyError && historyData) {
        history = historyData.map((item) => ({
          id: item.id,
          command_text: item.command_input || item.action_type,
          bot_target: item.bot_name,
          action_taken: item.action_type,
          command_result: item.response_output,
          voice_input: item.command_input?.includes("voice") || false,
          created_at: item.created_at,
        }))
      }

      // Get failure alerts (bots with 3+ failures in 24h)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { data: alertsData, error: alertsError } = await supabase
        .from("assistant_interaction_logs")
        .select("bot_name")
        .eq("status", "error")
        .gte("created_at", twentyFourHoursAgo)

      if (!alertsError && alertsData) {
        const failureCounts = alertsData.reduce((acc: any, item: any) => {
          acc[item.bot_name] = (acc[item.bot_name] || 0) + 1
          return acc
        }, {})

        failureAlerts = Object.entries(failureCounts)
          .filter(([_, count]) => (count as number) >= 3)
          .map(([botName, count]) => ({
            bot_name: botName,
            failure_count: count,
          }))
      }
    } catch (error) {
      console.warn("Database not ready, using empty history:", error)
    }

    return NextResponse.json({
      success: true,
      history,
      failureAlerts,
      message: "History loaded successfully",
    })
  } catch (error) {
    console.error("Error loading history:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load history",
        history: [],
        failureAlerts: [],
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 })
    }

    // Verify admin status
    const supabase = createAdminClient()
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("admin_role")
      .eq("id", adminId)
      .single()

    if (profileError || !profile?.admin_role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    try {
      // Clear command history for this admin
      await supabase.from("assistant_interaction_logs").delete().eq("user_id", adminId)
    } catch (error) {
      console.warn("Failed to clear history from database:", error)
    }

    return NextResponse.json({
      success: true,
      message: "Command history cleared successfully",
    })
  } catch (error) {
    console.error("Error clearing history:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear history",
      },
      { status: 500 },
    )
  }
}
