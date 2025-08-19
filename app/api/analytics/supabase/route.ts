import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()

    // Validate required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log("Supabase configuration missing")
      return NextResponse.json({ success: false, error: "Supabase not configured" }, { status: 400 })
    }

    // Create admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert event into analytics_events table
    const { error } = await supabase.from("analytics_events").insert({
      event_name: eventData.event,
      properties: eventData.properties || {},
      session_id: eventData.session_id,
      user_id: eventData.user_id,
      timestamp: eventData.timestamp || new Date().toISOString(),
    })

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Supabase analytics error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
