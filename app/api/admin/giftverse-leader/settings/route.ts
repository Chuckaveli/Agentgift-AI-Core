import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 })
    }

    // Verify admin access
    const { data: admin } = await supabase
      .from("user_profiles")
      .select("id, name, admin_role")
      .eq("id", adminId)
      .single()

    if (!admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get voice settings
    const { data: settings } = await supabase.from("admin_voice_settings").select("*").eq("admin_id", adminId).single()

    return NextResponse.json({
      success: true,
      settings: settings || {
        selected_voice: "avelyn",
        voice_speed: 1.0,
        auto_speak: true,
        stealth_mode: false,
        analysis_mode: false,
      },
    })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch settings", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminId, settings } = await request.json()

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID required" }, { status: 400 })
    }

    // Verify admin access
    const { data: admin } = await supabase
      .from("user_profiles")
      .select("id, name, admin_role")
      .eq("id", adminId)
      .single()

    if (!admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Update voice settings
    const { data: updatedSettings, error } = await supabase
      .from("admin_voice_settings")
      .upsert({
        admin_id: adminId,
        selected_voice: settings.selected_voice || "avelyn",
        voice_speed: settings.voice_speed || 1.0,
        auto_speak: settings.auto_speak !== undefined ? settings.auto_speak : true,
        stealth_mode: settings.stealth_mode !== undefined ? settings.stealth_mode : false,
        analysis_mode: settings.analysis_mode !== undefined ? settings.analysis_mode : false,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log the settings change
    await supabase.from("admin_dashboard_logs").insert({
      admin_id: adminId,
      session_id: `settings_${Date.now()}`,
      action_type: "settings_update",
      action_detail: "Voice settings updated",
      request_data: settings,
      response_data: updatedSettings,
      execution_status: "completed",
      execution_time_ms: Date.now(),
    })

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings", details: error.message }, { status: 500 })
  }
}
