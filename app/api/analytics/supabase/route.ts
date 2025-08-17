import { type NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/clients"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const supabase = getAdminClient()

    // Validate payload structure
    if (!payload.event || typeof payload.event !== "string") {
      return NextResponse.json({ error: "Invalid event data" }, { status: 400 })
    }

    // Store analytics event in Supabase
    const { data, error } = await supabase
      .from("analytics_events")
      .insert({
        event_name: payload.event,
        properties: payload.properties || {},
        user_id: payload.userId || null,
        session_id: payload.properties?.sessionId || null,
        timestamp: payload.timestamp || new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Supabase analytics error:", error)
      return NextResponse.json(
        {
          error: "Failed to store analytics",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Analytics Supabase error:", error)
    return NextResponse.json(
      {
        error: "Failed to store analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
