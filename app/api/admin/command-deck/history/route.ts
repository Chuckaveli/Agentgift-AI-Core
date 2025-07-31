import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")
    const limit = Number.parseInt(searchParams.get("limit") || "5")

    // Verify admin access
    const { data: admin } = await supabase
      .from("user_profiles")
      .select("id, name, admin_role")
      .eq("id", adminId)
      .single()

    if (!admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get recent command history
    const { data: history, error } = await supabase
      .from("command_history")
      .select("*")
      .eq("user_id", adminId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Get bot failure alerts
    const { data: failureAlerts } = await supabase.rpc("check_bot_failure_alerts")

    return NextResponse.json({
      success: true,
      history: history || [],
      failureAlerts: failureAlerts || [],
    })
  } catch (error) {
    console.error("Command history error:", error)
    return NextResponse.json({ error: "Failed to fetch command history", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")

    // Verify admin access
    const { data: admin } = await supabase
      .from("user_profiles")
      .select("id, name, admin_role")
      .eq("id", adminId)
      .single()

    if (!admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Clear command history for this admin
    const { error } = await supabase.from("command_history").delete().eq("user_id", adminId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Command history cleared",
    })
  } catch (error) {
    console.error("Clear history error:", error)
    return NextResponse.json({ error: "Failed to clear command history", details: error.message }, { status: 500 })
  }
}
