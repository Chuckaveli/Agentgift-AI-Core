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

    const { data: settings } = await supabase.from("admin_voice_settings").select("*").eq("admin_id", adminId).single()

    if (!settings) {
      // Create default settings
      const { data: newSettings } = await supabase
        .from("admin_voice_settings")
        .insert({
          admin_id: adminId,
          selected_voice: "avelyn",
          voice_speed: 1.0,
          voice_pitch: 1.0,
          auto_speak: true,
          stealth_logging: false,
          analysis_mode: false,
        })
        .select()
        .single()

      return NextResponse.json({ success: true, settings: newSettings })
    }

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { adminId, settings } = await request.json()

    // Verify admin access
    const { data: admin } = await supabase.from("user_profiles").select("id, admin_role").eq("id", adminId).single()

    if (!admin?.admin_role) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { data: updatedSettings } = await supabase
      .from("admin_voice_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("admin_id", adminId)
      .select()
      .single()

    // Log the settings change
    await supabase.from("admin_dashboard_logs").insert({
      admin_id: adminId,
      session_id: `settings-${Date.now()}`,
      action_type: "settings_update",
      action_detail: `Updated voice settings: ${Object.keys(settings).join(", ")}`,
      request_data: settings,
      execution_status: "completed",
    })

    return NextResponse.json({ success: true, settings: updatedSettings })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
