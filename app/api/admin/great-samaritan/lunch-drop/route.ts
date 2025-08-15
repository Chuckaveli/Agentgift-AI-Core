import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/clients"

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { user_id, drop_type = "manual_admin", admin_id, webhook_url, delivery_notes } = body

    if (!user_id || !admin_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create lunch drop log
    const { data: lunchDrop, error } = await supabase
      .from("lunch_drop_logs")
      .insert({
        user_id,
        drop_type,
        triggered_by: admin_id,
        webhook_url,
        delivery_notes,
        webhook_status: webhook_url ? "pending" : "sent",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating lunch drop:", error)
      return NextResponse.json({ error: "Failed to create lunch drop" }, { status: 500 })
    }

    // If webhook URL provided, trigger it
    if (webhook_url) {
      try {
        const webhookResponse = await fetch(webhook_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id,
            drop_type,
            lunch_drop_id: lunchDrop.id,
            triggered_at: new Date().toISOString(),
          }),
        })

        const webhookStatus = webhookResponse.ok ? "sent" : "failed"

        // Update webhook status
        await supabase.from("lunch_drop_logs").update({ webhook_status }).eq("id", lunchDrop.id)
      } catch (webhookError) {
        console.error("Webhook error:", webhookError)
        await supabase.from("lunch_drop_logs").update({ webhook_status: "failed" }).eq("id", lunchDrop.id)
      }
    }

    return NextResponse.json({
      success: true,
      lunch_drop: lunchDrop,
      message: "Lunch drop triggered successfully",
    })
  } catch (error) {
    console.error("Error in lunch-drop API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data: lunchDrops, error } = await supabase
      .from("lunch_drop_logs")
      .select(`
        *,
        user_profiles!lunch_drop_logs_user_id_fkey(email),
        triggered_by_profile:user_profiles!lunch_drop_logs_triggered_by_fkey(email)
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching lunch drops:", error)
      return NextResponse.json({ error: "Failed to fetch lunch drops" }, { status: 500 })
    }

    return NextResponse.json({ lunch_drops: lunchDrops || [] })
  } catch (error) {
    console.error("Error in lunch-drop GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
